import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { prisma } from "@/libs/prisma";
import { getExpiredTime } from "@/libs/exam/get-expired-time";
import {
  getSectionMinutes,
  getSessionSections,
} from "@/libs/exam/session-sections";
import { z } from "zod";

const nextSectionSchema = z.object({
  sessionId: z.string().min(1, "sessionId wajib diisi"),
  // section yang sedang dikerjakan di layar peserta. Dipakai supaya klik ganda
  // atau request ulang tidak melompati section berikutnya.
  fromSection: z.coerce.number().int().min(0).optional(),
});

export async function POST(req: Request) {
  try {
    const sessionAuth = await auth();
    if (!sessionAuth?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    const validated = nextSectionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0]?.message || "Invalid body" },
        { status: 400 },
      );
    }

    const session = await prisma.examSession.findUnique({
      where: { id: validated.data.sessionId },
      include: { ujian: true },
    });

    if (!session) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 404 },
      );
    }

    // 🔥 OWNERSHIP CHECK — WAJIB
    if (session.userId !== sessionAuth.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (session.status !== "ONGOING") {
      return NextResponse.json(
        { message: "Session sudah selesai" },
        { status: 400 },
      );
    }

    // 🔥 SUDAH PINDAH (klik ganda / request ulang): jangan geser lagi
    const from = validated.data.fromSection ?? session.currentSection;
    if (session.currentSection !== from) {
      return NextResponse.json({
        success: true,
        currentSection: session.currentSection,
        alreadyMoved: true,
      });
    }

    // 🔥 BATAS ATAS — section berikutnya harus benar-benar ada
    const sections = await getSessionSections(session.id);
    const nextSection = from + 1;

    if (nextSection >= sections.length) {
      return NextResponse.json(
        { message: "Tidak ada section berikutnya" },
        { status: 400 },
      );
    }

    // 🔥 WAKTU SECTION BERIKUTNYA (dicocokkan lewat judul section)
    let expiredAt: Date | undefined;
    if (session.ujian.timeType === "PER_SECTION") {
      const minutes = getSectionMinutes(
        session.ujian,
        sections[nextSection].title,
        nextSection,
      );

      if (!minutes) {
        return NextResponse.json(
          { message: "Durasi section belum diatur, hubungi admin" },
          { status: 409 },
        );
      }

      expiredAt = getExpiredTime(minutes);
    }

    // hanya satu request yang boleh memindahkan dari section ini
    const moved = await prisma.examSession.updateMany({
      where: { id: session.id, currentSection: from, status: "ONGOING" },
      data: {
        currentSection: nextSection,
        ...(expiredAt && { expiredAt }),
      },
    });

    if (moved.count === 0) {
      return NextResponse.json({
        success: true,
        currentSection: from + 1,
        alreadyMoved: true,
      });
    }

    return NextResponse.json({ success: true, currentSection: nextSection });
  } catch (error) {
    console.error("[next-section]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
