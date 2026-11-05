import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { isBlankHtml, sanitizeRichText } from "@/libs/question-validation";
import { fieldErrorResponse, validationErrorResponse } from "@/libs/api-errors";
import { announcementBodySchema } from "@/libs/content-validation";
import { removeAnnouncementNotifications } from "@/service/notification.service";

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
    // Hapus notifikasinya juga supaya tidak menyisakan tautan mati
    await removeAnnouncementNotifications(params.id);
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
    const validated = announcementBodySchema.safeParse(body);

    if (!validated.success) {
      return validationErrorResponse(validated.error);
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

    const content = sanitizeRichText(validated.data.content);
    if (isBlankHtml(content)) {
      return fieldErrorResponse("content", "Konten wajib diisi");
    }

    const data = await prisma.announcement.update({
      where: { id: params.id },
      data: { ...validated.data, content },
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
