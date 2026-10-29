import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const ujianId = searchParams.get("ujianId") || "";

    const sessions = await prisma.examSession.findMany({
      where: {
        status: { in: ["SUBMITTED", "EXPIRED"] },
        ...(ujianId ? { ujianId } : {}),
      },
      orderBy: { submittedAt: "desc" },
      include: {
        user: { include: { siswa: true } },
        ujian: true,
        result: true,
        answers: {
          include: {
            question: {
              include: {
                categoryPenilaian: {
                  include: { mappings: { orderBy: { minScore: "asc" } } },
                },
              },
            },
          },
          where: { question: { type: { not: "DIRECTION" } } },
        },
      },
    });

    const data = sessions.map((s) => {
      const categoryMap = new Map<string, { name: string; correct: number; total: number; mappings: any[] }>();

      for (const answer of s.answers) {
        const cat = answer.question.categoryPenilaian;
        if (!cat) continue;
        if (!categoryMap.has(cat.id)) {
          categoryMap.set(cat.id, { name: cat.name, correct: 0, total: 0, mappings: cat.mappings });
        }
        const c = categoryMap.get(cat.id)!;
        c.total++;
        if (answer.answer && answer.answer === answer.question.correctAnswer) c.correct++;
      }

      const categoryScores = Array.from(categoryMap.values()).map((cat) => {
        const mapping = cat.mappings.find((m) => cat.correct >= m.minScore && cat.correct <= m.maxScore);
        return { name: cat.name, correct: cat.correct, total: cat.total, score: mapping?.finalScore ?? 0 };
      });

      const totalScore = s.result?.score ?? 0;
      const passed = totalScore >= s.ujian.passingScore;

      return {
        id: s.id,
        userName: s.user.siswa?.name || s.user.name || s.user.email,
        ujianId: s.ujianId,
        ujianTitle: s.ujian.title,
        passingScore: s.ujian.passingScore,
        totalScore,
        totalCorrect: s.result?.totalCorrect ?? 0,
        totalWrong: s.result?.totalWrong ?? 0,
        totalQuestion: s.result?.totalQuestion ?? 0,
        categoryScores,
        passed,
        submittedAt: s.submittedAt,
        status: s.status,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET REKAP ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}