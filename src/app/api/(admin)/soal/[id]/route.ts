import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { deleteAudioIfUnused } from "@/libs/audio-storage";
import { z } from "zod";

const updateExamSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  totalOption: z.coerce.number().int().min(0).max(10),
  totalSession: z.coerce.number().int().min(0).max(20),
  useCategoryScore: z.boolean(),
  scoringType: z.string().optional(),
  showCorrection: z.boolean(),
  minScoreToShow: z.coerce.number().int().min(0).nullable().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        questions: {
          include: {
            options: true,
            categoryPenilaian: true,
            section: true,
          },
          orderBy: [{ section: { order: "asc" } }, { order: "asc" }],
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("GET SOAL ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = updateExamSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.exam.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Exam tidak ditemukan" }, { status: 404 });
    }

    const program = await prisma.program.findUnique({
      where: { id: validated.data.categoryId },
      select: { id: true },
    });
    if (!program) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 400 });
    }

    const data = await prisma.exam.update({
      where: { id: params.id },
      data: validated.data,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("UPDATE SOAL ERROR:", error);
    return NextResponse.json({ error: "Gagal update soal" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const exam = await prisma.exam.findUnique({ where: { id: params.id } });
    if (!exam) {
      return NextResponse.json({ error: "Exam tidak ditemukan" }, { status: 404 });
    }

    const usedInUjian = await prisma.ujian.findFirst({
      where: { questionBankId: params.id },
    });

    if (usedInUjian) {
      return NextResponse.json(
        { error: `Exam ini masih dipakai di ujian "${usedInUjian.title}", tidak dapat dihapus` },
        { status: 400 }
      );
    }

    // CATAT DULU URL AUDIO-NYA (soalnya akan terhapus)
    const questionsWithAudio = await prisma.question.findMany({
      where: { examId: params.id, audioUrl: { not: null } },
      select: { audioUrl: true },
    });

    // ) HAPUS DATABASE DULU — options, lalu questions, lalu exam
    await prisma.$transaction([
      prisma.questionOption.deleteMany({
        where: { question: { examId: params.id } },
      }),
      prisma.question.deleteMany({
        where: { examId: params.id },
      }),
      prisma.exam.delete({
        where: { id: params.id },
      }),
    ]);

    await deleteAudioIfUnused(questionsWithAudio.map((q) => q.audioUrl));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE SOAL ERROR:", error);
    return NextResponse.json({ error: "Gagal hapus soal" }, { status: 500 });
  }
}