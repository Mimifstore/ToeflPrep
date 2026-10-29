import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { answerSchema } from "@/app/validations/exam/answer.schema";
import { saveAnswerService } from "@/service/exam/save-answer.service";

export async function POST(req: Request) {
  try {
    // 🔥 AUTH
    const sessionAuth = await auth();

    if (!sessionAuth?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,

          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    // 🔥 BODY
    const json = await req.json();

    const validated = answerSchema.safeParse(json);

    if (!validated.success) {
      return NextResponse.json(
        {
          message: validated.error.issues[0]?.message || "Invalid body",
        },
        {
          status: 400,

          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const body = validated.data;

    await saveAnswerService({
      sessionId: body.sessionId,

      questionId: body.questionId,

      answer: body.answer,

      userId: sessionAuth.user.id,
    });

    return NextResponse.json(
      {
        success: true,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: any) {
    console.log("SAVE ANSWER ERROR:", error);

    // 🔥 CUSTOM
    if (error.message === "QUESTION_NOT_FOUND") {
      return NextResponse.json(
        {
          message: "Question tidak ditemukan",
        },
        {
          status: 404,

          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    if (error.message === "INVALID_OPTION") {
      return NextResponse.json(
        {
          message: "Option tidak valid",
        },
        {
          status: 400,

          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    if (error.message === "SECTION_MISMATCH") {
      return NextResponse.json(
        { message: "Soal bukan bagian dari section yang sedang berjalan" },
        { status: 403 },
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,

          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    if (error.message === "SESSION_EXPIRED") {
      return NextResponse.json(
        {
          message: "Session expired",
        },
        {
          status: 400,

          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    if (error.message === "SESSION_FINISHED") {
      return NextResponse.json(
        {
          message: "Session selesai",
        },
        {
          status: 400,

          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,

        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
