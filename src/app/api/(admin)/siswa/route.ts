import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { z } from "zod";

const updateSiswaSchema = z.object({
  id: z.string().min(1, "ID wajib diisi"),
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100).optional(),
  phone: z.string().trim().max(20).optional().nullable(),
  address: z.string().trim().max(255).optional().nullable(),
  gender: z.enum(["Laki-laki", "Perempuan"]).optional().nullable(),
  province: z.string().trim().max(100).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  district: z.string().trim().max(100).optional().nullable(),
  village: z.string().trim().max(100).optional().nullable(),
  isMember: z.boolean().optional(),
});

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
    const validated = updateSiswaSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const { id, ...data } = validated.data;

    // 🔥 CEK SISWA ADA
    const existing = await prisma.siswa.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Siswa tidak ditemukan" }, { status: 404 });
    }

    const siswa = await prisma.siswa.update({
      where: { id },
      data,
    });

    return NextResponse.json(siswa);
  } catch (error) {
    console.error("UPDATE SISWA ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}