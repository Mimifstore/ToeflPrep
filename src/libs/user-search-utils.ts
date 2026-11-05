const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Tanggal dalam WIB (UTC+7), mis. "6 Nov 2026".
 * Dihitung manual (tanpa Intl) biar hasilnya sama di semua environment.
 */
export function formatDateWIB(date: Date): string {
  const wib = new Date(date.getTime() + WIB_OFFSET_MS);
  return `${wib.getUTCDate()} ${MONTHS[wib.getUTCMonth()]} ${wib.getUTCFullYear()}`;
}
