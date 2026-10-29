import crypto from "crypto";
import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { z } from "zod";

const freeAccessSchema = z.object({
  ujianId: z.string().min(1, "ujianId wajib diisi"),
});

export async function POST(req: Request) {
  try {
    const sessionAuth = await auth();
    if (!sessionAuth?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = sessionAuth.user.id;

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    const validated = freeAccessSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 },
      );
    }

    const { ujianId } = validated.data;

    const ujian = await prisma.ujian.findUnique({ where: { id: ujianId } });

    if (!ujian) {
      return NextResponse.json(
        { message: "Ujian tidak ditemukan" },
        { status: 404 },
      );
    }

    if (ujian.price > 0) {
      return NextResponse.json(
        { message: "Ujian ini tidak gratis" },
        { status: 400 },
      );
    }

    const existingAccess = await prisma.userExamAccess.findUnique({
      where: { userId_ujianId: { userId, ujianId } },
    });

    if (existingAccess) {
      return NextResponse.json(
        { message: "Sudah punya akses" },
        { status: 400 },
      );
    }

    try {
      await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            invoice: `FREE-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
            userId,
            ujianId,
            total: 0,
            status: "SUCCESS",
            paidAt: new Date(),
          },
        });

        await tx.userExamAccess.create({
          data: {
            userId,
            ujianId,
            transactionId: transaction.id,
            activatedAt: new Date(),
          },
        });
      });
    } catch (error: any) {
      // klik ganda / dua tab: request lain sudah memberi akses, jadi ini juga berhasil
      if (error?.code !== "P2002") throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("FREE ACCESS ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
