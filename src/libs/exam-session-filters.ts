import type { Prisma } from "@prisma/client";

/**
 * Sesi ujian milik siswa yang masih bisa dilanjutkan: status ONGOING dan belum lewat waktunya.
 * Ujian dengan waktu per section selalu ikut, karena habisnya waktu satu section tidak menutup sesi
 * (peserta lanjut ke section berikutnya).
 */
export function activeSessionWhere(
  userId: string,
  now: Date = new Date(),
): Prisma.ExamSessionWhereInput {
  return {
    userId,
    status: "ONGOING",
    OR: [
      { expiredAt: null },
      { expiredAt: { gt: now } },
      { ujian: { timeType: "PER_SECTION" } },
    ],
  };
}
