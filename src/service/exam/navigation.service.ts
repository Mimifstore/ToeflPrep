import { prisma } from "@/libs/prisma";

import { validateSession } from "./validate-session.service";

type Props = {
  sessionId: string;

  questionId: string;

  userId: string;
};

export async function navigationService({
  sessionId,
  questionId,
  userId,
}: Props) {
  // 🔥 VALIDATE SESSION
  await validateSession({
    sessionId,
    userId,
  });

  // 🔥 VALIDATE QUESTION
  const sessionQuestion = await prisma.examSessionQuestion.findFirst({
    where: {
      sessionId,

      questionId,
    },
  });

  if (!sessionQuestion) {
    throw new Error("QUESTION_NOT_FOUND");
  }

  // 🔥 UPDATE CURRENT QUESTION
  await prisma.examSession.update({
    where: {
      id: sessionId,
    },

    data: {
      currentQuestionId: questionId,
    },
  });

  return {
    success: true,
  };
}
