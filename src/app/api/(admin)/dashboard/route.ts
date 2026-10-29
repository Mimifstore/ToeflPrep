import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const now = new Date();

    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // 🔥 FIX — role harus "USER" huruf besar, bukan "user"
    const totalUser = await prisma.user.count({ where: { role: "USER" } });
    const activeUser = await prisma.user.count({
      where: { isActive: true, role: "USER" },
    });
    const nonActiveUser = await prisma.user.count({
      where: { isActive: false, role: "USER" },
    });
    const memberUser = await prisma.siswa.count({ where: { isMember: true } });

    const transaksiHariIni = await prisma.transaction.count({
      where: { createdAt: { gte: startOfDay, lte: endOfDay } },
    });

    const transaksiBulanIni = await prisma.transaction.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    const transaksiTahunIni = await prisma.transaction.count({
      where: { createdAt: { gte: startOfYear } },
    });

    const pemasukanBulan = await prisma.transaction.aggregate({
      _sum: { total: true },
      where: { status: "SUCCESS", createdAt: { gte: startOfMonth } },
    });

    const pending = await prisma.transaction.count({
      where: { status: "PENDING" },
    });
    const waiting = await prisma.transaction.count({
      where: { status: "WAITING" },
    });
    const success = await prisma.transaction.count({
      where: { status: "SUCCESS" },
    });
    const failed = await prisma.transaction.count({
      where: { status: "FAILED" },
    });

    return NextResponse.json({
      totalUser,
      activeUser,
      nonActiveUser,
      memberUser,
      transaksiHariIni,
      transaksiBulanIni,
      transaksiTahunIni,
      pemasukanBulan: pemasukanBulan._sum.total || 0,
      pending,
      waiting,
      success,
      failed,
    });
  } catch (error) {
    console.error("GET DASHBOARD STATS ERROR:", error);
    return NextResponse.json(
      { error: "Gagal load dashboard" },
      { status: 500 },
    );
  }
}
