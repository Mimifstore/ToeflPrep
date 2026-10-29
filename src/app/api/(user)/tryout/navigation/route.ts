import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { navigationSchema } from "@/app/validations/exam/navigation.schema";
import { navigationService } from "@/service/exam/navigation.service";

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

    const validated = navigationSchema.safeParse(json);

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

    // 🔥 SERVICE
    await navigationService({
      sessionId: body.sessionId,

      questionId: body.questionId,

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
    console.log("NAVIGATION ERROR:", error);

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
