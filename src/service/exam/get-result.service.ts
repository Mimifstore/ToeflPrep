import { prisma } from "@/libs/prisma";

type Props = {
  sessionId: string;

  userId: string;
};

export async function getResultService({ sessionId, userId }: Props) {
  // 🔥 GET SESSION
  const session = await prisma.examSession.findUnique({
    where: {
      id: sessionId,
    },

    include: {
      ujian: {
        include: {
          program: true,
        },
      },

      user: true,

      result: true,
    },
  });

  // ❌ NOT FOUND
  if (!session) {
    throw new Error("RESULT_NOT_FOUND");
  }

  // ❌ NOT OWNER
  if (session.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  // ❌ NOT SUBMITTED
  if (session.status !== "SUBMITTED" && session.status !== "EXPIRED") {
    throw new Error("RESULT_NOT_READY");
  }

  // ❌ RESULT NULL
  if (!session.result) {
    throw new Error("RESULT_NOT_READY");
  }

  return {
    sessionId: session.id,

    status: session.status,

    submittedAt: session.submittedAt,

    user: {
      name: session.user.name,

      email: session.user.email,
    },

    ujian: {
      title: session.ujian.title,

      category: session.ujian.program?.name || "-",
    },

    result: {
      score: session.result.score,

      totalCorrect: session.result.totalCorrect,

      totalWrong: session.result.totalWrong,

      totalQuestion: session.result.totalQuestion,
    },
  };
}
