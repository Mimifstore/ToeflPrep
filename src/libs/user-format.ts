const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

/** Tanda untuk tanggal yang kosong atau rusak. */
const EMPTY = "–";

/** "6 Nov 2026" (zona waktu perangkat). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return EMPTY;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? EMPTY : date.toLocaleDateString("id-ID", DATE_OPTIONS);
}

/** "6 Nov 2026, 14.30" (zona waktu perangkat). */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return EMPTY;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return EMPTY;
  return date.toLocaleDateString("id-ID", { ...DATE_OPTIONS, hour: "2-digit", minute: "2-digit" });
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Terbit dalam 24 jam terakhir (dipakai penanda "Baru" di pengumuman). */
export function isWithinLastDay(iso: string, now: number = Date.now()): boolean {
  const time = new Date(iso).getTime();
  return !Number.isNaN(time) && now - time < DAY_MS;
}
