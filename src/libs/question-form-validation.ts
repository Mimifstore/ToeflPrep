import { isBlankRichText } from "@/libs/html-text";
import type { FieldErrors } from "@/libs/form-errors";

// Validasi form butir soal di sisi client. Aturannya sejajar dengan server (libs/question-validation.ts),
// tapi mengumpulkan SEMUA masalah sekaligus supaya semua kolom bermasalah bisa ditandai merah.

export const OPTION_LABELS = ["A", "B", "C", "D"] as const;

export type QuestionFormValues = {
  type: string;
  sectionId: string;
  categoryId: string;
  useAudio: string;
  audio: File | null;
  audioUrl: string;
  audioLimit: string | number;
  question: string;
  direction: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
};

export function validateQuestionForm(form: QuestionFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.sectionId) errors.sectionId = "Section wajib dipilih";

  if (form.type === "DIRECTION") {
    if (isBlankRichText(form.direction)) errors.direction = "Direction wajib diisi";
    return errors;
  }

  if (!form.categoryId) errors.categoryId = "Kategori Penilaian wajib dipilih";
  if (isBlankRichText(form.question)) errors.question = "Soal wajib diisi";

  for (const label of OPTION_LABELS) {
    const key = `option${label}` as const;
    if (isBlankRichText(form[key])) errors[key] = `Pilihan ${label} wajib diisi`;
  }

  if (!form.correctAnswer) errors.correctAnswer = "Jawaban wajib dipilih";

  if (form.useAudio === "yes") {
    if (!form.audio && !form.audioUrl) {
      errors.audio = 'Pilih file audio, atau ubah "Tambah Audio" menjadi Tidak';
    }
    const limit = String(form.audioLimit ?? "").trim();
    if (limit !== "" && !/^\d+$/.test(limit)) {
      errors.audioLimit = "Batas putar harus bilangan bulat 0 atau lebih";
    }
  }

  return errors;
}
