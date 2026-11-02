// Helper teks dari HTML editor (Quill). Tanpa dependensi, aman dipakai di client maupun server.

/** Teks polos dari HTML (tag dibuang, &nbsp; jadi spasi, spasi berlebih dirapikan). */
export function htmlToPlain(html?: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;|&#xa0;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Kosong = tanpa teks. Editor Quill yang kosong menghasilkan "<p><br></p>".
 * Gambar saja dianggap tidak kosong (mis. soal bergambar).
 */
export function isBlankRichText(html?: string | null): boolean {
  if (!html) return true;
  if (/<img\b/i.test(html)) return false;
  return htmlToPlain(html) === "";
}
