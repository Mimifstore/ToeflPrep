import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.examSession.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          ujian: { include: { program: true } },
          result: true,
        },
      }),
      prisma.examSession.count({
        where: { userId: session.user.id },
      }),
    ]);

    const data = sessions.map((s) => ({
      id: s.id,
      resultId: s.result?.id ?? null,
      ujianTitle: s.ujian.title,
      category: s.ujian.program?.name || "-",
      status: s.status,
      score: s.result?.score ?? null,
      startedAt: s.startedAt,
      submittedAt: s.submittedAt,
    }));

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal ambil latihan" }, { status: 500 });
  }
}