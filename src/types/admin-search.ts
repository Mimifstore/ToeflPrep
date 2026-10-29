/** Query lebih pendek dari ini nggak dikirim ke server. */
export const ADMIN_SEARCH_MIN_LENGTH = 2;
export const ADMIN_SEARCH_MAX_LENGTH = 64;

/** Urutan di sini = urutan grup di hasil pencarian. */
export const ADMIN_SEARCH_TYPES = [
  "user",
  "program",
  "penilaian",
  "bank-soal",
  "soal",
  "ujian",
  "pengumuman",
  "faq",
  "transaksi",
] as const;

export type AdminSearchType = (typeof ADMIN_SEARCH_TYPES)[number];

export type AdminSearchTone = "neutral" | "success" | "warning" | "danger";

export type AdminSearchItem = {
  type: AdminSearchType;
  id: string;
  title: string;
  subtitle?: string;
  /** Halaman admin tujuan saat hasil dipilih. */
  href: string;
  badge?: string;
  tone?: AdminSearchTone;
  /** Foto profil (khusus hasil bertipe user). */
  imageUrl?: string | null;
};

export type AdminSearchResponse = {
  query: string;
  items: AdminSearchItem[];
};
