import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { isBlankHtml, sanitizeRichText } from "@/libs/question-validation";
import { fieldErrorResponse, validationErrorResponse } from "@/libs/api-errors";
import { faqBodySchema } from "@/libs/content-validation";

// 🔥 GET — PUBLIC, tidak perlu auth (FAQ memang untuk ditampilkan ke semua orang)
export async function GET() {
  try {
    const data = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET FAQ LIST ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 🔥 POST — ADMIN ONLY
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = faqBodySchema.safeParse(body);

    if (!validated.success) {
      return validationErrorResponse(validated.error);
    }

    const answer = sanitizeRichText(validated.data.answer);
    if (isBlankHtml(answer)) {
      return fieldErrorResponse("answer", "Jawaban wajib diisi");
    }

    const data = await prisma.faq.create({ data: { ...validated.data, answer } });
    return NextResponse.json(data);
  } catch (error) {
    console.error("CREATE FAQ ERROR:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}