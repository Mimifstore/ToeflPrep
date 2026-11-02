import type { ZodError } from "zod";

/** Pesan error per field. Kunci "_form" = error umum yang bukan milik satu field. */
export type FieldErrors = Record<string, string>;

/** Atribut penanda wrapper field yang sedang error (dipakai untuk scroll + fokus). */
export const FIELD_ERROR_ATTR = "data-field-error";

/** Error pertama dari tiap field (berdasarkan path teratas) di hasil validasi zod. */
export function fieldErrorsFromZod(error: ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    if (!(key in errors)) errors[key] = issue.message;
  }
  return errors;
}

export type ApiFailure = { message: string; fieldErrors: FieldErrors };

/** Baca respons error dari API: pesan utama + error per field (kalau server mengirimnya). */
export async function readApiFailure(
  res: Response,
  fallback: string,
): Promise<ApiFailure> {
  try {
    const data = await res.json();
    const fieldErrors: FieldErrors =
      data && typeof data.fieldErrors === "object" && data.fieldErrors
        ? data.fieldErrors
        : {};
    const message =
      (typeof data?.error === "string" && data.error) ||
      (typeof data?.message === "string" && data.message) ||
      fallback;
    return { message, fieldErrors };
  } catch {
    return { message: fallback, fieldErrors: {} };
  }
}

/**
 * Scroll ke field error pertama (urutan di halaman) lalu fokuskan input-nya.
 * Return true kalau ada field error.
 */
export function focusFirstError(root: ParentNode = document): boolean {
  const first = root.querySelector<HTMLElement>(`[${FIELD_ERROR_ATTR}="true"]`);
  if (!first) return false;

  first.scrollIntoView({ block: "center", behavior: "smooth" });
  first
    .querySelector<HTMLElement>(
      "input:not([type=hidden]):not([disabled]), textarea:not([disabled]), select:not([disabled]), .ql-editor, [data-select-trigger]",
    )
    ?.focus({ preventScroll: true });
  return true;
}
