import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { isBlankHtml, sanitizeRichText } from "@/libs/question-validation";
import { fieldErrorResponse, validationErrorResponse } from "@/libs/api-errors";
import { announcementBodySchema } from "@/libs/content-validation";

// 🔥 GET — PUBLIC, dipakai user untuk lihat pengumuman
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Math.min(Number(searchParams.get("limit") || 5), 50); // 🔥 cap maksimal 50
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.announcement.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.announcement.count(),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET ANNOUNCEMENTS ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// 🔥 POST — ADMIN ONLY
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = announcementBodySchema.safeParse(body);

    if (!validated.success) {
      return validationErrorResponse(validated.error);
    }

    const content = sanitizeRichText(validated.data.content);
    if (isBlankHtml(content)) {
      return fieldErrorResponse("content", "Konten wajib diisi");
    }

    const data = await prisma.announcement.create({
      data: { ...validated.data, content },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("CREATE ANNOUNCEMENT ERROR:", error);
    return NextResponse.json(
      { error: "Gagal membuat pengumuman" },
      { status: 500 },
    );
  }
}
