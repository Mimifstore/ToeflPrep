import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { activeSessionWhere } from "@/libs/exam-session-filters";
import { auth } from "../../../../../../auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalSessions, totalTransactions, completedSessions, ongoingSessions] = await Promise.all([
      prisma.examSession.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.transaction.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.examSession.count({ where: { userId, status: "SUBMITTED" } }),
      prisma.examSession.count({ where: activeSessionWhere(userId, now) }),
    ]);

    return NextResponse.json({
      totalSessions,
      totalTransactions,
      completedSessions,
      ongoingSessions,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal ambil stats" }, { status: 500 });
  }
}
