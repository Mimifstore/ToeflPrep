import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { requireAdmin } from "@/libs/api-auth";
import { loadBankInfo } from "@/service/ujian-readiness.service";

// GET /api/soal/:id/sections
// Section + jumlah soal sebuah bank soal. Dipakai form ujian untuk tahu section mana yang wajib diberi waktu.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!exam) {
      return NextResponse.json({ error: "Bank soal tidak ditemukan" }, { status: 404 });
    }

    const info = (await loadBankInfo([params.id])).get(params.id);
    const sections = [...(info?.sections ?? [])].sort((a, b) => a.order - b.order);

    return NextResponse.json({
      sections,
      unassignedQuestions: info?.unassignedQuestions ?? 0,
    });
  } catch (error) {
    console.error("GET BANK SECTIONS ERROR:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}
