import { randomUUID } from "crypto";
import * as XLSX from "xlsx";
import { prisma } from "@/libs/prisma";
import {
  MAX_AUDIO_LIMIT,
  MAX_OPTION_TEXT,
  MAX_RICH_TEXT,
  htmlToText,
  isBlankHtml,
  isOwnAudioUrl,
  sanitizeRichText,
} from "@/libs/question-validation";

export const MAX_IMPORT_ROWS = 500;
const MAX_ERRORS_SHOWN = 100;

type ImportResult = {
  success: number;
  failed: number;
  errors: { row: number; reason: string }[];
  warnings: string[];
  message: string;
};

// Kolom wajib (nama kolom tidak peka huruf besar/kecil dan spasi)
const REQUIRED = [
  "section", "type", "question", "direction",
  "a", "b", "c", "d", "answer", "category",
] as const;
const LABELS: Record<string, string> = {
  section: "Section", type: "Type", question: "Question", direction: "Direction",
  a: "A", b: "B", c: "C", d: "D", answer: "Answer", category: "Category",
  audiourl: "AudioUrl", audiolimit: "AudioLimit",
};

const key = (h: unknown) => String(h ?? "").toLowerCase().replace(/[\s_-]/g, "");
// angka 0 harus tetap "0" (jangan dianggap kosong)
const cell = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());

// Masalah level-file (kolom hilang, terlalu banyak baris, file rusak): pesannya aman ditampilkan ke admin
export class ImportFileError extends Error {}

