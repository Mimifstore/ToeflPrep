import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "@/libs/api-auth";
import { getReadinessMap } from "@/service/ujian-readiness.service";
import { prepareUjianInput } from "@/service/ujian-input.service";

export async function GET(req: Request) {
  // Endpoint ini dipakai DUA sisi: admin (kelola ujian) dan user (daftar tryout per program via ?programId=).
  // Cukup login, tidak harus admin.
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("programId");
    const data = await prisma.ujian.findMany({
      where: programId ? { programId } : undefined,
      include: { program: true, questionBank: true },
      orderBy: { createdAt: "desc" },
    });

    // `ready`: ujian sudah lengkap (ada soal & durasi) sehingga aman dibeli/dikerjakan.
    // Alasan detailnya hanya untuk admin; peserta cukup tahu "belum tersedia".
    const readiness = await getReadinessMap(data);
    const isAdmin = session?.user?.role === "ADMIN";

    return NextResponse.json(
      data.map((ujian: (typeof data)[number]) => {
        const r = readiness.get(ujian.id);
        return {
          ...ujian,
          ready: r?.ready ?? true,
          notReadyReason: isAdmin ? (r?.problems[0]?.message ?? null) : null,
        };
      }),
    );
  } catch (error) {
    console.error("GET UJIANS ERROR:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const prepared = await prepareUjianInput(await req.json());
    if (!prepared.ok) return prepared.response;

    const created = await prisma.ujian.create({ data: prepared.data });
    return NextResponse.json(created);
  } catch (error) {
    console.error("CREATE UJIAN ERROR:", error);
    return NextResponse.json({ error: "Gagal membuat ujian" }, { status: 500 });
  }
}
