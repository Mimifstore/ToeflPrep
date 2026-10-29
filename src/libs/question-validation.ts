import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { prisma } from "@/libs/prisma";

// ===== BATAS =====
export const MAX_RAW_HTML = 100_000; // batas kasar di zod (sebelum disanitasi)
export const MAX_RICH_TEXT = 30_000; // soal, direction, penjelasan (setelah disanitasi)
export const MAX_OPTION_TEXT = 5_000; // satu pilihan jawaban
export const MAX_AUDIO_LIMIT = 20;

// Hanya tag dan atribut yang dihasilkan editor teks (Quill). Skrip, event handler,
// iframe, style, dan gambar data:/base64 dibuang.
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "sub",
      "sup",
      "ol",
      "ul",
      "li",
      "blockquote",
      "pre",
      "code",
      "hr",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "span",
      "a",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
      "*": ["class"],
    },
    allowedClasses: { "*": ["ql-*"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    // <img> yang src-nya dibuang (misal base64) ikut dibuang, bukan tinggal tag kosong
    exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
    },
  });
}

// Kosong = tanpa teks. Gambar saja dianggap tidak kosong (soal bergambar).
// Editor Quill yang kosong menghasilkan "<p><br></p>".
export function isBlankHtml(html?: string | null): boolean {
  if (!html) return true;
  if (/<img\b/i.test(html)) return false;
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;|&#160;|\u00a0/g, " ")
    .trim();
  return text.length === 0;
}

// Teks polos dari HTML (untuk membandingkan soal, mis. deteksi duplikat)
export function htmlToText(html?: string | null): string {
  if (!html) return "";
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;|&#160;|\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// ===== AUDIO =====
// Audio hanya boleh dari bucket "audio" di Supabase project sendiri.
export function isOwnAudioUrl(url: string): boolean {
  try {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base) return false;
    const u = new URL(url);
    return (
      u.origin === new URL(base).origin &&
      u.pathname.startsWith("/storage/v1/object/public/audio/") &&
      !u.search &&
      !u.hash
    );
  } catch {
    return false;
  }
}

// ===== SKEMA ZOD =====
// Kolom kosong ("" atau null) = tidak diisi. (z.coerce.number() mengubah "" jadi 0.)
const blankToNull = (v: unknown) =>
  v === "" || v === undefined || v === null ? null : v;

// Batas putar audio: kosong = tak terbatas, selain itu bilangan bulat 1..MAX
export const audioLimitSchema = z.preprocess(
  blankToNull,
  z.coerce
    .number("Batas putar harus berupa angka")
    .int("Batas putar harus bilangan bulat")
    .min(1, "Batas putar minimal 1 (kosongkan jika tidak dibatasi)")
    .max(MAX_AUDIO_LIMIT, `Batas putar maksimal ${MAX_AUDIO_LIMIT}`)
    .nullable(),
);

// Batas waktu menjawab: kosong atau 0 = tanpa batas
export const timeLimitSchema = z.preprocess(
  blankToNull,
  z.coerce
    .number("Batas waktu harus berupa angka")
    .int("Batas waktu harus bilangan bulat")
    .min(0, "Batas waktu tidak boleh negatif")
    .max(86_400, "Batas waktu terlalu besar")
    .nullable(),
);

const html = () => z.string().max(MAX_RAW_HTML, "Teks terlalu panjang");

export const questionBodySchema = z.object({
  type: z.enum(["QUESTION", "DIRECTION"], "Tipe tidak valid"),
  sectionId: z.string("Section wajib dipilih").min(1, "Section wajib dipilih"),
  categoryId: z.string().optional().nullable(),
  question: html().optional(),
  direction: html().optional(),
  audioUrl: z
    .string()
    .max(2000, "URL audio terlalu panjang")
    .optional()
    .nullable(),
  audioLimit: audioLimitSchema.optional(),
  timeLimit: timeLimitSchema.optional(),
  correctAnswer: z.enum(["A", "B", "C", "D"]).optional(),
  explanation: html().optional(),
  optionA: html().optional(),
  optionB: html().optional(),
  optionC: html().optional(),
  optionD: html().optional(),
});

