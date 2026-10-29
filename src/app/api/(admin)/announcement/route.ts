import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { z } from "zod";

const createAnnouncementSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  content: z.string().trim().min(1, "Konten wajib diisi").max(5000),
});

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
    const validated = createAnnouncementSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 },
      );
    }

    const data = await prisma.announcement.create({ data: validated.data });
    return NextResponse.json(data);
  } catch (error) {
    console.error("CREATE ANNOUNCEMENT ERROR:", error);
    return NextResponse.json(
      { error: "Gagal membuat pengumuman" },
      { status: 500 },
    );
  }
}
