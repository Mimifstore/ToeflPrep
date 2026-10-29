import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { z } from "zod";

const createSectionSchema = z.object({
  title: z.string().trim().min(1, "Title wajib diisi").max(100),
  examId: z.string().optional().nullable(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const sections = await prisma.section.findMany({
      orderBy: { order: "asc" },
      select: { id: true, title: true, order: true },
    });
    return NextResponse.json(sections);
  } catch (error) {
    console.error("GET SECTIONS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = createSectionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const { title, examId } = validated.data;

    const duplicate = await prisma.section.findFirst({
      where: { title: { equals: title, mode: "insensitive" } },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: `Section "${title}" sudah ada` },
        { status: 409 },
      );
    }

    const lastSection = await prisma.section.findFirst({
      orderBy: { order: "desc" },
    });
    const nextOrder = (lastSection?.order || 0) + 1;

    const section = await prisma.section.create({
      data: { title, order: nextOrder, examId },
      select: { id: true, title: true, order: true },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("CREATE SECTION ERROR:", error);
    return NextResponse.json({ error: "Gagal membuat section" }, { status: 500 });
  }
}