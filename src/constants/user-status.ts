/** Warna badge status. Satu kamus ini dipakai semua tabel di dashboard siswa. */
export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export type StatusMeta = { label: string; tone: StatusTone };

/** Status sesi ujian (ExamSession). */
export const SESSION_STATUS: Record<string, StatusMeta> = {
  SUBMITTED: { label: "Selesai", tone: "success" },
  ONGOING: { label: "Berlangsung", tone: "warning" },
  EXPIRED: { label: "Expired", tone: "danger" },
};

/** Status transaksi pembayaran. */
export const TRANSACTION_STATUS: Record<string, StatusMeta> = {
  SUCCESS: { label: "Sukses", tone: "success" },
  PENDING: { label: "Pending", tone: "warning" },
  WAITING: { label: "Menunggu", tone: "info" },
  FAILED: { label: "Gagal", tone: "danger" },
};

/** Status yang belum dikenal tampil apa adanya dengan warna netral, bukan salah dibaca sebagai status lain. */
export function resolveStatus(map: Record<string, StatusMeta>, status: string): StatusMeta {
  return map[status] ?? { label: status, tone: "neutral" };
}
