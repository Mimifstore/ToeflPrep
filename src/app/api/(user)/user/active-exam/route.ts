import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { auth } from "../../../../../../auth";

export const dynamic = "force-dynamic";

/**
 * Sesi ujian milik user yang masih bisa dilanjutkan, buat pintasan "Lanjutkan Ujian" di sidebar.
 * Yang dihitung: status ONGOING dan belum lewat waktunya. Ujian dengan waktu per section selalu
 * ikut, karena habisnya waktu satu section tidak menutup sesi (peserta lanjut ke section berikutnya).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const active = await prisma.examSession.findFirst({
      where: {
        userId: session.user.id,
        status: "ONGOING",
        OR: [
          { expiredAt: null },
          { expiredAt: { gt: new Date() } },
          { ujian: { timeType: "PER_SECTION" } },
        ],
      },
      orderBy: { startedAt: "desc" },
      select: { id: true, ujian: { select: { title: true } } },
    });

    return NextResponse.json({
      exam: active ? { id: active.id, title: active.ujian.title } : null,
    });
  } catch (error) {
    console.error("GET ACTIVE EXAM ERROR:", error);
    return NextResponse.json(
      { error: "Gagal ambil ujian berlangsung" },
      { status: 500 },
    );
  }
}
