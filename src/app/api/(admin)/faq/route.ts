import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { z } from "zod";

const createFaqSchema = z.object({
  question: z.string().trim().min(1, "Pertanyaan wajib diisi").max(500),
  answer: z.string().trim().min(1, "Jawaban wajib diisi").max(5000),
  category: z.string().trim().max(100).optional().nullable(),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

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
    const validated = createFaqSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const data = await prisma.faq.create({ data: validated.data });
    return NextResponse.json(data);
  } catch (error) {
    console.error("CREATE FAQ ERROR:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}