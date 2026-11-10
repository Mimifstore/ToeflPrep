/**
 * Teks dari editor rich-text (Quill) tersimpan sebagai HTML, mis. "<p>Latihan <b>lengkap</b></p>".
 * Fungsi di sini mengubahnya jadi teks biasa yang aman ditampilkan di mana saja (React sudah
 * meng-escape teks, jadi hasilnya tidak bisa menyisipkan tag).
 */

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  bull: "•",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
    if (body.startsWith("#")) {
      const isHex = body[1].toLowerCase() === "x";
      const code = parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}

/** Penanda butir daftar. Ditulis sebagai escape agar tidak bergantung pada encoding file/server. */
const BULLET = "\u2022";

/** Tag HTML utuh, termasuk atribut bertanda kutip yang memuat ">" (mis. href="a>b"). */
const TAG = /<(?:"[^"]*"|'[^']*'|[^'">])*>/g;

/**
 * HTML → teks biasa. Pergantian paragraf, <br>, dan butir daftar jadi baris baru (butir daftar
 * diawali "\u2022 "), tag lain dibuang, entitas HTML diterjemahkan, spasi berlebih dirapikan.
 * Isi <script> dan <style> dibuang seluruhnya.
 */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return "";

  const text = html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*li\b[^>]*>/gi, `\n${BULLET} `)
    .replace(/<\/\s*(?:p|div|h[1-6]|ul|ol|blockquote|pre|tr)\s*>/gi, "\n")
    .replace(TAG, "");

  return decodeEntities(text)
    .split("\n")
    .map((line) => line.replace(/[ \t\u00a0]+/g, " ").trim())
    .join("\n")
    // Butir daftar dirapatkan ke baris sebelumnya (tanpa baris kosong di depannya).
    .replace(new RegExp(`\n{2,}(?=${BULLET} )`, "g"), "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Seperti htmlToPlainText tapi jadi satu baris (untuk cuplikan dan pencocokan kata). */
export function htmlToSingleLine(html: string | null | undefined): string {
  return htmlToPlainText(html).replace(/\s+/g, " ");
}
