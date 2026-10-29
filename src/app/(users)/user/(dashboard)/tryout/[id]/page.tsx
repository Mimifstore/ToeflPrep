import TryoutExamTable from "@/components/dashboardUser/tryout/TryoutExamTable";
import { auth } from "../../../../../../../auth";
import { prisma } from "@/libs/prisma";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();

  const accesses = await prisma.userExamAccess.findMany({
    where: { userId: session?.user?.id },
    select: { ujianId: true },
  });

  const accessIds = accesses.map((item) => item.ujianId);

  // 🔥 CEK STATUS MEMBER
  const siswa = await prisma.siswa.findUnique({
    where: { userId: session?.user?.id },
    select: { isMember: true },
  });

  return (
    <TryoutExamTable
      programId={id}
      accessIds={accessIds}
      isMember={siswa?.isMember || false}
    />
  );
}