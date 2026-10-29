import { prisma } from "@/libs/prisma";
import { calculateResult } from "./calculate-result.service";

type Props = {
  sessionId: string;
  userId: string;
};

export async function submitExamService({ sessionId, userId }: Props) {
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { ujian: true },
  });

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  if (session.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  // Sudah pernah di-submit: kembalikan hasil yang sama, bukan error
  if (session.status === "SUBMITTED") {
    const existing = await prisma.examResult.findUnique({
      where: { sessionId },
    });
    if (existing) {
      return { success: true, resultId: existing.id };
    }
    throw new Error("SESSION_FINISHED");
  }

  const result = await calculateResult({ sessionId });

  try {
    const transaction = await prisma.$transaction(async (tx) => {
      await tx.examSession.update({
        where: { id: sessionId },
        data: { status: "SUBMITTED", submittedAt: new Date() },
      });

      const examResult = await tx.examResult.create({
        data: {
          sessionId,
          totalCorrect: result.totalCorrect,
          totalWrong: result.totalWrong,
          totalQuestion: result.totalQuestion,
          score: result.score,
          // rincian disimpan sekali di sini supaya halaman hasil tidak menghitung ulang
          details: {
            maxScore: result.maxScore,
            program: result.program,
            categories: result.categoryResults,
          },
        },
      });

      return { examResult };
    });

    return { success: true, resultId: transaction.examResult.id };
  } catch (e: any) {
    // Dua submit hampir bersamaan: yang kedua kena unique sessionId, ambil hasil yang sudah ada
    if (e?.code === "P2002") {
      const existing = await prisma.examResult.findUnique({
        where: { sessionId },
      });
      if (existing) return { success: true, resultId: existing.id };
    }
    throw e;
  }
}
