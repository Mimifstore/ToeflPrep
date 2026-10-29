import { prisma } from "@/libs/prisma";
import { getSessionSections } from "@/libs/exam/session-sections";

import { validateSession } from "./validate-session.service";

type Props = {
  sessionId: string;

  questionId: string;

  answer: string;

  userId: string;
};

export async function saveAnswerService({
  sessionId,
  questionId,
  answer,
  userId,
}: Props) {
  const session = await validateSession({
    sessionId,
    userId,
  });

  // 🔥 VALIDATE QUESTION IN SESSION
  const sessionQuestion = await prisma.examSessionQuestion.findFirst({
    where: {
      sessionId,
      questionId,
    },
    include: {
      question: { select: { sectionId: true } },
    },
  });

  if (!sessionQuestion) {
    throw new Error("QUESTION_NOT_FOUND");
  }

  // 🔥 HANYA SOAL DI SECTION YANG SEDANG BERJALAN.
  // Tanpa ini, jawaban untuk section yang waktunya sudah habis masih bisa
  // dikirim lewat API langsung selama ujian berlangsung.
  const sections = await getSessionSections(sessionId);
  const currentSectionId = sections[session.currentSection]?.id;

  if (
    !currentSectionId ||
    currentSectionId !== sessionQuestion.question.sectionId
  ) {
    throw new Error("SECTION_MISMATCH");
  }

  const option = await prisma.questionOption.findFirst({
    where: {
      label: answer,
      questionId,
    },
  });

  if (!option) {
    throw new Error("INVALID_OPTION");
  }

  // 🔥 UPSERT ANSWER
  const saved = await prisma.examAnswer.upsert({
    where: {
      sessionId_questionId: {
        sessionId,

        questionId,
      },
    },

    update: {
      answer,

      answeredAt: new Date(),
    },

    create: {
      sessionId,

      questionId,

      answer,
    },
  });

  return saved;
}
