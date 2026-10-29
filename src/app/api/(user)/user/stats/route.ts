import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
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

    const [totalSessions, totalTransactions] = await Promise.all([
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
    ]);

    return NextResponse.json({ totalSessions, totalTransactions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal ambil stats" }, { status: 500 });
  }
}
