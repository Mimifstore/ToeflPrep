import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { fieldErrorsFromZod } from "@/libs/form-errors";

/** 400 untuk hasil validasi zod: pesan pertama + error per field (dipakai form untuk menandai field merah). */
export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      error: error.issues[0]?.message || "Input tidak valid",
      message: error.issues[0]?.message || "Input tidak valid",
      fieldErrors: fieldErrorsFromZod(error),
    },
    { status: 400 },
  );
}

/** Error yang menempel pada satu field tertentu. */
export function fieldErrorResponse(field: string, message: string, status = 400) {
  return NextResponse.json(
    { error: message, message, fieldErrors: { [field]: message } },
    { status },
  );
}

/** Beberapa field sekaligus (mis. hasil cek kesiapan ujian). */
export function fieldErrorsResponse(
  fieldErrors: Record<string, string>,
  status = 400,
) {
  const first = Object.values(fieldErrors)[0] ?? "Input tidak valid";
  return NextResponse.json({ error: first, message: first, fieldErrors }, { status });
}
