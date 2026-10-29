import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const data = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        ujian: { include: { program: true } },
      },
      where: search
        ? {
            invoice: {
              contains: search,
              mode: "insensitive",
            },
          }
        : undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET TRANSACTIONS ERROR:", error);
    return NextResponse.json({ error: "Gagal ambil transaksi" }, { status: 500 });
  }
}