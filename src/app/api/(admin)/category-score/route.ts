import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { z } from "zod";

const mappingSchema = z.object({
  minScore: z.coerce.number().int().min(0),
  maxScore: z.coerce.number().int().min(0),
  finalScore: z.coerce.number().int().min(0),
});

const createCategorySchema = z.object({
  program: z.enum(["TOEFL", "TOEIC", "CUSTOM"]),
  name: z.string().trim().min(1, "Nama kategori wajib diisi").max(100),
  sectionId: z.string().min(1, "Section wajib dipilih"),
  mappings: z.array(mappingSchema).optional().default([]),
});

const deleteCategorySchema = z.object({
  id: z.string().min(1, "ID wajib diisi"),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const data = await prisma.categoryScore.findMany({
      include: {
        mappings: true,
        section: { select: { id: true, title: true, order: true } },
      },
      orderBy: { section: { order: "asc" } },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET CATEGORY SCORE ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = createCategorySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 },
      );
    }

    const { mappings, ...rest } = validated.data;

    const data = await prisma.categoryScore.create({
      data: {
        ...rest,
        mappings: { create: mappings },
      },
      include: { mappings: true, section: true },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("CREATE CATEGORY SCORE ERROR:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = deleteCategorySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 },
      );
    }

    const { id } = validated.data;

    // 🔥 CEK APAKAH MASIH DIPAKAI SOAL
    const usedInQuestion = await prisma.question.findFirst({
      where: { categoryPenilaianId: id },
    });

    if (usedInQuestion) {
      return NextResponse.json(
        { error: "Kategori ini masih dipakai soal, tidak dapat dihapus" },
        { status: 400 },
      );
    }

    await prisma.categoryScore.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE CATEGORY SCORE ERROR:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
