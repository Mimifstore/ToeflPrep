import { prisma } from "@/libs/prisma";

export type SessionSection = { id: string; title: string };

// Logika durasi per section ada di section-minutes.ts (tanpa database, dipakai juga oleh form admin).
export { getSectionMinutes } from "./section-minutes";

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
