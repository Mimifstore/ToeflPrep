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

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          ujian: {
            include: { program: true },
          },
        },
      }),
      prisma.transaction.count({
        where: { userId: session.user.id },
      }),
    ]);

    const data = transactions.map((t) => ({
      id: t.id,
      invoice: t.invoice,
      createdAt: t.createdAt,
      expiredAt: t.expiredAt,
      category: t.ujian.program?.name || "-",
      ujianTitle: t.ujian.title,
      status: t.status,
      total: t.total,
      snapToken: t.snapToken,
      redirectUrl: t.redirectUrl,
    }));

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal ambil transaksi" }, { status: 500 });
  }
}