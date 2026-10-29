/** Huruf depan buat avatar: dari nama, kalau kosong dari email, kalau kosong juga "?". */
export function getInitial(name?: string | null, email?: string | null): string {
  for (const source of [name, email]) {
    const char = Array.from((source ?? "").trim()).find((c) => /[\p{L}\p{N}]/u.test(c));
    if (char) return char.toLocaleUpperCase();
  }
  return "?";
}
