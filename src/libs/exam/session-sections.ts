import { prisma } from "@/libs/prisma";

export type SessionSection = { id: string; title: string };

type TimedUjian = {
  listeningTime: number | null;
  structureTime: number | null;
  readingTime: number | null;
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE = 500;
const cache = new Map<string, { at: number; sections: SessionSection[] }>();

// Section milik sebuah sesi, berurutan sesuai Section.order.
// Isi sesi tidak berubah setelah dibuat, jadi aman disimpan sementara di memori
// (menghemat query tiap kali peserta menyimpan jawaban).
export async function getSessionSections(
  sessionId: string,
): Promise<SessionSection[]> {
  const hit = cache.get(sessionId);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.sections;

  const sections = await prisma.section.findMany({
    where: { questions: { some: { examQuestions: { some: { sessionId } } } } },
    orderBy: { order: "asc" },
    select: { id: true, title: true },
  });

  cache.set(sessionId, { at: Date.now(), sections });

  if (cache.size > MAX_CACHE) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (oldest) cache.delete(oldest[0]);
  }

  return sections;
}

// Durasi (menit) sebuah section. Dicocokkan lewat judul section, bukan urutan,
// supaya ujian dengan 2 section (misal Listening dan Reading) memakai waktu yang benar.
// Judul yang tidak dikenali memakai urutan Listening, Structure, Reading.
export function getSectionMinutes(
  ujian: TimedUjian,
  title: string,
  index: number,
): number | null {
  const t = title.toLowerCase();
  let minutes: number | null | undefined;

  if (t.includes("listening")) minutes = ujian.listeningTime;
  else if (t.includes("structure")) minutes = ujian.structureTime;
  else if (t.includes("reading")) minutes = ujian.readingTime;
  else
    minutes = [ujian.listeningTime, ujian.structureTime, ujian.readingTime][
      index
    ];

  return typeof minutes === "number" && minutes > 0 ? minutes : null;
}
