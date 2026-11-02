import { z } from "zod";
import { intField } from "@/libs/validation-helpers";

// Skema bank soal (Exam): dipakai form admin (client) DAN API (server).

export const bankSoalBodySchema = z.object({
  title: z
    .string("Judul soal wajib diisi")
    .trim()
    .min(1, "Judul soal wajib diisi")
    .max(200, "Judul soal maksimal 200 karakter"),
  categoryId: z.string("Kategori wajib dipilih").min(1, "Kategori wajib dipilih"),
  // Hanya informasi di daftar admin (tidak memengaruhi soal atau peserta).
  totalOption: intField("Jumlah pilihan", 0, 10, { fallback: 0 }),
  totalSession: intField("Jumlah sesi", 0, 20, { fallback: 0 }),
  // Tiga pengaturan berikut tidak lagi ditampilkan di form (belum/tidak dipakai peserta),
  // nilainya dipertahankan apa adanya.
  useCategoryScore: z.boolean().default(true),
  scoringType: z.string().default("PER_KATEGORI"),
  showCorrection: z.boolean().default(false),
  /** Skor minimal agar peserta boleh melihat pembahasan. Kosong = semua peserta. */
  minScoreToShow: intField("Skor minimal", 0, 10_000),
});

export type BankSoalBody = z.infer<typeof bankSoalBodySchema>;
