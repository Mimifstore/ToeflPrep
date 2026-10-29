import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { prepareQuestion, questionBodySchema } from "@/libs/question-validation";
import { z } from "zod";

const createQuestionSchema = questionBodySchema.extend({
  examId: z.string("Exam tidak valid").min(1, "Exam tidak valid"),
});

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = createQuestionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 },
      );
    }

    const { examId, ...input } = validated.data;

    // 🔥 CEK EXAM EXIST
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return NextResponse.json({ error: "Exam tidak ditemukan" }, { status: 404 });
    }

    // 🔥 VALIDASI + SANITASI (section, kategori, isi soal, pilihan, audio)
    const prepared = await prepareQuestion(input);
    if (!prepared.ok) {
      return NextResponse.json({ error: prepared.error }, { status: 400 });
    }
    const p = prepared.value;

    const lastQuestion = await prisma.question.findFirst({
      where: { examId, sectionId: p.sectionId },
      orderBy: { order: "desc" },
    });

    const question = await prisma.question.create({
      data: {
        examId,
        type: p.type,
        sectionId: p.sectionId,
        order: (lastQuestion?.order || 0) + 1,
        categoryPenilaianId: p.categoryId,
        questionText: p.questionText,
        directionText: p.directionText,
        audioUrl: p.audioUrl,
        audioPlayLimit: p.audioLimit,
        timeLimit: p.timeLimit,
        correctAnswer: p.correctAnswer,
        explanation: p.explanation,
        options:
          p.type === "QUESTION" ? { create: p.options } : undefined,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("CREATE QUESTION ERROR:", error);
    return NextResponse.json({ error: "Gagal tambah soal" }, { status: 500 });
  }
}