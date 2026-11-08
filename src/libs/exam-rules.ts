import { getSectionTimes } from "@/libs/exam-format";
import type { ExamDetail } from "@/types/user-tryout";

/**
 * Aturan yang berlaku untuk ujian ini, dihitung dari pengaturan ujian (bukan teks tetap),
 * supaya siswa tahu batas waktu dan konsekuensi keluar halaman sebelum mulai.
 */
export function buildExamRules(exam: ExamDetail): string[] {
  const rules: string[] = [];

  if (exam.timeType === "SINGLE") {
    rules.push(
      exam.totalTime
        ? `Waktu pengerjaan ${exam.totalTime} menit, dihitung mundur sejak soal pertama dibuka.`
        : "Waktu pengerjaan dihitung mundur sejak soal pertama dibuka.",
    );
  } else {
    const sections = getSectionTimes(exam)
      .map((section) => `${section.label} ${section.minutes} menit`)
      .join(", ");
    rules.push(
      sections
        ? `Waktu dihitung per section: ${sections}. Section yang waktunya habis tidak bisa dibuka lagi.`
        : "Waktu dihitung per section. Section yang waktunya habis tidak bisa dibuka lagi.",
    );
  }

  rules.push("Ujian berjalan dalam mode layar penuh dan tetap berlangsung walau kamu menutup halaman.");

  rules.push(
    exam.maxExitAttempts > 0
      ? `Pindah tab atau keluar dari layar penuh dicatat sebagai pelanggaran. Setelah ${exam.maxExitAttempts} kali, ujian otomatis diselesaikan.`
      : "Pindah tab atau keluar dari layar penuh akan dicatat selama ujian berlangsung.",
  );

  return rules;
}
