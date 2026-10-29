import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { z } from "zod";

const updateAnnouncementSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  content: z.string().trim().min(1, "Konten wajib diisi").max(5000),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {

  try {
    const data = await prisma.announcement.findUnique({
      where: { id: params.id },
    });

    if (!data) {
      return NextResponse.json(
        { error: "Pengumuman tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET ANNOUNCEMENT ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const existing = await prisma.announcement.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Pengumuman tidak ditemukan" },
        { status: 404 },
      );
    }

    await prisma.announcement.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE ANNOUNCEMENT ERROR:", error);
    return NextResponse.json(
      { error: "Gagal hapus pengumuman" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = updateAnnouncementSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 },
      );
    }

    const existing = await prisma.announcement.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Pengumuman tidak ditemukan" },
        { status: 404 },
      );
    }

    const data = await prisma.announcement.update({
      where: { id: params.id },
      data: validated.data,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("UPDATE ANNOUNCEMENT ERROR:", error);
    return NextResponse.json(
      { error: "Gagal update pengumuman" },
      { status: 500 },
    );
  }
}
