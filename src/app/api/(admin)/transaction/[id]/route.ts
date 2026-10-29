import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "WAITING", "SUCCESS", "FAILED"], {
    error: "Status tidak valid",
  }),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const data = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        ujian: { include: { program: true } },
      },
    });

    if (!data) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET TRANSACTION ERROR:", error);
    return NextResponse.json({ error: "Gagal ambil transaksi" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = updateStatusSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const { status } = validated.data;

    // 🔥 CEK TRANSAKSI ADA
    const existing = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    // 🔥 CEGAH UPDATE TRANSAKSI YANG SUDAH FINAL
    if (existing.status === "SUCCESS" || existing.status === "FAILED") {
      return NextResponse.json(
        { error: "Transaksi sudah final, tidak dapat diubah" },
        { status: 400 }
      );
    }

    const updated = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        status,
        paidAt: status === "SUCCESS" ? new Date() : undefined,
      },
    });

    // 🔥 Kalau SUCCESS, buat UserExamAccess otomatis
    if (status === "SUCCESS") {
      await prisma.userExamAccess.upsert({
        where: {
          userId_ujianId: {
            userId: existing.userId,
            ujianId: existing.ujianId,
          },
        },
        update: {},
        create: {
          userId: existing.userId,
          ujianId: existing.ujianId,
          transactionId: params.id,
          activatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE TRANSACTION ERROR:", error);
    return NextResponse.json({ error: "Gagal update transaksi" }, { status: 500 });
  }
}