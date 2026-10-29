import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { requireAdmin } from "@/libs/api-auth";

export async function GET(req: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const sessions = await prisma.examSession.findMany({
      where: {
        createdAt: { gte: startOfDay },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          include: { siswa: true },
        },
        ujian: true,
        answers: {
          select: { questionId: true },
        },
        sessionQuestions: {
          select: { id: true },
          where: {
            question: { type: { not: "DIRECTION" } },
          },
        },
      },
    });

    const data = sessions.map((s) => {
      const totalQuestions = s.sessionQuestions.length;
      const answeredQuestions = s.answers.length;

      return {
        id: s.id,
        userName: s.user.siswa?.name || s.user.name || s.user.email,
        ujianTitle: s.ujian.title,
        status: s.status,
        currentSection: s.currentSection,
        totalQuestions,
        answeredQuestions,
        tabWarning: s.tabWarning,
        fullscreenWarning: s.fullscreenWarning,
        expiredAt: s.expiredAt,
        startedAt: s.startedAt,
        submittedAt: s.submittedAt,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
