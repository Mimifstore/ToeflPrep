import { z } from "zod";
import { intField } from "@/libs/validation-helpers";

// Skema ujian yang dipakai BERSAMA oleh form admin (client) dan API (server),
// jadi aturan & pesan errornya selalu sama.

export const UJIAN_LIMITS = {
  title: 200,
  descriptionHtml: 50_000,
  price: 100_000_000,
  minutes: 600,
  exitAttempts: 100,
  score: 1000,
} as const;

export const ujianBodySchema = z
  .object({
    title: z
      .string("Judul ujian wajib diisi")
      .trim()
      .min(1, "Judul ujian wajib diisi")
      .max(UJIAN_LIMITS.title, `Judul ujian maksimal ${UJIAN_LIMITS.title} karakter`),
    description: z
      .string()
      .max(UJIAN_LIMITS.descriptionHtml, "Deskripsi terlalu panjang")
      .nullish(),
    price: intField("Harga", 0, UJIAN_LIMITS.price, { required: true }),
    programId: z
      .string("Kategori peminatan wajib dipilih")
      .min(1, "Kategori peminatan wajib dipilih"),
    questionBankId: z
      .string("Judul soal wajib dipilih")
      .min(1, "Judul soal wajib dipilih"),
    timeType: z.enum(["SINGLE", "PER_SECTION"], "Jenis waktu ujian wajib dipilih"),
    totalTime: intField("Durasi ujian", 1, UJIAN_LIMITS.minutes),
    listeningTime: intField("Waktu Listening", 1, UJIAN_LIMITS.minutes),
    structureTime: intField("Waktu Structure", 1, UJIAN_LIMITS.minutes),
    readingTime: intField("Waktu Reading", 1, UJIAN_LIMITS.minutes),
    shuffleQuestions: z.boolean().default(false),
    shuffleAnswers: z.boolean().default(false),
    showAnswer: z.boolean().default(false),
    showNavigation: z.boolean().default(true),
    showQuestionNumber: z.boolean().default(true),
    autoNextQuestion: z.boolean().default(false),
    showPrevNextButton: z.boolean().default(true),
    questionDisplayType: z.enum(["OPTION", "INLINE"]).default("OPTION"),
    maxExitAttempts: intField("Maksimal toleransi keluar", 0, UJIAN_LIMITS.exitAttempts, {
      fallback: 0,
    }),
    passingScore: intField("Nilai lulus", 0, UJIAN_LIMITS.score, { required: true }),
  })
  .superRefine((data, ctx) => {
    if (data.timeType === "SINGLE" && data.totalTime == null) {
      ctx.addIssue({
        code: "custom",
        path: ["totalTime"],
        message: "Durasi ujian wajib diisi (minimal 1 menit)",
      });
    }
    if (
      data.timeType === "PER_SECTION" &&
      data.listeningTime == null &&
      data.structureTime == null &&
      data.readingTime == null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["listeningTime"],
        message: "Isi waktu untuk section yang ada di bank soal",
      });
    }
  });

export type UjianBody = z.infer<typeof ujianBodySchema>;

// ===== STATE FORM =====
export type UjianFormState = {
  programId: string;
  questionBankId: string;
  timeType: string;
  totalTime: string | number;
  listeningTime: string | number;
  structureTime: string | number;
  readingTime: string | number;
  title: string;
  price: string | number;
  description: string;
  shuffleQuestions: string;
  shuffleAnswers: string;
  showAnswer: string;
  showNavigation: string;
  showQuestionNumber: string;
  autoNextQuestion: string;
  showPrevNextButton: string;
  /** Tidak ada di form (belum dipakai peserta), tapi nilai ujian lama dipertahankan saat disimpan. */
  questionDisplayType: string;
  maxExitAttempts: string | number;
  passingScore: string | number;
};

const asText = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/** Nilai awal form. Pengaturan Ya/Tidak langsung terisi nilai default-nya (tidak ada pilihan kosong yang ambigu). */
export function ujianFormFromInitial(initial?: Record<string, any> | null): UjianFormState {
  return {
    programId: asText(initial?.programId),
    questionBankId: asText(initial?.questionBankId),
    timeType: asText(initial?.timeType),
    totalTime: asText(initial?.totalTime),
    listeningTime: asText(initial?.listeningTime),
    structureTime: asText(initial?.structureTime),
    readingTime: asText(initial?.readingTime),
    title: asText(initial?.title),
    price: asText(initial?.price),
    description: asText(initial?.description),
    shuffleQuestions: asText(initial?.shuffleQuestions ?? false),
    shuffleAnswers: asText(initial?.shuffleAnswers ?? false),
    showAnswer: asText(initial?.showAnswer ?? false),
    showNavigation: asText(initial?.showNavigation ?? true),
    showQuestionNumber: asText(initial?.showQuestionNumber ?? true),
    autoNextQuestion: asText(initial?.autoNextQuestion ?? false),
    showPrevNextButton: asText(initial?.showPrevNextButton ?? true),
    questionDisplayType: asText(initial?.questionDisplayType) || "OPTION",
    maxExitAttempts: asText(initial?.maxExitAttempts ?? 0),
    passingScore: asText(initial?.passingScore ?? 450),
  };
}

const toBool = (v: string) => (v === "true" ? true : v === "false" ? false : undefined);

/** State form → input untuk ujianBodySchema (angka dibiarkan teks, skema yang mengonversi + memvalidasi). */
export function ujianInputFromForm(form: UjianFormState) {
  const single = form.timeType === "SINGLE";
  const perSection = form.timeType === "PER_SECTION";

  return {
    ...form,
    // waktu yang tidak relevan untuk tipe yang dipilih dikosongkan, supaya tidak ada sisa nilai lama
    totalTime: single ? form.totalTime : null,
    listeningTime: perSection ? form.listeningTime : null,
    structureTime: perSection ? form.structureTime : null,
    readingTime: perSection ? form.readingTime : null,
    shuffleQuestions: toBool(form.shuffleQuestions),
    shuffleAnswers: toBool(form.shuffleAnswers),
    showAnswer: toBool(form.showAnswer),
    showNavigation: toBool(form.showNavigation),
    showQuestionNumber: toBool(form.showQuestionNumber),
    autoNextQuestion: toBool(form.autoNextQuestion),
    showPrevNextButton: toBool(form.showPrevNextButton),
  };
}
