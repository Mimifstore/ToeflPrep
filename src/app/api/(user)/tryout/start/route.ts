import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { prisma } from "@/libs/prisma";
import { hasExamAccess } from "@/libs/exam-acces";
import {
  createExamSession,
  ExamNotReadyError,
} from "@/libs/exam/create-session";
import { startExamSchema } from "@/app/validations/exam/start.schema";

export async function POST(req: Request) {
  try {
    // 🔥 AUTH
    const sessionAuth = await auth();

    if (!sessionAuth?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔥 BODY
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    const validated = startExamSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0].message },
        { status: 400 },
      );
    }

    const { ujianId } = validated.data;
    const userId = sessionAuth.user.id;

    // 🔥 CHECK ACCESS
    const allowed = await hasExamAccess({ userId, ujianId });

    if (!allowed) {
      return NextResponse.json(
        { message: "Tidak punya akses" },
        { status: 403 },
      );
    }

    // 🔥 CHECK ONGOING SESSION
    const existingSession = await prisma.examSession.findFirst({
      where: { userId, ujianId, status: "ONGOING" },
    });

    // 🔥 RETURN EXISTING
    if (existingSession) {
      return NextResponse.json({
        success: true,
        sessionId: existingSession.id,
      });
    }

    // 🔥 GET UJIAN
    const ujian = await prisma.ujian.findUnique({ where: { id: ujianId } });

    if (!ujian) {
      return NextResponse.json(
        { message: "Ujian tidak ditemukan" },
        { status: 404 },
      );
    }

    // 🔥 CREATE SESSION
    let examSession;
    try {
      examSession = await createExamSession({ userId, ujian });
    } catch (error) {
      // ujian belum siap (tanpa soal / durasi belum diatur): pesan jelas, bukan 500
      if (error instanceof ExamNotReadyError) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }
      throw error;
    }

    // 🔥 KLIK GANDA / DUA TAB: kalau ada sesi aktif yang lebih dulu dibuat,
    // pakai itu dan hapus yang baru. Urutannya pasti (createdAt lalu id), jadi dua
    // request bersamaan selalu sepakat sesi mana yang dipertahankan.
    const earliest = await prisma.examSession.findFirst({
      where: { userId, ujianId, status: "ONGOING" },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    if (earliest && earliest.id !== examSession.id) {
      await prisma.examSession.deleteMany({ where: { id: examSession.id } });
      return NextResponse.json({ success: true, sessionId: earliest.id });
    }

    return NextResponse.json({ success: true, sessionId: examSession.id });
  } catch (error) {
    console.error("START EXAM ERROR:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
