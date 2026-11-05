const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Waktu relatif dalam bahasa Indonesia: "Baru saja", "5 mnt lalu", "2 jam lalu", "Kemarin".
 * Lebih dari seminggu menampilkan tanggal (zona waktu perangkat), jadi dipakai di sisi browser.
 */
export function formatTimeAgo(iso: string, now: number = Date.now()): string {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "";

  const diff = now - time;
  // Termasuk selisih negatif kalau jam perangkat sedikit lebih lambat dari server.
  if (diff < MINUTE) return "Baru saja";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} mnt lalu`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} jam lalu`;
  if (diff < 2 * DAY) return "Kemarin";
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} hari lalu`;

  return new Date(time).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
