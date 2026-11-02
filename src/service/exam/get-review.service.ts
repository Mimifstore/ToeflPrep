import { prisma } from "@/libs/prisma";
import { buildExamSections } from "@/libs/exam/build-exam-sections";
import { getReviewAccess } from "@/libs/exam/review-access";

export type ReviewErrorCode = "NOT_FOUND" | "DISABLED" | "LOCKED";

export class ReviewError extends Error {
  constructor(
    public code: ReviewErrorCode,
    public minScore?: number,
  ) {
    super(code);
  }
}

export type ReviewOptionView = {
  /** Label asli pilihan (A–D), dipakai untuk mencocokkan kunci & jawaban. */
  label: string;
  /** Huruf yang dilihat peserta saat ujian (mengikuti posisi, bisa beda dari label bila jawaban diacak). */
  letter: string;
  text: string;
  isCorrect: boolean;
  isSelected: boolean;
};

export type ReviewQuestionView = {
  id: string;
  number: number;
  question: string;
  directionBefore: string | null;
  options: ReviewOptionView[];
  userAnswer: string | null;
  correctAnswer: string | null;
  status: "correct" | "wrong" | "unanswered";
  explanation: string | null;
};

export type ReviewData = {
  resultId: string;
  examTitle: string;
  score: number;
  totalQuestion: number;
  correct: number;
  wrong: number;
  unanswered: number;
  sections: Array<{ id: string; title: string; questions: ReviewQuestionView[] }>;
};

/** Boleh/tidaknya pembahasan dibuka untuk sebuah hasil (dipakai halaman hasil untuk menampilkan tombolnya). */
export async function getReviewAccessForResult(input: {
  showAnswer: boolean;
  score: number;
  questionBankId: string;
}) {
  const bank = await prisma.exam.findUnique({
    where: { id: input.questionBankId },
    select: { minScoreToShow: true },
  });
  return getReviewAccess({
    showAnswer: input.showAnswer,
    score: input.score,
    minScoreToShow: bank?.minScoreToShow,
  });
}

/**
 * Data pembahasan: soal, jawaban peserta, kunci, dan penjelasan, dengan urutan soal & pilihan
 * yang SAMA seperti saat peserta mengerjakan. Kunci jawaban hanya dikirim bila akses dibuka.
 */
export async function getReviewService({
  resultId,
  userId,
}: {
  resultId: string;
  userId: string;
}): Promise<ReviewData> {
  const result = await prisma.examResult.findUnique({
    where: { id: resultId },
    include: {
      session: {
        include: {
          ujian: true,
          answers: true,
          sessionQuestions: {
            include: { question: { include: { options: true, section: true } } },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  // Hasil milik orang lain diperlakukan sama seperti tidak ada.
  if (!result || result.session.userId !== userId) throw new ReviewError("NOT_FOUND");

  const { session } = result;
  const access = await getReviewAccessForResult({
    showAnswer: session.ujian.showAnswer,
    score: result.score,
    questionBankId: session.ujian.questionBankId,
  });
  if (access.state === "disabled") throw new ReviewError("DISABLED");
  if (access.state === "locked") throw new ReviewError("LOCKED", access.minScore);

  const answerMap = new Map<string, string | null>(
    session.answers.map((a: { questionId: string; answer: string | null }) => [
      a.questionId,
      a.answer,
    ]),
  );
  const raw = new Map<string, { correctAnswer: string | null; explanation: string | null }>(
    session.sessionQuestions.map((s: any) => [
      s.question.id,
      { correctAnswer: s.question.correctAnswer, explanation: s.question.explanation },
    ]),
  );

  const built = buildExamSections(session.sessionQuestions, answerMap, new Map(), {
    shuffleAnswers: session.ujian.shuffleAnswers,
    seed: session.id,
  });

  let correct = 0;
  let wrong = 0;
  let unanswered = 0;

  const sections = built.map((section: any) => ({
    id: section.id as string,
    title: section.title as string,
    questions: section.questions.map((q: any): ReviewQuestionView => {
      const meta = raw.get(q.id);
      const userAnswer: string | null = q.answer || null;
      const correctAnswer = meta?.correctAnswer ?? null;

      const status = !userAnswer
        ? "unanswered"
        : userAnswer === correctAnswer
          ? "correct"
          : "wrong";
      if (status === "correct") correct += 1;
      else if (status === "wrong") wrong += 1;
      else unanswered += 1;

      return {
        id: q.id,
        number: q.order,
        question: q.question ?? "",
        directionBefore: q.directionBefore ?? null,
        userAnswer,
        correctAnswer,
        status,
        explanation: meta?.explanation ?? null,
        options: q.options.map((o: { id: string; text: string }, index: number) => ({
          label: o.id,
          letter: String.fromCharCode(65 + index),
          text: o.text,
          isCorrect: o.id === correctAnswer,
          isSelected: o.id === userAnswer,
        })),
      };
    }),
  }));

  return {
    resultId: result.id,
    examTitle: session.ujian.title,
    score: result.score,
    totalQuestion: correct + wrong + unanswered,
    correct,
    wrong,
    unanswered,
    sections,
  };
}
