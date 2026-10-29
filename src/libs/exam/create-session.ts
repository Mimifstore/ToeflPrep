import { prisma } from "@/libs/prisma";
import { shuffleArray } from "./shuffle-question";
import { getExpiredTime } from "./get-expired-time";
import { getSectionMinutes } from "./session-sections";

type Props = {
  userId: string;
  ujian: any;
};

// Ujian yang belum bisa dikerjakan (tanpa soal, durasi belum diatur).
// Pesannya aman ditampilkan ke peserta.
export class ExamNotReadyError extends Error {}

export async function createExamSession({ userId, ujian }: Props) {
  // 🔥 URUT BERDASARKAN Section.order (sebelumnya berdasarkan id section yang acak).
  // Soal tanpa section tidak pernah tampil ke peserta, jadi tidak ikut sesi.
  const questions = await prisma.question.findMany({
    where: { examId: ujian.questionBankId, sectionId: { not: null } },
    include: { section: { select: { order: true, title: true } } },
    orderBy: [{ section: { order: "asc" } }, { order: "asc" }],
  });

  if (!questions.some((q) => q.type === "QUESTION")) {
    throw new ExamNotReadyError("Ujian ini belum memiliki soal");
  }

  let finalQuestions = questions;

  if (ujian.shuffleQuestions) {
    const sectionGroups = new Map<string, typeof questions>();

    for (const q of questions) {
      const key = q.sectionId || "no-section";
      if (!sectionGroups.has(key)) sectionGroups.set(key, []);
      sectionGroups.get(key)!.push(q);
    }

    const result: typeof questions = [];

    for (const group of sectionGroups.values()) {
      // 🔥 Pecah 1 section jadi blok-blok kecil, dibatasi tiap ketemu DIRECTION
      type Block = {
        direction: (typeof questions)[0] | null;
        questions: typeof questions;
      };
      const blocks: Block[] = [];
      let currentBlock: Block = { direction: null, questions: [] };
      let hasStarted = false;

      for (const q of group) {
        if (q.type === "DIRECTION") {
          if (hasStarted) {
            blocks.push(currentBlock);
          }
          currentBlock = { direction: q, questions: [] };
          hasStarted = true;
        } else {
          currentBlock.questions.push(q);
          hasStarted = true;
        }
      }
      if (hasStarted) blocks.push(currentBlock);

      // 🔥 Susun ulang: tiap blok, direction-nya (kalau ada) tetap di
      // depan, soal di dalamnya diacak — TAPI urutan antar blok gak diubah
      for (const block of blocks) {
        if (block.direction) result.push(block.direction);
        result.push(...shuffleArray(block.questions));
      }
    }

    finalQuestions = result;
  }

  // 🔥 WAKTU: durasi kosong atau 0 ditolak (dulu ujian langsung kedaluwarsa)
  let expiredAt: Date | null = null;

  if (ujian.timeType === "SINGLE") {
    if (!ujian.totalTime || ujian.totalTime <= 0) {
      throw new ExamNotReadyError("Durasi ujian belum diatur");
    }
    expiredAt = getExpiredTime(ujian.totalTime);
  }

  if (ujian.timeType === "PER_SECTION") {
    const minutes = getSectionMinutes(
      ujian,
      finalQuestions[0].section?.title ?? "",
      0,
    );
    if (!minutes) {
      throw new ExamNotReadyError("Durasi section belum diatur");
    }
    expiredAt = getExpiredTime(minutes);
  }

  // 🔥 SESI DAN SOAL-SOALNYA DIBUAT DALAM SATU OPERASI (atomik): tidak ada
  // sesi kosong yang tertinggal kalau pembuatan soal gagal.
  const firstQuestion = finalQuestions.find((q) => q.type === "QUESTION");

  const session = await prisma.examSession.create({
    data: {
      userId,
      ujianId: ujian.id,
      expiredAt,
      currentSection: 0,
      currentQuestionId: firstQuestion?.id,
      sessionQuestions: {
        create: finalQuestions.map((question, index) => ({
          questionId: question.id,
          order: index + 1,
        })),
      },
    },
  });

  return session;
}
