import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { prepareUjianInput } from "@/service/ujian-input.service";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // 🔥 AUTH — hanya ADMIN
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const data = await prisma.ujian.findUnique({
      where: { id: params.id },
      include: {
        program: true,
        questionBank: true,
      },
    });

    if (!data) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Gagal ambil data" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const existing = await prisma.ujian.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Ujian tidak ditemukan" }, { status: 404 });
    }

    const hasSession = await prisma.examSession.findFirst({
      where: { ujianId: params.id },
      select: { id: true },
    });

    const prepared = await prepareUjianInput(await req.json(), {
      questionBankId: existing.questionBankId,
      timeType: existing.timeType,
      hasSessions: !!hasSession,
    });
    if (!prepared.ok) return prepared.response;

    const updated = await prisma.ujian.update({
      where: { id: params.id },
      data: prepared.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE UJIAN ERROR:", error);
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const existing = await prisma.ujian.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Ujian tidak ditemukan" }, { status: 404 });
    }

    // 🔥 CEK APAKAH SUDAH ADA TRANSAKSI/SESSION
    const hasTransaction = await prisma.transaction.findFirst({
      where: { ujianId: params.id },
    });
    const hasSession = await prisma.examSession.findFirst({
      where: { ujianId: params.id },
    });

    if (hasTransaction || hasSession) {
      return NextResponse.json(
        { error: "Ujian ini sudah memiliki transaksi/peserta, tidak dapat dihapus" },
        { status: 400 }
      );
    }

    await prisma.ujian.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE UJIAN ERROR:", error);
    return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  }
}