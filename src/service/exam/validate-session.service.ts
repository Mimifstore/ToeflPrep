import { prisma } from "@/libs/prisma";

type Props = {
  sessionId: string;

  userId: string;
};

// Toleransi keterlambatan jaringan dan debounce: jawaban yang dikirim beberapa
// detik setelah waktu habis (tapi ditekan sebelum habis) tetap diterima.
const EXPIRY_GRACE_MS = 10_000;

export async function validateSession({ sessionId, userId }: Props) {
  const session = await prisma.examSession.findUnique({
    where: {
      id: sessionId,
    },

    include: {
      ujian: true,
    },
  });

  //  NOT FOUND
  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  //  NOT OWNER
  if (session.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  //  SUBMITTED
  if (session.status !== "ONGOING") {
    throw new Error("SESSION_FINISHED");
  }

  //  EXPIRED
  if (
    session.expiredAt &&
    Date.now() > new Date(session.expiredAt).getTime() + EXPIRY_GRACE_MS
  ) {
    // Waktu per section yang habis cuma menolak jawaban; sesi TIDAK ditutup,
    // karena peserta masih harus bisa lanjut ke section berikutnya.
    // Hanya waktu total (SINGLE) yang menutup sesi.
    if (session.ujian.timeType !== "PER_SECTION") {
      await prisma.examSession.update({
        where: {
          id: session.id,
        },

        data: {
          status: "EXPIRED",
        },
      });
    }

    throw new Error("SESSION_EXPIRED");
  }

  return session;
}
