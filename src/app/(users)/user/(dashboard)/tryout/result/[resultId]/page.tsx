import { notFound, redirect } from "next/navigation";
import { prisma } from "@/libs/prisma";
import ResultScreen from "@/components/dashboardUser/tryout/ResultScreen";
import { auth } from "../../../../../../../../auth";
import { calculateResult } from "@/service/exam/calculate-result.service";
import { getPassStatus } from "@/libs/exam/review-access";
import { getReviewAccessForResult } from "@/service/exam/get-review.service";

type Props = {
  params: Promise<{ resultId: string }>;
};

type ResultDetails = {
  maxScore: number;
  program: string;
  categories: any[];
};

export default async function Page({ params }: Props) {
  const { resultId } = await params;

  // AUTH
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const result = await prisma.examResult.findUnique({
    where: { id: resultId },
    include: {
      session: {
        include: { ujian: true },
      },
    },
  });

  if (!result) return notFound();

  // VALIDASI OWNER
  if (result.session.userId !== session.user.id) return notFound();

  // RINCIAN (kategori, skor maksimal, program): pakai yang tersimpan saat submit.
  // Hasil lama yang belum punya rincian dihitung sekali, lalu disimpan.
  let details = result.details as ResultDetails | null;

  if (!details) {
    const calculated = await calculateResult({ sessionId: result.sessionId });

    details = {
      maxScore: calculated.maxScore,
      program: calculated.program,
      categories: calculated.categoryResults,
    };

    try {
      await prisma.examResult.update({
        where: { id: result.id },
        data: { details },
      });
    } catch (e) {
      // gagal menyimpan tidak boleh merusak halaman hasil
      console.error("SAVE RESULT DETAILS ERROR:", e);
    }
  }

  // Status lulus dan akses pembahasan mengikuti pengaturan ujian dari admin.
  const ujian = result.session.ujian;
  const pass = getPassStatus(result.score, ujian.passingScore);
  const reviewAccess = await getReviewAccessForResult({
    showAnswer: ujian.showAnswer,
    score: result.score,
    questionBankId: ujian.questionBankId,
  });

  const data = {
    id: result.id,
    passingScore: pass.hasThreshold ? ujian.passingScore : null,
    passed: pass.passed,
    review:
      reviewAccess.state === "open"
        ? ({ state: "open", href: `/user/tryout/result/${result.id}/review` } as const)
        : reviewAccess.state === "locked"
          ? ({ state: "locked", minScore: reviewAccess.minScore } as const)
          : null,
    examTitle: result.session.ujian.title,
    score: result.score,
    maxScore: details.maxScore,
    program: details.program,
    totalQuestion: result.totalQuestion,
    correctAnswer: result.totalCorrect,
    wrongAnswer: result.totalWrong,
    categories: details.categories,
  };

  return <ResultScreen data={data} />;
}