import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { supabaseAdmin } from "@/libs/supabase-admin";
import { z } from "zod";

const bulkDeleteSchema = z.object({
  questionIds: z.array(z.string()).min(1, "Pilih minimal 1 soal"),
});

function getAudioPath(url: string): string | null {
  const marker = "/object/public/audio/";
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = bulkDeleteSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 },
      );
    }
    const { questionIds } = validated.data;

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });
    if (questions.length === 0) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }

    // 1) HAPUS DATABASE DULU
    await prisma.$transaction([
      prisma.examAudioTrack.deleteMany({ where: { questionId: { in: questionIds } } }),
      prisma.questionOption.deleteMany({ where: { questionId: { in: questionIds } } }),
      prisma.question.deleteMany({ where: { id: { in: questionIds } } }),
    ]);

    // 2) BARU HAPUS FILE AUDIO (kecuali masih dipakai soal lain)
    const urls = [
      ...new Set(questions.map((q) => q.audioUrl).filter((u): u is string => !!u)),
    ];
    if (urls.length > 0) {
      const stillUsed = await prisma.question.findMany({
        where: { audioUrl: { in: urls } },
        select: { audioUrl: true },
      });
      const usedSet = new Set(stillUsed.map((q) => q.audioUrl));
      const paths = urls
        .filter((u) => !usedSet.has(u))
        .map(getAudioPath)
        .filter((p): p is string => !!p);

      if (paths.length > 0) {
        const { error: storageError } = await supabaseAdmin.storage
          .from("audio")
          .remove(paths);
        if (storageError) console.error("DELETE AUDIO FILES ERROR:", storageError);
      }
    }

    // 3) REORDER per section yang terdampak
    const affectedSections = [
      ...new Set(questions.map((q) => `${q.examId}::${q.sectionId}`)),
    ];
    for (const key of affectedSections) {
      const [examId, sectionId] = key.split("::");
      const remaining = await prisma.question.findMany({
        where: { examId, sectionId: sectionId === "null" ? null : sectionId },
        orderBy: { order: "asc" },
      });
      for (let i = 0; i < remaining.length; i++) {
        await prisma.question.update({
          where: { id: remaining[i].id },
          data: { order: i + 1 },
        });
      }
    }

    return NextResponse.json({ success: true, deletedCount: questions.length });
  } catch (error) {
    console.error("BULK DELETE QUESTION ERROR:", error);
    return NextResponse.json({ error: "Gagal hapus soal" }, { status: 500 });
  }
}