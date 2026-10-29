import { redirect } from "next/navigation";

import { auth } from "../../../../../../../../auth";

import { prisma } from "@/libs/prisma";

import { hasExamAccess } from "@/libs/exam-acces";

import ExamDetailPage from "@/components/dashboardUser/ujian/ExamDetailPage";

type Props = {
  params: Promise<{
    ujianId: string;
  }>;
};

export default async function ExamPage({
  params,
}: Props) {
  // 🔥 PARAMS
  const { ujianId } =
    await params;

  // 🔥 SESSION
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // 🔥 USER
  const user =
    await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

  if (!user) {
    redirect("/login");
  }

  // 🔥 ACCESS CHECK
  const allowed =
    await hasExamAccess({
      userId: session.user.id,

      ujianId,
    });

  // 🔥 BLOCK
  if (!allowed) {
    redirect("/user/tryout");
  }

  // 🔥 GET UJIAN
  const ujian =
    await prisma.ujian.findUnique({
      where: {
        id: ujianId,
      },

      include: {
        program: true,
      },
    });

  if (!ujian) {
    redirect("/user/tryout");
  }

  return (
    <ExamDetailPage
      exam={ujian}
      user={user}
    />
  );
}