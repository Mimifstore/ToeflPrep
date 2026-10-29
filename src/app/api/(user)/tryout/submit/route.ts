import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { submitSchema } from "@/app/validations/exam/submit.schema";
import { submitExamService } from "@/service/exam/submit-exam.service";
import { checkRateLimit, checkUserRateLimit } from "@/libs/api-auth";

export async function POST(req: Request) {
  const rateLimitCheck = checkRateLimit(req, {
    limit: 300,
    windowMs: 60 * 1000,
    prefix: "submit",
  });
  if (rateLimitCheck.error) return rateLimitCheck.error;

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

          // RATE LIMIT PER USER: tiap peserta punya jatah sendiri
      const userLimit = checkUserRateLimit(sessionAuth.user.id, {
        limit: 10,
        windowMs: 60 * 1000,
        prefix: "submit",
      });
      if (userLimit.error) return userLimit.error;

    // 🔥 BODY
    const json = await req.json();

    const validated =
      submitSchema.safeParse(json);

    if (!validated.success) {
      return NextResponse.json(
        {
          message:
            validated.error.issues[0]
              ?.message ||
            "Invalid body",
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

    // 🔥 SERVICE
    const result =
      await submitExamService({
        sessionId: body.sessionId,

        userId: sessionAuth.user.id,
      });

    return NextResponse.json(
      {
        success: true,

        result,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: any) {
    console.log(
      "SUBMIT EXAM ERROR:",
      error,
    );

    // 🔥 CUSTOM
    if (
      error.message ===
      "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,

          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    if (
      error.message ===
      "SESSION_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          message:
            "Session tidak ditemukan",
        },
        {
          status: 404,

          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    if (
      error.message ===
      "SESSION_FINISHED"
    ) {
      return NextResponse.json(
        {
          message:
            "Session selesai",
        },
        {
          status: 400,

          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    if (
      error.message ===
      "SESSION_EXPIRED"
    ) {
      return NextResponse.json(
        {
          message:
            "Session expired",
        },
        {
          status: 400,

          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    return NextResponse.json(
      {
        message:
          "Internal Server Error",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}