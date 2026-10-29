import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { z } from "zod";

const updateFaqSchema = z.object({
  question: z.string().trim().min(1, "Pertanyaan wajib diisi").max(500),
  answer: z.string().trim().min(1, "Jawaban wajib diisi").max(5000),
  category: z.string().trim().max(100).optional().nullable(),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const data = await prisma.faq.findUnique({ where: { id: params.id } });

    if (!data) {
      return NextResponse.json({ error: "FAQ tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET FAQ ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
    const validated = updateFaqSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.faq.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "FAQ tidak ditemukan" }, { status: 404 });
    }

    const data = await prisma.faq.update({
      where: { id: params.id },
      data: validated.data,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("UPDATE FAQ ERROR:", error);
    return NextResponse.json({ error: "Gagal update FAQ" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const existing = await prisma.faq.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "FAQ tidak ditemukan" }, { status: 404 });
    }

    await prisma.faq.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE FAQ ERROR:", error);
    return NextResponse.json({ error: "Gagal hapus FAQ" }, { status: 500 });
  }
}