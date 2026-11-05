import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { validationErrorResponse } from "@/libs/api-errors";
import { siswaUpdateSchema } from "@/libs/siswa-validation";
import { notifyMemberChanged } from "@/service/notification.service";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const siswa = await prisma.siswa.findMany({
      where: {
        user: {
          role: "USER", 
        },
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(siswa);
  } catch (error) {
    console.error("GET ALL SISWA ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = siswaUpdateSchema.safeParse(body);

    if (!validated.success) {
      return validationErrorResponse(validated.error);
    }

    const { id, ...data } = validated.data;

    // CEK SISWA ADA
    const existing = await prisma.siswa.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Siswa tidak ditemukan" }, { status: 404 });
    }

    const siswa = await prisma.siswa.update({
      where: { id },
      data,
    });

    // Status member berubah → beri tahu siswa (best-effort)
    if (data.isMember !== undefined && data.isMember !== existing.isMember) {
      await notifyMemberChanged({ userId: existing.userId, isMember: data.isMember });
    }

    return NextResponse.json(siswa);
  } catch (error) {
    console.error("UPDATE SISWA ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}