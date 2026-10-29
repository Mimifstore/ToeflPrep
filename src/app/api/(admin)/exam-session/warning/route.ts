import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { z } from "zod";
import { submitExamService } from "@/service/exam/submit-exam.service";

const warningSchema = z.object({
  sessionId: z.string().min(1, "sessionId wajib diisi"),
  type: z.enum(["TAB", "FULLSCREEN"]),
});

export async function POST(req: Request) {
  try {
    const sessionAuth = await auth();
    if (!sessionAuth?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = warningSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0]?.message || "Invalid request" },
        { status: 400 },
      );
    }

    const { sessionId, type } = validated.data;

    // 🔥 SERTAKAN ujian.maxExitAttempts BUAT CEK BATAS
    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      include: { ujian: { select: { maxExitAttempts: true } } },
    });

    if (!session) {
      return NextResponse.json(
        { message: "Session tidak ditemukan" },
        { status: 404 },
      );
    }

    if (session.userId !== sessionAuth.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 🔥 CEGAH UPDATE KALAU SESSION SUDAH SELESAI
    if (session.status !== "ONGOING") {
      return NextResponse.json(
        { message: "Session sudah selesai" },
        { status: 400 },
      );
    }

    const updated = await prisma.examSession.update({
      where: { id: sessionId },
      data: {
        tabWarning: type === "TAB" ? { increment: 1 } : undefined,
        fullscreenWarning: type === "FULLSCREEN" ? { increment: 1 } : undefined,
      },
    });

    // 🔥 BARU — ENFORCEMENT maxExitAttempts
    // Sebelumnya field ini cuma dekoratif (gak pernah dicek). Sekarang:
    // total percobaan keluar (tab + fullscreen) dibandingin ke batas admin.
    // maxExitAttempts = 0 berarti admin gak ngaktifin fitur ini (unlimited).
    const totalExitAttempts = updated.tabWarning + updated.fullscreenWarning;
    const maxAllowed = session.ujian.maxExitAttempts;

    if (maxAllowed > 0 && totalExitAttempts >= maxAllowed) {
      const result = await submitExamService({
        sessionId,
        userId: sessionAuth.user.id,
      });

      return NextResponse.json({
        tabWarning: updated.tabWarning,
        fullscreenWarning: updated.fullscreenWarning,
        forceSubmit: true,
        resultId: result.resultId,
      });
    }

    return NextResponse.json({
      tabWarning: updated.tabWarning,
      fullscreenWarning: updated.fullscreenWarning,
      forceSubmit: false,
    });
  } catch (error) {
    console.error("WARNING UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
