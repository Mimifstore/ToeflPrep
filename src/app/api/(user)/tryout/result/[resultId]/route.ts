import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { resultParamsSchema } from "@/app/validations/exam/result.schema";
import { getResultService } from "@/service/exam/get-result.service";

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

    const validated = resultParamsSchema.parse(params);

    // 🔥 SERVICE
    const result = await getResultService({
      sessionId: validated.sessionId,

      userId: sessionAuth.user.id,
    });

    return NextResponse.json(result);
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

    // 🔥 CUSTOM
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

    if (error.message === "RESULT_NOT_FOUND") {
      return NextResponse.json(
        {
          message: "Result tidak ditemukan",
        },
        {
          status: 404,
        },
      );
    }

    if (error.message === "RESULT_NOT_READY") {
      return NextResponse.json(
        {
          message: "Result belum tersedia",
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
