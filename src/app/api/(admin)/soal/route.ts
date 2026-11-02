import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { fieldErrorResponse, validationErrorResponse } from "@/libs/api-errors";
import { bankSoalBodySchema } from "@/libs/bank-soal-validation";

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
    const validated = bankSoalBodySchema.safeParse(body);

    if (!validated.success) {
      return validationErrorResponse(validated.error);
    }

    const program = await prisma.program.findUnique({
      where: { id: validated.data.categoryId },
      select: { id: true },
    });
    if (!program) {
      return fieldErrorResponse("categoryId", "Kategori tidak ditemukan");
    }

    const exam = await prisma.exam.create({ data: validated.data });

    return NextResponse.json(exam);
  } catch (error) {
    console.error("CREATE EXAM ERROR:", error);
    return NextResponse.json({ message: "Gagal membuat soal" }, { status: 500 });
  }
}