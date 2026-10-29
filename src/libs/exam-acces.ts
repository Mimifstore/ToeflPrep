import { prisma } from "@/libs/prisma";

type Props = {
  userId: string;
  ujianId: string;
};

export async function hasExamAccess({ userId, ujianId }: Props) {
  //  CEK MEMBER DULU — kalau member, otomatis punya akses ke semua ujian
  const siswa = await prisma.siswa.findUnique({
    where: { userId },
    select: { isMember: true },
  });

  if (siswa?.isMember) {
    return true;
  }

  //  KALAU BUKAN MEMBER, CEK AKSES NORMAL
  const access = await prisma.userExamAccess.findUnique({
    where: {
      userId_ujianId: { userId, ujianId },
    },
  });

  return !!access;
}
