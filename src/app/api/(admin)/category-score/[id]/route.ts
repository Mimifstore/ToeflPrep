import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { z } from "zod";

const mappingSchema = z.object({
  minScore: z.coerce.number().int().min(0),
  maxScore: z.coerce.number().int().min(0),
  finalScore: z.coerce.number().int().min(0),
});

const updateCategorySchema = z.object({
  program: z.enum(["TOEFL", "TOEIC", "CUSTOM"]),
  name: z.string().trim().min(1, "Nama kategori wajib diisi").max(100),
  sectionId: z.string().min(1, "Section wajib dipilih"),
  mappings: z.array(mappingSchema).optional().default([]),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const data = await prisma.categoryScore.findUnique({
      where: { id: params.id },
      include: {
        mappings: true,
        section: { select: { id: true, title: true, order: true } },
      },
    });

    if (!data) {
      return NextResponse.json(
        { error: "Category tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET CATEGORY SCORE BY ID ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = updateCategorySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 },
      );
    }

    const existing = await prisma.categoryScore.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Category tidak ditemukan" },
        { status: 404 },
      );
    }

    const { mappings, ...rest } = validated.data;

    // 🔥 TRANSACTION — hapus mapping lama, buat baru, update category — atomic
    const updated = await prisma.$transaction(async (tx) => {
      await tx.scoreMapping.deleteMany({ where: { categoryId: params.id } });

      return tx.categoryScore.update({
        where: { id: params.id },
        data: {
          ...rest,
          mappings: { create: mappings },
        },
        include: {
          mappings: true,
          section: { select: { id: true, title: true, order: true } },
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE CATEGORY SCORE ERROR:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