export type QuestionBody = z.infer<typeof questionBodySchema>;

// ===== VALIDASI + PEMBERSIHAN (dipakai tambah soal dan edit soal) =====
export type PreparedQuestion = {
  type: "QUESTION" | "DIRECTION";
  sectionId: string;
  categoryId: string | null;
  questionText: string | null;
  directionText: string | null;
  options: { label: string; text: string }[];
  correctAnswer: string | null;
  explanation: string | null;
  audioUrl: string | null;
  audioLimit: number | null;
  timeLimit: number | null;
};

type Result =
  | { ok: true; value: PreparedQuestion }
  | { ok: false; error: string };

const fail = (error: string): Result => ({ ok: false, error });

export async function prepareQuestion(
  data: QuestionBody,
  opts: { currentAudioUrl?: string | null } = {},
): Promise<Result> {
  // SECTION WAJIB UNTUK SEMUA TIPE (direction tanpa section tidak pernah tampil ke peserta)
  const section = await prisma.section.findUnique({
    where: { id: data.sectionId },
    select: { id: true },
  });
  if (!section) return fail("Section tidak ditemukan");

  // ----- DIRECTION -----
  if (data.type === "DIRECTION") {
    const direction = sanitizeRichText(data.direction ?? "");
    if (isBlankHtml(direction)) return fail("Direction wajib diisi");
    if (direction.length > MAX_RICH_TEXT)
      return fail("Direction terlalu panjang");

    return {
      ok: true,
      value: {
        type: "DIRECTION",
        sectionId: data.sectionId,
        categoryId: null,
        questionText: null,
        directionText: direction,
        options: [],
        correctAnswer: null,
        explanation: null,
        audioUrl: null,
        audioLimit: null,
        timeLimit: null,
      },
    };
  }

  // ----- QUESTION -----
  if (!data.categoryId) return fail("Kategori wajib dipilih");

  const category = await prisma.categoryScore.findUnique({
    where: { id: data.categoryId },
    select: { sectionId: true },
  });
  if (!category) return fail("Kategori tidak ditemukan");
  if (category.sectionId !== data.sectionId) {
    return fail("Kategori tidak sesuai dengan section yang dipilih");
  }

  if (!data.correctAnswer) return fail("Jawaban wajib dipilih");

  const questionText = sanitizeRichText(data.question ?? "");
  if (isBlankHtml(questionText)) return fail("Soal wajib diisi");
  if (questionText.length > MAX_RICH_TEXT) return fail("Soal terlalu panjang");

  const options: { label: string; text: string }[] = [];
  for (const label of ["A", "B", "C", "D"] as const) {
    const text = sanitizeRichText(data[`option${label}`] ?? "");
    if (isBlankHtml(text)) return fail(`Pilihan ${label} wajib diisi`);
    if (text.length > MAX_OPTION_TEXT)
      return fail(`Pilihan ${label} terlalu panjang`);
    options.push({ label, text });
  }

  const explanationRaw = sanitizeRichText(data.explanation ?? "");
  const explanation = isBlankHtml(explanationRaw) ? null : explanationRaw;
  if (explanation && explanation.length > MAX_RICH_TEXT) {
    return fail("Penjelasan terlalu panjang");
  }

  // AUDIO: URL yang tidak berubah dari data lama dibiarkan (data lama mungkin pakai alamat lain)
  const audioUrl = data.audioUrl?.trim() || null;
  if (
    audioUrl &&
    audioUrl !== opts.currentAudioUrl &&
    !isOwnAudioUrl(audioUrl)
  ) {
    return fail(
      "URL audio tidak valid. Upload audio lewat form agar tersimpan di penyimpanan sendiri",
    );
  }

  return {
    ok: true,
    value: {
      type: "QUESTION",
      sectionId: data.sectionId,
      categoryId: data.categoryId,
      questionText,
      directionText: null,
      options,
      correctAnswer: data.correctAnswer,
      explanation,
      audioUrl,
      audioLimit: audioUrl ? (data.audioLimit ?? null) : null,
      timeLimit: data.timeLimit ?? null,
    },
  };
}