export async function importSoalService(
  file: Buffer,
  examId: string,
): Promise<ImportResult> {
  // 🔥 PARSE EXCEL (rumus, HTML, dan gaya sel tidak dibaca; baris dibatasi)
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(file, {
      type: "buffer",
      cellFormula: false,
      cellHTML: false,
      cellStyles: false,
      cellNF: false,
      sheetRows: MAX_IMPORT_ROWS + 1,
    });
  } catch {
    throw new ImportFileError("File Excel tidak bisa dibaca. Pastikan file tidak rusak.");
  }
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new ImportFileError("File Excel kosong");

  // sheetRows memotong sheet; rentang aslinya ada di !fullref
  const fullRef = (sheet as any)["!fullref"] as string | undefined;
  if (fullRef && XLSX.utils.decode_range(fullRef).e.r + 1 > MAX_IMPORT_ROWS + 1) {
    throw new ImportFileError(
      `File berisi lebih dari ${MAX_IMPORT_ROWS} baris. Pecah menjadi beberapa file.`,
    );
  }

  const table: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    blankrows: true, // supaya nomor baris sama dengan nomor baris di Excel
  });
  if (table.length < 2) throw new ImportFileError("File tidak berisi data soal");

  // 🔥 HEADER (dinormalisasi) + CEK KOLOM WAJIB
  const colIndex = new Map<string, number>();
  table[0].forEach((h, i) => {
    const k = key(h);
    if (k && !colIndex.has(k)) colIndex.set(k, i);
  });
  const missing = REQUIRED.filter((k) => !colIndex.has(k));
  if (missing.length > 0) {
    throw new ImportFileError(
      `Kolom wajib tidak ditemukan: ${missing.map((k) => LABELS[k]).join(", ")}. Gunakan template dan jangan ubah nama kolom.`,
    );
  }
  const get = (row: unknown[], k: string) =>
    colIndex.has(k) ? cell(row[colIndex.get(k)!]) : "";

  // 🔥 DATA PEMBANDING (beberapa query sekali jalan, bukan satu per baris)
  const [sections, categories, existingQuestions, lastOrders] = await Promise.all([
    prisma.section.findMany({ select: { id: true, title: true } }),
    prisma.categoryScore.findMany({ select: { id: true, name: true, sectionId: true } }),
    prisma.question.findMany({
      where: { examId, type: "QUESTION" },
      select: {
        sectionId: true,
        questionText: true,
        options: { select: { label: true, text: true } },
      },
    }),
    prisma.question.groupBy({
      by: ["sectionId"],
      where: { examId },
      _max: { order: true },
    }),
  ]);

  const sectionsByTitle = new Map<string, { id: string; title: string }[]>();
  for (const s of sections) {
    const k = s.title.toLowerCase().trim();
    sectionsByTitle.set(k, [...(sectionsByTitle.get(k) || []), s]);
  }

  const orderBySection = new Map<string, number>();
  for (const o of lastOrders) {
    orderBySection.set(o.sectionId || "null", o._max.order || 0);
  }

  const fingerprint = (
    sectionId: string,
    question: string,
    opts: Record<string, string>,
  ) =>
    [sectionId, htmlToText(question), ...["A", "B", "C", "D"].map((l) => htmlToText(opts[l]))].join(
      "|",
    );

  const existingPrints = new Set(
    existingQuestions.map((q) =>
      fingerprint(
        q.sectionId || "null",
        q.questionText || "",
        Object.fromEntries(q.options.map((o) => [o.label, o.text])),
      ),
    ),
  );
  const seenInFile = new Set<string>();

  const errors: { row: number; reason: string }[] = [];
  const warnings: string[] = [];
  const questionRows: any[] = [];
  const optionRows: any[] = [];

  // 🔥 VALIDASI SEMUA BARIS DULU (belum ada yang disimpan)
  for (let i = 1; i < table.length; i++) {
    const row = table[i];
    const rowNumber = i + 1; // baris Excel (baris 1 = header)

    if (row.every((c) => cell(c) === "")) continue; // baris kosong dilewati

    try {
      const type = get(row, "type").toUpperCase();
      if (type !== "QUESTION" && type !== "DIRECTION") {
        throw new Error(
          `Type harus QUESTION atau DIRECTION, dapat: "${get(row, "type")}"`,
        );
      }

      const sectionName = get(row, "section");
      if (!sectionName) throw new Error("Kolom Section tidak boleh kosong");

      const matches = sectionsByTitle.get(sectionName.toLowerCase()) || [];
      if (matches.length === 0) {
        throw new Error(`Section "${sectionName}" tidak ditemukan di database`);
      }
      if (matches.length > 1) {
        throw new Error(
          `Ada ${matches.length} section bernama "${sectionName}". Ubah salah satunya agar tidak kembar.`,
        );
      }
      const sectionId = matches[0].id;
      const order = (orderBySection.get(sectionId) || 0) + 1;

      // ----- DIRECTION -----
      if (type === "DIRECTION") {
        const direction = sanitizeRichText(
          get(row, "direction") || get(row, "question"),
        );
        if (isBlankHtml(direction)) {
          throw new Error("Kolom Direction tidak boleh kosong untuk type DIRECTION");
        }
        if (direction.length > MAX_RICH_TEXT) throw new Error("Direction terlalu panjang");

        orderBySection.set(sectionId, order);
        questionRows.push({
          id: randomUUID(),
          type: "DIRECTION",
          sectionId,
          order,
          directionText: direction,
        });
        continue;
      }

      // ----- QUESTION -----
      const categoryName = get(row, "category");
      if (!categoryName) {
        throw new Error("Kolom Category tidak boleh kosong untuk type QUESTION");
      }
      const sameName = categories.filter(
        (c) => c.name.toLowerCase().trim() === categoryName.toLowerCase(),
      );
      if (sameName.length === 0) {
        throw new Error(`Category "${categoryName}" tidak ditemukan di database`);
      }
      // kategori harus milik section yang sama (kalau tidak, skor salah hitung)
      const inSection = sameName.filter((c) => c.sectionId === sectionId);
      if (inSection.length === 0) {
        throw new Error(
          `Category "${categoryName}" bukan milik section "${sectionName}". Pilih kategori dari section yang sama.`,
        );
      }
      if (inSection.length > 1) {
        throw new Error(
          `Ada ${inSection.length} category bernama "${categoryName}" di section "${sectionName}". Ubah salah satunya agar tidak kembar.`,
        );
      }
      const categoryId = inSection[0].id;

      const answer = get(row, "answer").toUpperCase();
      if (!["A", "B", "C", "D"].includes(answer)) {
        throw new Error(`Answer harus A/B/C/D, dapat: "${get(row, "answer")}"`);
      }

      const questionText = sanitizeRichText(get(row, "question"));
      if (isBlankHtml(questionText)) throw new Error("Kolom Question tidak boleh kosong");
      if (questionText.length > MAX_RICH_TEXT) throw new Error("Question terlalu panjang");

      const options: Record<string, string> = {};
      for (const label of ["A", "B", "C", "D"]) {
        const text = sanitizeRichText(get(row, label.toLowerCase()));
        if (isBlankHtml(text)) throw new Error(`Kolom ${label} tidak boleh kosong`);
        if (text.length > MAX_OPTION_TEXT) throw new Error(`Pilihan ${label} terlalu panjang`);
        options[label] = text;
      }

      // AUDIO: hanya dari penyimpanan sendiri (hasil Upload Audio Massal)
      const audioUrl = get(row, "audiourl");
      let audioLimit: number | null = null;
      if (audioUrl) {
        if (!isOwnAudioUrl(audioUrl)) {
          throw new Error(
            `AudioUrl harus berasal dari penyimpanan sendiri (hasil "Upload Audio Massal"), dapat: "${audioUrl}"`,
          );
        }
        const limitRaw = get(row, "audiolimit");
        if (limitRaw !== "") {
          const n = Number(limitRaw);
          if (!Number.isInteger(n) || n < 1 || n > MAX_AUDIO_LIMIT) {
            throw new Error(
              `AudioLimit harus bilangan bulat 1-${MAX_AUDIO_LIMIT} (kosongkan jika tidak dibatasi), dapat: "${limitRaw}"`,
            );
          }
          audioLimit = n;
        }
      } else if (get(row, "audiolimit") !== "") {
        warnings.push(
          `Baris ${rowNumber}: AudioLimit diabaikan karena AudioUrl kosong.`,
        );
      }

      // DUPLIKAT: soal + keempat pilihan identik dengan yang sudah ada / sudah di file ini
      const print = fingerprint(sectionId, questionText, options);
      if (existingPrints.has(print)) {
        throw new Error("Soal ini sudah ada di bank soal (duplikat). Hapus barisnya jika file ini sudah pernah diimport.");
      }
      if (seenInFile.has(print)) {
        warnings.push(`Baris ${rowNumber}: soal identik dengan baris lain di file ini.`);
      }
      seenInFile.add(print);

      orderBySection.set(sectionId, order);
      const id = randomUUID();
      questionRows.push({
        id,
        type: "QUESTION",
        sectionId,
        order,
        categoryPenilaianId: categoryId,
        questionText,
        audioUrl: audioUrl || null,
        audioPlayLimit: audioLimit,
        correctAnswer: answer,
      });
      for (const label of ["A", "B", "C", "D"]) {
        optionRows.push({ questionId: id, label, text: options[label] });
      }
    } catch (error: any) {
      errors.push({ row: rowNumber, reason: error?.message || "Baris tidak valid" });
    }
  }

  if (errors.length > 0) {
    const shown = errors.slice(0, MAX_ERRORS_SHOWN);
    const more = errors.length - shown.length;
    return {
      success: 0,
      failed: errors.length,
      errors: shown,
      warnings,
      message:
        `Tidak ada soal yang diimport karena ${errors.length} baris bermasalah.` +
        (more > 0 ? ` Menampilkan ${shown.length} yang pertama.` : "") +
        " Perbaiki file lalu upload ulang.",
    };
  }

  if (questionRows.length === 0) throw new ImportFileError("File tidak berisi baris soal");

  // 🔥 SIMPAN SEKALIGUS: semua berhasil atau tidak ada yang masuk (2 query)
  await prisma.$transaction([
    prisma.question.createMany({
      data: questionRows.map((q) => ({ examId, ...q })),
    }),
    ...(optionRows.length > 0
      ? [prisma.questionOption.createMany({ data: optionRows })]
      : []),
  ]);

  return {
    success: questionRows.length,
    failed: 0,
    errors: [],
    warnings,
    message: `${questionRows.length} baris berhasil diimport.`,
  };
}