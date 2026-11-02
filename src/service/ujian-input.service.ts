import type { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import {
  fieldErrorResponse,
  fieldErrorsResponse,
  validationErrorResponse,
} from "@/libs/api-errors";
import { isBlankHtml, sanitizeRichText } from "@/libs/question-validation";
import { readinessFieldErrors } from "@/libs/ujian-readiness";
import { ujianBodySchema, type UjianBody } from "@/libs/ujian-validation";
import { checkUjianReadiness } from "@/service/ujian-readiness.service";

const MAX_DESCRIPTION = 20_000; // setelah disanitasi

export type UjianExisting = {
  questionBankId: string;
  timeType: string;
  /** true kalau sudah ada peserta yang mengerjakan ujian ini. */
  hasSessions: boolean;
};

export type PreparedUjian =
  | { ok: true; data: UjianBody }
  | { ok: false; response: NextResponse };

const fail = (field: string, message: string, status = 400): PreparedUjian => ({
  ok: false,
  response: fieldErrorResponse(field, message, status),
});

/**
 * Validasi + bersihkan input ujian untuk POST (buat) dan PATCH (ubah).
 * Urutan: bentuk data → deskripsi → program & bank soal ada → kunci (kalau sudah dikerjakan) → kesiapan.
 */
export async function prepareUjianInput(
  body: unknown,
  existing?: UjianExisting,
): Promise<PreparedUjian> {
  const parsed = ujianBodySchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, response: validationErrorResponse(parsed.error) };
  }
  const input = parsed.data;

  let description: string | null = null;
  if (input.description) {
    const clean = sanitizeRichText(input.description);
    description = isBlankHtml(clean) ? null : clean;
  }
  if (description && description.length > MAX_DESCRIPTION) {
    return fail("description", "Deskripsi terlalu panjang");
  }

  const [program, bank] = await Promise.all([
    prisma.program.findUnique({ where: { id: input.programId }, select: { id: true } }),
    prisma.exam.findUnique({ where: { id: input.questionBankId }, select: { id: true } }),
  ]);
  if (!program) return fail("programId", "Kategori peminatan tidak ditemukan", 404);
  if (!bank) return fail("questionBankId", "Judul soal tidak ditemukan", 404);

  // Ujian yang sudah dikerjakan: sesi peserta memakai bank soal & jenis waktu yang lama.
  if (existing?.hasSessions) {
    if (input.questionBankId !== existing.questionBankId) {
      return fail(
        "questionBankId",
        "Judul soal tidak bisa diganti karena ujian ini sudah dikerjakan peserta",
      );
    }
    if (input.timeType !== existing.timeType) {
      return fail(
        "timeType",
        "Jenis waktu tidak bisa diganti karena ujian ini sudah dikerjakan peserta",
      );
    }
  }

  const readiness = await checkUjianReadiness(input);
  if (!readiness.ready) {
    return { ok: false, response: fieldErrorsResponse(readinessFieldErrors(readiness)) };
  }

  return { ok: true, data: { ...input, description } };
}
