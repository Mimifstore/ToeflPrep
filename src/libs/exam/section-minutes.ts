// Durasi per section. Murni logika (tanpa database) supaya bisa dipakai form admin juga.

export type TimedUjian = {
  listeningTime?: number | null;
  structureTime?: number | null;
  readingTime?: number | null;
};

export type SectionTimeField = "listeningTime" | "structureTime" | "readingTime";

const BY_INDEX: SectionTimeField[] = ["listeningTime", "structureTime", "readingTime"];

/**
 * Field waktu yang berlaku untuk sebuah section. Dicocokkan lewat judul section, bukan urutan,
 * supaya ujian dengan 2 section (misal Listening dan Reading) memakai waktu yang benar.
 * Judul yang tidak dikenali memakai urutan Listening, Structure, Reading.
 */
export function sectionTimeField(title: string, index: number): SectionTimeField | null {
  const t = title.toLowerCase();
  if (t.includes("listening")) return "listeningTime";
  if (t.includes("structure")) return "structureTime";
  if (t.includes("reading")) return "readingTime";
  return BY_INDEX[index] ?? null;
}

/** Durasi (menit) sebuah section, atau null kalau belum diatur. */
export function getSectionMinutes(
  ujian: TimedUjian,
  title: string,
  index: number,
): number | null {
  const field = sectionTimeField(title, index);
  const minutes = field ? ujian[field] : undefined;
  return typeof minutes === "number" && minutes > 0 ? minutes : null;
}
