import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { calculateResult } from "@/service/exam/calculate-result.service";
import { logAudit } from "@/libs/audit-log";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const session = await prisma.examSession.findUnique({
      where: { id: params.id },
    });

    if (!session) {
      return NextResponse.json({ message: "Session tidak ditemukan" }, { status: 404 });
    }

    if (session.status === "SUBMITTED") {
      return NextResponse.json({ message: "Session sudah disubmit" }, { status: 400 });
    }

    const result = await calculateResult({ sessionId: params.id });

    await prisma.$transaction(async (tx) => {
      await tx.examSession.update({
        where: { id: params.id },
        data: { status: "SUBMITTED", submittedAt: new Date() },
      });

      await tx.examResult.create({
        data: {
          sessionId: params.id,
          totalCorrect: result.totalCorrect,
          totalWrong: result.totalWrong,
          totalQuestion: result.totalQuestion,
          score: result.score,
        },
      });
    });

    await logAudit({
      actorId: session!.userId,
      action: "FORCE_SUBMIT",
      targetId: params.id,
      metadata: { score: result.score },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("FORCE SUBMIT ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}