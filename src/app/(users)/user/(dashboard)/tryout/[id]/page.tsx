import { notFound, redirect } from "next/navigation";
import TryoutExamTable from "@/components/dashboardUser/tryout/TryoutExamTable";
import { prisma } from "@/libs/prisma";
import { auth } from "../../../../../../../auth";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  const userId = session?.user?.id;
  // Tanpa userId, filter `{ userId: undefined }` di Prisma cocok ke SEMUA siswa. Jangan lanjut.
  if (!userId) redirect("/login");

  const [program, accesses, siswa] = await Promise.all([
    prisma.program.findUnique({
      where: { id },
      select: { id: true, name: true, description: true },
    }),
    prisma.userExamAccess.findMany({
      where: { userId },
      select: { ujianId: true },
    }),
    // Status member: member otomatis punya akses ke semua ujian.
    prisma.siswa.findUnique({
      where: { userId },
      select: { isMember: true },
    }),
  ]);

  if (!program) notFound();

  return (
    <TryoutExamTable
      program={program}
      accessIds={accesses.map((item: { ujianId: string }) => item.ujianId)}
      isMember={siswa?.isMember ?? false}
    />
  );
}
