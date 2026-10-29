import { ADMIN_SEARCH_MAX_LENGTH } from "@/types/admin-search";

/** Rapihin input pencarian: spasi ganda dibuang, dipotong ke batas maksimal. */
export function normalizeQuery(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, ADMIN_SEARCH_MAX_LENGTH);
}

const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

/** HTML dari editor (Quill) → teks biasa, buat ditampilkan sebagai cuplikan. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, (entity) => HTML_ENTITIES[entity])
    .replace(/\s+/g, " ")
    .trim();
}

/** Cuplikan teks di sekitar kata yang dicari. Kalau nggak ketemu, ambil bagian awal. */
export function makeSnippet(text: string, query: string, radius = 50): string {
  const plain = text.replace(/\s+/g, " ").trim();
  const index = query ? plain.toLowerCase().indexOf(query.toLowerCase()) : -1;

  if (index === -1) {
    return plain.length > radius * 2 ? `${plain.slice(0, radius * 2).trimEnd()}…` : plain;
  }

  const start = Math.max(0, index - radius);
  const end = Math.min(plain.length, index + query.length + radius);
  return `${start > 0 ? "…" : ""}${plain.slice(start, end).trim()}${end < plain.length ? "…" : ""}`;
}

/** 50000 → "Rp 50.000" (nggak pakai Intl biar hasilnya sama di semua environment). */
export function formatRupiah(amount: number): string {
  return `Rp ${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
