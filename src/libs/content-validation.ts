import { z } from "zod";
import { isBlankRichText } from "@/libs/html-text";
import { intField } from "@/libs/validation-helpers";

// Skema FAQ & pengumuman: dipakai form admin (client) DAN API (server).

export const CONTENT_LIMITS = {
  question: 500,
  title: 200,
  category: 100,
  richText: 20_000,
} as const;

export const faqBodySchema = z.object({
  question: z
    .string("Pertanyaan wajib diisi")
    .trim()
    .min(1, "Pertanyaan wajib diisi")
    .max(CONTENT_LIMITS.question, `Pertanyaan maksimal ${CONTENT_LIMITS.question} karakter`),
  answer: z
    .string("Jawaban wajib diisi")
    .max(CONTENT_LIMITS.richText, "Jawaban terlalu panjang")
    .refine((v) => !isBlankRichText(v), "Jawaban wajib diisi"),
  category: z
    .string()
    .trim()
    .max(CONTENT_LIMITS.category, `Kategori maksimal ${CONTENT_LIMITS.category} karakter`)
    .nullish(),
  order: intField("Urutan", 0, 100_000, { fallback: 0 }),
  isActive: z.boolean().default(true),
});

export const announcementBodySchema = z.object({
  title: z
    .string("Judul wajib diisi")
    .trim()
    .min(1, "Judul wajib diisi")
    .max(CONTENT_LIMITS.title, `Judul maksimal ${CONTENT_LIMITS.title} karakter`),
  content: z
    .string("Konten wajib diisi")
    .max(CONTENT_LIMITS.richText, "Konten terlalu panjang")
    .refine((v) => !isBlankRichText(v), "Konten wajib diisi"),
});
