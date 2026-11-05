/** Query lebih pendek dari ini nggak dikirim ke server. */
export const USER_SEARCH_MIN_LENGTH = 2;

/** Urutan di sini = urutan grup di hasil pencarian. */
export const USER_SEARCH_TYPES = [
  "ujian",
  "program",
  "riwayat",
  "transaksi",
  "pengumuman",
  "faq",
] as const;

export type UserSearchType = (typeof USER_SEARCH_TYPES)[number];

export type UserSearchTone = "neutral" | "success" | "warning" | "danger";

export type UserSearchItem = {
  type: UserSearchType;
  id: string;
  title: string;
  subtitle?: string;
  /** Halaman tujuan saat hasil dipilih. */
  href: string;
  badge?: string;
  tone?: UserSearchTone;
};

export type UserSearchResponse = {
  query: string;
  items: UserSearchItem[];
};
