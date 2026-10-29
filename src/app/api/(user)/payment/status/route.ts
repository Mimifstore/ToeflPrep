import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { prisma } from "@/libs/prisma";

// Dipakai tombol Beli untuk menunggu akses aktif setelah pembayaran
export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const ujianId = new URL(req.url).searchParams.get("ujianId");
  if (!ujianId) {
    return NextResponse.json(
      { message: "ujianId wajib diisi" },
      { status: 400 },
    );
  }

  const userId = session.user.id;

  const [access, latest] = await Promise.all([
    prisma.userExamAccess.findUnique({
      where: { userId_ujianId: { userId, ujianId } },
      select: { id: true },
    }),
    prisma.transaction.findFirst({
      where: { userId, ujianId },
      orderBy: { createdAt: "desc" },
      select: { status: true },
    }),
  ]);

  return NextResponse.json(
    { hasAccess: !!access, status: latest?.status ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
