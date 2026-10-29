import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { deleteAudioIfUnused } from "@/libs/audio-storage";
import { findUsedQuestionIds } from "@/libs/question-usage";
import {
  prepareQuestion,
  questionBodySchema,
} from "@/libs/question-validation";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const data = await prisma.question.findUnique({
      where: { id: params.id },
      include: { options: true, section: true },
    });

    if (!data) {
      return NextResponse.json(
        { error: "Soal tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET QUESTION ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const id = params.id;

    const question = await prisma.question.findUnique({ where: { id } });

    if (!question) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { examId, sectionId, order, audioUrl } = question;

    // PENGAMAN: soal yang sudah pernah dipakai peserta tidak boleh dihapus
    const used = await findUsedQuestionIds([id]);
    if (used.length > 0) {
      return NextResponse.json(
        {
          error:
            "Soal ini sudah pernah dipakai peserta, jadi tidak bisa dihapus.",
        },
        { status: 409 },
      );
    }

    // 1) HAPUS DATABASE DULU
    await prisma.$transaction([
      prisma.questionOption.deleteMany({ where: { questionId: id } }),
      prisma.question.delete({ where: { id } }),
      prisma.question.updateMany({
        where: { examId, sectionId, order: { gt: order } },
        data: { order: { decrement: 1 } },
      }),
    ]);

    // 2) BARU HAPUS FILE AUDIO (kalau tidak dipakai soal lain)
    await deleteAudioIfUnused([audioUrl]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE QUESTION ERROR:", error);
    return NextResponse.json({ error: "Gagal delete soal" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = questionBodySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 },
      );
    }

    const existing = await prisma.question.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Soal tidak ditemukan" },
        { status: 404 },
      );
    }

    // 🔥 VALIDASI + SANITASI (URL audio lama yang tidak diubah tetap boleh)
    const prepared = await prepareQuestion(validated.data, {
      currentAudioUrl: existing.audioUrl,
    });
    if (!prepared.ok) {
      return NextResponse.json({ error: prepared.error }, { status: 400 });
    }
    const p = prepared.value;

    // 🔥 PINDAH SECTION: taruh di urutan terakhir section tujuan, rapatkan urutan section asal
    const sectionChanged = existing.sectionId !== p.sectionId;
    let order = existing.order;
    if (sectionChanged) {
      const last = await prisma.question.findFirst({
        where: { examId: existing.examId, sectionId: p.sectionId },
        orderBy: { order: "desc" },
      });
      order = (last?.order || 0) + 1;
    }

    await prisma.$transaction([
      ...(sectionChanged
        ? [
            prisma.question.updateMany({
              where: {
                examId: existing.examId,
                sectionId: existing.sectionId,
                order: { gt: existing.order },
              },
              data: { order: { decrement: 1 } },
            }),
          ]
        : []),
      prisma.question.update({
        where: { id: params.id },
        data: {
          type: p.type,
          sectionId: p.sectionId,
          order,
          categoryPenilaianId: p.categoryId,
          questionText: p.questionText,
          directionText: p.directionText,
          audioUrl: p.audioUrl,
          audioPlayLimit: p.audioLimit,
          timeLimit: p.timeLimit,
          correctAnswer: p.correctAnswer,
          explanation: p.explanation,
        },
      }),
      // pilihan selalu diganti; soal bertipe DIRECTION tidak punya pilihan
      prisma.questionOption.deleteMany({ where: { questionId: params.id } }),
      ...(p.type === "QUESTION"
        ? [
            prisma.questionOption.createMany({
              data: p.options.map((o) => ({ questionId: params.id, ...o })),
            }),
          ]
        : []),
    ]);

    // HAPUS AUDIO LAMA SETELAH DATABASE BERHASIL (kalau diganti atau dihapus)
    if (existing.audioUrl && existing.audioUrl !== p.audioUrl) {
      await deleteAudioIfUnused([existing.audioUrl]);
    }

    const updated = await prisma.question.findUnique({
      where: { id: params.id },
      include: { section: true, options: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE QUESTION ERROR:", error);
    return NextResponse.json({ error: "Gagal update soal" }, { status: 500 });
  }
}
