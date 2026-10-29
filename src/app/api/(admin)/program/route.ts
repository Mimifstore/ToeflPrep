import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "@/libs/api-auth";
import { z } from "zod";

const programSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100),
  image: z.string().trim().min(1, "Gambar wajib diisi"),
  description: z.string().trim().max(1000).optional().nullable(),
});

const updateProgramSchema = programSchema.extend({
  id: z.string().min(1, "ID wajib diisi"),
});

const deleteProgramSchema = z.object({
  id: z.string().min(1, "ID wajib diisi"),
});

export async function GET() {
  // 🔥 AUTH — cukup login (dipakai admin & user, bukan data sensitif)
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const data = await prisma.program.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET PROGRAM ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = programSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const data = await prisma.program.create({ data: validated.data });
    return NextResponse.json(data);
  } catch (error) {
    console.error("CREATE PROGRAM ERROR:", error);
    return NextResponse.json({ error: "Gagal membuat program" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = updateProgramSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const { id, ...data } = validated.data;

    const existing = await prisma.program.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.program.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE PROGRAM ERROR:", error);
    return NextResponse.json({ error: "Gagal update program" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = deleteProgramSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const { id } = validated.data;

    // 🔥 CEK APAKAH PROGRAM MASIH DIPAKAI
    const usedInExam = await prisma.exam.findFirst({ where: { categoryId: id } });
    const usedInUjian = await prisma.ujian.findFirst({ where: { programId: id } });

    if (usedInExam || usedInUjian) {
      return NextResponse.json(
        { error: "Program ini masih digunakan, tidak dapat dihapus" },
        { status: 400 }
      );
    }

    await prisma.program.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE PROGRAM ERROR:", error);
    return NextResponse.json({ error: "Gagal hapus program" }, { status: 500 });
  }
}