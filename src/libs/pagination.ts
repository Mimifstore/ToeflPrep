export type PageItem = number | "ellipsis-start" | "ellipsis-end";

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

/**
 * Daftar tombol halaman yang ringkas: halaman pertama, terakhir, dan sekitar halaman aktif.
 * Contoh (aktif 10 dari 20): 1 … 9 10 11 … 20. Titik-titik hanya dipakai kalau ada minimal
 * dua halaman yang disembunyikan (satu halaman saja ditampilkan langsung).
 */
export function getPageItems(current: number, total: number, siblings = 1): PageItem[] {
  // 1 + … + (aktif ± siblings) + … + terakhir
  const fixedSlots = siblings * 2 + 5;
  if (total <= fixedSlots) return range(1, total);

  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, total);
  const gapLeft = left > 3;
  const gapRight = right < total - 2;
  // Jumlah halaman yang ditampilkan di sisi yang tidak punya celah.
  const edge = siblings * 2 + 3;

  if (!gapLeft && gapRight) return [...range(1, edge), "ellipsis-end", total];
  if (gapLeft && !gapRight) return [1, "ellipsis-start", ...range(total - edge + 1, total)];
  return [1, "ellipsis-start", ...range(left, right), "ellipsis-end", total];
}
