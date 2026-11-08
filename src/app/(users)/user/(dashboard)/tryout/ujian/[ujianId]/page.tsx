import { redirect } from "next/navigation";
import ExamDetailPage from "@/components/dashboardUser/ujian/ExamDetailPage";
import { hasExamAccess } from "@/libs/exam-acces";
import { activeSessionWhere } from "@/libs/exam-session-filters";
import { prisma } from "@/libs/prisma";
import { auth } from "../../../../../../../../auth";

type Props = {
  params: Promise<{ ujianId: string }>;
};

export default async function ExamPage({ params }: Props) {
  const { ujianId } = await params;

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const [user, allowed, ujian, ongoing] = await Promise.all([
    // Hanya nama & email yang boleh sampai ke browser. Jangan kirim seluruh baris User (ada hash password).
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    hasExamAccess({ userId, ujianId }),
    prisma.ujian.findUnique({
      where: { id: ujianId },
      select: {
        id: true,
        title: true,
        description: true,
        programId: true,
        timeType: true,
        totalTime: true,
        listeningTime: true,
        structureTime: true,
        readingTime: true,
        maxExitAttempts: true,
        program: { select: { name: true } },
      },
    }),
    // Sesi ujian ini yang masih bisa dilanjutkan (kalau ada), supaya tombolnya jadi "Lanjutkan".
    prisma.examSession.findFirst({
      where: { ...activeSessionWhere(userId), ujianId },
      orderBy: { startedAt: "desc" },
      select: { id: true },
    }),
  ]);

  if (!user) redirect("/login");
  if (!allowed || !ujian) redirect("/user/tryout");

  return <ExamDetailPage exam={ujian} user={user} ongoingSessionId={ongoing?.id ?? null} />;
}
