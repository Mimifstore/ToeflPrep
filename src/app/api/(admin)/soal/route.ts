import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { z } from "zod";

const createExamSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  totalOption: z.coerce.number().int().min(0).max(10).default(0),
  totalSession: z.coerce.number().int().min(0).max(20).default(0),
  useCategoryScore: z.boolean().default(true),
  scoringType: z.string().default("PER_KATEGORI"),
  showCorrection: z.boolean().default(false),
  minScoreToShow: z.coerce.number().int().min(0).nullable().optional(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const data = await prisma.exam.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET EXAMS ERROR:", error);
    return NextResponse.json({ message: "Gagal fetch soal" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = createExamSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const { minScoreToShow, showCorrection, ...rest } = validated.data;

    const exam = await prisma.exam.create({
      data: {
        ...rest,
        showCorrection,
        minScoreToShow: showCorrection ? minScoreToShow ?? 0 : null,
      },
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error("CREATE EXAM ERROR:", error);
    return NextResponse.json({ message: "Gagal membuat soal" }, { status: 500 });
  }
}