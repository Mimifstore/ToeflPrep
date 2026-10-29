import { prisma } from "@/libs/prisma";
export const dynamic = "force-dynamic";
import { validateSession } from "./validate-session.service";

type Props = {
  sessionId: string;
  userId: string;
};

type SectionMapType = {
  id: string;
  title: string;
  direction: string | null;
  order: number;
  questions: any[];
};

export async function getSessionService({ sessionId, userId }: Props) {
  const session = await validateSession({
    sessionId,
    userId,
  });

  const sessionQuestions = await prisma.examSessionQuestion.findMany({
    where: { sessionId },
    orderBy: { order: "asc" },
    include: {
      question: {
        include: {
          options: {
            select: { id: true, label: true, text: true },
          },
          section: true,
        },
      },
    },
  });

  const answers = await prisma.examAnswer.findMany({
    where: { sessionId },
    select: { questionId: true, answer: true },
  });

  const audioTracks = await prisma.examAudioTrack.findMany({
    where: { sessionId },
  });

  const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]));
  const audioTrackMap = new Map(
    audioTracks.map((a) => [a.questionId, a.playCount]),
  );

  //  REMAINING TIME
  const remainingTime = session.expiredAt
    ? Math.max(
        0,
        Math.floor((new Date(session.expiredAt).getTime() - Date.now()) / 1000),
      )
    : 0;

  const sectionMap = new Map<string, SectionMapType>();

  const currentDirectionPerSection = new Map<string, string | null>();

  for (const item of sessionQuestions) {
    const section = item.question.section;
    if (!section) continue;

    if (!sectionMap.has(section.id)) {
      sectionMap.set(section.id, {
        id: section.id,
        title: section.title,
        direction: section.direction,
        order: section.order,
        questions: [],
      });
      currentDirectionPerSection.set(section.id, null);
    }

    const existingSection = sectionMap.get(section.id);
    if (!existingSection) continue;

    if (item.question.type === "DIRECTION") {
      currentDirectionPerSection.set(
        section.id,
        item.question.directionText || item.question.questionText || null,
      );
      continue;
    }

    existingSection.questions.push({
      id: item.question.id,
      order: existingSection.questions.length + 1,
      type: item.question.type,
      question: item.question.questionText,
      audio: item.question.audioUrl,
      image: item.question.imageUrl,
      audioPlayLimit: item.question.audioPlayLimit,
      options: item.question.options,
      playCount: audioTrackMap.get(item.question.id) || 0,
      answer: answerMap.get(item.question.id) || null,
      passageDirection: currentDirectionPerSection.get(section.id) ?? null,
    });
  }

  //  SAFE RESPONSE
  return {
    id: session.id,
    status: session.status,
    expiredAt: session.expiredAt,
    remainingTime,
    currentQuestionId: session.currentQuestionId,
    ujian: {
      id: session.ujian.id,
      title: session.ujian.title,
      showNavigation: session.ujian.showNavigation,
      showQuestionNumber: session.ujian.showQuestionNumber,
      autoNextQuestion: session.ujian.autoNextQuestion,
      showPrevNextButton: session.ujian.showPrevNextButton,
      questionDisplayType: session.ujian.questionDisplayType,
    },
    sections: Array.from(sectionMap.values()).sort((a, b) => a.order - b.order),
  };
}
