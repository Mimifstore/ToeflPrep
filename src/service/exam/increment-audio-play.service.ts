import { prisma } from "@/libs/prisma";
import { getSessionSections } from "@/libs/exam/session-sections";
import { validateSession } from "./validate-session.service";

type Props = {
  sessionId: string;
  questionId: string;
  userId: string;
  // false = cuma cek masih ada jatah (tidak menambah hitungan)
  // true  = catat 1 pemutaran (dipanggil setelah audio benar-benar bunyi)
  commit?: boolean;
};

export async function incrementAudioPlayService({
  sessionId,
  questionId,
  userId,
  commit = true,
}: Props) {
  const session = await validateSession({ sessionId, userId });

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, audioPlayLimit: true, sectionId: true },
  });

  if (!question) {
    throw new Error("QUESTION_NOT_FOUND");
  }

  // 🔥 SOAL HARUS BAGIAN DARI SESI INI dan dari section yang sedang berjalan
  const inSession = await prisma.examSessionQuestion.findFirst({
    where: { sessionId, questionId },
    select: { id: true },
  });
  if (!inSession) {
    throw new Error("QUESTION_NOT_FOUND");
  }

  const sections = await getSessionSections(sessionId);
  const currentSectionId = sections[session.currentSection]?.id;
  if (!currentSectionId || currentSectionId !== question.sectionId) {
    throw new Error("SECTION_MISMATCH");
  }

  // 🔥 MODE CEK: pastikan masih ada jatah, tanpa menambah hitungan
  if (!commit) {
    const existing = await prisma.examAudioTrack.findUnique({
      where: { sessionId_questionId: { sessionId, questionId } },
    });
    const used = existing?.playCount ?? 0;

    if (question.audioPlayLimit != null && used >= question.audioPlayLimit) {
      throw new Error("AUDIO_LIMIT_EXCEEDED");
    }

    return {
      success: true,
      playCount: used,
      remaining:
        question.audioPlayLimit != null
          ? Math.max(0, question.audioPlayLimit - used)
          : null,
    };
  }

  // 🔥 MODE CATAT — TRANSACTION: atomic check + increment, cegah race condition
  const track = await prisma.$transaction(async (tx) => {
    const existing = await tx.examAudioTrack.findUnique({
      where: { sessionId_questionId: { sessionId, questionId } },
    });

    if (
      question.audioPlayLimit != null &&
      existing &&
      existing.playCount >= question.audioPlayLimit
    ) {
      throw new Error("AUDIO_LIMIT_EXCEEDED");
    }

    return tx.examAudioTrack.upsert({
      where: { sessionId_questionId: { sessionId, questionId } },
      update: { playCount: { increment: 1 } },
      create: { sessionId, questionId, playCount: 1 },
    });
  });

  return {
    success: true,
    playCount: track.playCount,
    remaining:
      question.audioPlayLimit != null
        ? Math.max(0, question.audioPlayLimit - track.playCount)
        : null,
  };
}
