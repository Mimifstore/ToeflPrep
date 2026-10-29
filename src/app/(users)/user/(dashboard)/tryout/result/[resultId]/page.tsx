import { notFound, redirect } from "next/navigation";
import { prisma } from "@/libs/prisma";
import ResultScreen from "@/components/dashboardUser/tryout/ResultScreen";
import { auth } from "../../../../../../../../auth";
import { calculateResult } from "@/service/exam/calculate-result.service";

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

  // 🔥 AUTH
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

  // 🔥 VALIDASI OWNER
  if (result.session.userId !== session.user.id) return notFound();

  // 🔥 RINCIAN (kategori, skor maksimal, program): pakai yang tersimpan saat submit.
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

  const data = {
    id: result.id,
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