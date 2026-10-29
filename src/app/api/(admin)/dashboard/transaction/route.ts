import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const data = await prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        ujian: { include: { program: true } },
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET DASHBOARD TRANSACTION ERROR:", error);
    return NextResponse.json(
      { error: "Gagal ambil transaksi" },
      { status: 500 },
    );
  }
}
