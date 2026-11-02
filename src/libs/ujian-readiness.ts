import { getSectionMinutes, sectionTimeField } from "@/libs/exam/section-minutes";

// Apakah sebuah ujian SIAP dikerjakan peserta? Murni logika (tanpa database),
// dipakai form admin, API admin, pembayaran, dan daftar ujian peserta.

export type BankSectionInfo = {
  id: string;
  title: string;
  order: number;
  /** Semua baris soal di section ini (soal + petunjuk/direction). */
  questionCount: number;
  /** Hanya butir soal (type QUESTION). */
  realQuestionCount: number;
};

export type BankInfo = {
  sections: BankSectionInfo[];
  /** Soal yang belum dimasukkan ke section (tidak pernah tampil ke peserta). */
  unassignedQuestions: number;
};

export type ReadinessInput = {
  timeType?: string | null;
  totalTime?: number | null;
  listeningTime?: number | null;
  structureTime?: number | null;
  readingTime?: number | null;
};

export type ReadinessProblem = { field: string; message: string };

export type Readiness = {
  ready: boolean;
  /** Menghalangi ujian dipakai. `field` = nama field form yang perlu diperbaiki. */
  problems: ReadinessProblem[];
  /** Tidak menghalangi, tapi perlu diketahui admin. */
  warnings: string[];
};

export function evaluateReadiness(ujian: ReadinessInput, bank: BankInfo): Readiness {
  const problems: ReadinessProblem[] = [];
  const warnings: string[] = [];

  // Section yang benar-benar dipakai sesi ujian (punya baris soal), berurutan seperti saat peserta mengerjakan.
  const active = bank.sections
    .filter((s) => s.questionCount > 0)
    .sort((a, b) => a.order - b.order);
  const realQuestions = active.reduce((n, s) => n + s.realQuestionCount, 0);

  if (realQuestions === 0) {
    problems.push({
      field: "questionBankId",
      message:
        "Bank soal ini belum punya soal di dalam section. Tambahkan soal terlebih dahulu.",
    });
  }

  if (bank.unassignedQuestions > 0) {
    warnings.push(
      `${bank.unassignedQuestions} soal belum masuk section sehingga tidak tampil ke peserta.`,
    );
  }

  if (ujian.timeType === "SINGLE") {
    if (!(typeof ujian.totalTime === "number" && ujian.totalTime > 0)) {
      problems.push({
        field: "totalTime",
        message: "Durasi ujian wajib diisi (minimal 1 menit)",
      });
    }
  } else if (ujian.timeType === "PER_SECTION") {
    active.forEach((section, index) => {
      if (getSectionMinutes(ujian, section.title, index)) return;

      const field = sectionTimeField(section.title, index);
      problems.push(
        field
          ? {
              field,
              message: `Waktu section ${section.title} wajib diisi (minimal 1 menit)`,
            }
          : {
              field: "timeType",
              message: `Section ${section.title} tidak punya pengaturan waktu. Namai section Listening, Structure, atau Reading, atau gunakan waktu tunggal.`,
            },
      );
    });
  }

  return { ready: problems.length === 0, problems, warnings };
}

/** Problem → { namaField: pesan } (pesan pertama per field). */
export function readinessFieldErrors(readiness: Readiness): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const p of readiness.problems) if (!(p.field in errors)) errors[p.field] = p.message;
  return errors;
}
