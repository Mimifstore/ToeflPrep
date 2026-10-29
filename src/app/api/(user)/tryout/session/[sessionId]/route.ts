import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { sessionParamsSchema } from "@/app/validations/exam/session.schema";
import { getSessionService } from "@/service/exam/get-session.service";

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      sessionId: string;
    }>;
  },
) {
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
        },
      );
    }

    // 🔥 PARAMS
    const params = await context.params;

    const validated = sessionParamsSchema.parse(params);

    // 🔥 SERVICE
    const result = await getSessionService({
      sessionId: validated.sessionId,

      userId: sessionAuth.user.id,
    });

    return NextResponse.json(result, {
  headers: {
    "Cache-Control": "no-store",
  },
});
  } catch (error: any) {
    console.log(error);

    // 🔥 ZOD
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          message: "Invalid params",
        },
        {
          status: 400,
        },
      );
    }

    // 🔥 CUSTOM ERRORS
    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    if (error.message === "SESSION_NOT_FOUND") {
      return NextResponse.json(
        {
          message: "Session tidak ditemukan",
        },
        {
          status: 404,
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
        },
      );
    }

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
