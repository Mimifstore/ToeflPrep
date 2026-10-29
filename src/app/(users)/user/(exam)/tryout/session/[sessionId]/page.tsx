import { notFound, redirect } from "next/navigation";
import ExamLayout from "@/components/dashboardUser/ujian/ExamLayout";
import { prisma } from "@/libs/prisma";
import { buildExamSections } from "@/libs/exam/build-exam-sections";
import { auth } from "../../../../../../../../auth";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { sessionId } = await params;

  const authSession = await auth();
  if (!authSession?.user?.id) return notFound();

  const session = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: {
      ujian: true,
      answers: true,
      audioTracks: true,
      sessionQuestions: {
        include: {
          question: {
            include: {
              options: true,
              section: true,
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  // sesi tidak ada, atau bukan milik user yang sedang login
  if (!session || session.userId !== authSession.user.id) {
    return notFound();
  }

  // Ujian sudah selesai: jangan tampilkan layar ujian lagi, arahkan ke hasilnya
  if (session.status === "SUBMITTED") {
    const result = await prisma.examResult.findUnique({
      where: { sessionId: session.id },
      select: { id: true },
    });
    redirect(result ? `/user/tryout/result/${result.id}` : "/user/riwayat");
  }

  const answerMap = new Map(
    session.answers.map((a) => [a.questionId, a.answer]),
  );
  const audioTrackMap = new Map(
    session.audioTracks.map((a) => [a.questionId, a.playCount]),
  );

  const sections = buildExamSections(
    session.sessionQuestions,
    answerMap,
    audioTrackMap,
  );

  const data = {
    id: session.id,
    status: session.status,
    expiredAt: session.expiredAt,
    remainingTime: session.expiredAt
      ? Math.max(
          0,
          Math.floor(
            (new Date(session.expiredAt).getTime() - Date.now()) / 1000,
          ),
        )
      : null,
    currentQuestionId: session.currentQuestionId,
    currentSection: session.currentSection,
    tabWarning: session.tabWarning,
    fullscreenWarning: session.fullscreenWarning,
    ujian: {
      id: session.ujian.id,
      title: session.ujian.title,
      showNavigation: session.ujian.showNavigation,
      showQuestionNumber: session.ujian.showQuestionNumber,
      autoNextQuestion: session.ujian.autoNextQuestion,
      showPrevNextButton: session.ujian.showPrevNextButton,
      questionDisplayType: session.ujian.questionDisplayType,
      maxExitAttempts: session.ujian.maxExitAttempts,
    },
    sections,
  };

  return <ExamLayout data={data as any} />;
}
