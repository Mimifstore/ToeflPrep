import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { isBlankHtml, sanitizeRichText } from "@/libs/question-validation";
import { fieldErrorResponse, validationErrorResponse } from "@/libs/api-errors";
import { faqBodySchema } from "@/libs/content-validation";

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
    const validated = faqBodySchema.safeParse(body);

    if (!validated.success) {
      return validationErrorResponse(validated.error);
    }

    const existing = await prisma.faq.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "FAQ tidak ditemukan" }, { status: 404 });
    }

    const answer = sanitizeRichText(validated.data.answer);
    if (isBlankHtml(answer)) {
      return fieldErrorResponse("answer", "Jawaban wajib diisi");
    }

    const data = await prisma.faq.update({
      where: { id: params.id },
      data: { ...validated.data, answer },
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