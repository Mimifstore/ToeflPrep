import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { incrementAudioPlayService } from "@/service/exam/increment-audio-play.service";
import { checkRateLimit, checkUserRateLimit } from "@/libs/api-auth";
import { z } from "zod";

const audioSchema = z.object({
  sessionId: z.string().min(1, "sessionId wajib diisi"),
  questionId: z.string().min(1, "questionId wajib diisi"),
  mode: z.enum(["check", "commit"]).default("commit"),
});

export async function POST(req: Request) {
  const rateLimitCheck = checkRateLimit(req, {
    limit: 600,
    windowMs: 60 * 1000,
    prefix: "audio",
  });
  if (rateLimitCheck.error) return rateLimitCheck.error;

  try {
    const sessionAuth = await auth();
    if (!sessionAuth?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userLimit = checkUserRateLimit(sessionAuth.user.id, {
      limit: 30,
      windowMs: 60 * 1000,
      prefix: "audio",
    });
    if (userLimit.error) return userLimit.error;

    const body = await req.json();
    const validated = audioSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0]?.message || "Invalid body" },
        { status: 400 },
      );
    }

    const result = await incrementAudioPlayService({
      sessionId: validated.data.sessionId,
      questionId: validated.data.questionId,
      userId: sessionAuth.user.id,
      commit: validated.data.mode === "commit",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AUDIO PLAY ERROR:", error);

    if (error.message === "AUDIO_LIMIT_EXCEEDED") {
      return NextResponse.json(
        { message: "Batas pemutaran audio habis" },
        { status: 400 },
      );
    }
    if (error.message === "QUESTION_NOT_FOUND") {
      return NextResponse.json(
        { message: "Question tidak ditemukan" },
        { status: 404 },
      );
    }
    if (error.message === "SESSION_FINISHED") {
      return NextResponse.json(
        { message: "Session sudah selesai" },
        { status: 400 },
      );
    }
    if (error.message === "SESSION_EXPIRED") {
      return NextResponse.json({ message: "Session expired" }, { status: 400 });
    }

    if (error.message === "SECTION_MISMATCH") {
      return NextResponse.json(
        { message: "Soal bukan bagian dari section yang sedang berjalan" },
        { status: 403 },
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
