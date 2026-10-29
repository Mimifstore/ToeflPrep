import { prisma } from "@/libs/prisma";

// Kembalikan id soal (dari daftar) yang sudah pernah dipakai peserta
export async function findUsedQuestionIds(ids: string[]): Promise<string[]> {
  const [answers, sessionQs, tracks] = await Promise.all([
    prisma.examAnswer.findMany({
      where: { questionId: { in: ids } },
      select: { questionId: true },
      distinct: ["questionId"],
    }),
    prisma.examSessionQuestion.findMany({
      where: { questionId: { in: ids } },
      select: { questionId: true },
      distinct: ["questionId"],
    }),
    prisma.examAudioTrack.findMany({
      where: { questionId: { in: ids } },
      select: { questionId: true },
      distinct: ["questionId"],
    }),
  ]);

  return [
    ...new Set([...answers, ...sessionQs, ...tracks].map((r) => r.questionId)),
  ];
}
