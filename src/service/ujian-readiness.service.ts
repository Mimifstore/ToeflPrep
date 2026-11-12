import { prisma } from "@/libs/prisma";
import {
  evaluateReadiness,
  type BankInfo,
  type BankSectionInfo,
  type Readiness,
  type ReadinessInput,
} from "@/libs/ujian-readiness";

type SectionRow = { id: string; examId: string | null; title: string; order: number };
type GroupRow = {
  examId: string;
  sectionId: string | null;
  type: string;
  _count: { _all: number };
};

/**
 * Section + jumlah soal untuk beberapa bank soal sekaligus (2 query, 3 kalau ada section yang
 * dipakai soal tapi tidak ditandai milik bank itu).
 *
 * Section sebuah bank = section yang DIPAKAI soal bank itu, persis seperti yang dilakukan sesi ujian
 * siswa (createExamSession membaca soal per examId lalu section dari soalnya). Judul section unik di
 * seluruh database dan import/form soal memilih section dari daftar global, jadi `Section.examId`
 * sering kosong atau menunjuk bank lain. Kalau penghitungan hanya memakai `Section.examId`, soal yang
 * sebenarnya bisa dikerjakan malah tampil "0 section, 0 soal" dan ujiannya terkunci "Belum tersedia".
 */
export async function loadBankInfo(bankIds: string[]): Promise<Map<string, BankInfo>> {
  const ids = [...new Set(bankIds)].filter(Boolean);
  const result = new Map<string, BankInfo>();
  for (const id of ids) result.set(id, { sections: [], unassignedQuestions: 0 });
  if (ids.length === 0) return result;

  const [ownedSections, groups]: [SectionRow[], GroupRow[]] = await Promise.all([
    prisma.section.findMany({
      where: { examId: { in: ids } },
      select: { id: true, examId: true, title: true, order: true },
    }),
    prisma.question.groupBy({
      by: ["examId", "sectionId", "type"],
      where: { examId: { in: ids } },
      _count: { _all: true },
    }),
  ]);

  // Section yang dipakai soal tapi belum ada di daftar milik bank (examId kosong atau bank lain).
  const knownIds = new Set(ownedSections.map((s) => s.id));
  const missingIds = [
    ...new Set(
      groups.flatMap((g) => (g.sectionId && !knownIds.has(g.sectionId) ? [g.sectionId] : [])),
    ),
  ];
  const usedSections: SectionRow[] =
    missingIds.length > 0
      ? await prisma.section.findMany({
          where: { id: { in: missingIds } },
          select: { id: true, examId: true, title: true, order: true },
        })
      : [];

  const sectionById = new Map<string, SectionRow>(
    [...ownedSections, ...usedSections].map((s) => [s.id, s]),
  );

  // Kunci = bank + section: satu section bisa dipakai banyak bank, dan jumlah soalnya beda per bank.
  const infoByBankSection = new Map<string, BankSectionInfo>();
  const infoFor = (bankId: string, sectionId: string): BankSectionInfo | null => {
    const key = `${bankId}:${sectionId}`;
    const existing = infoByBankSection.get(key);
    if (existing) return existing;

    const section = sectionById.get(sectionId);
    const bank = result.get(bankId);
    if (!section || !bank) return null;

    const info: BankSectionInfo = {
      id: section.id,
      title: section.title,
      order: section.order,
      questionCount: 0,
      realQuestionCount: 0,
    };
    infoByBankSection.set(key, info);
    bank.sections.push(info);
    return info;
  };

  // Section yang memang ditandai milik bank tetap muncul walau belum ada soalnya.
  for (const s of ownedSections) {
    if (s.examId) infoFor(s.examId, s.id);
  }

  for (const g of groups) {
    const count = g._count._all;
    if (!g.sectionId) {
      const bank = result.get(g.examId);
      if (bank && g.type === "QUESTION") bank.unassignedQuestions += count;
      continue;
    }
    const info = infoFor(g.examId, g.sectionId);
    if (!info) continue;
    info.questionCount += count;
    if (g.type === "QUESTION") info.realQuestionCount += count;
  }

  return result;
}

/** Kesiapan satu ujian (atau rencana ujian dari form) terhadap bank soalnya. */
export async function checkUjianReadiness(
  ujian: ReadinessInput & { questionBankId: string },
): Promise<Readiness> {
  const banks = await loadBankInfo([ujian.questionBankId]);
  return evaluateReadiness(
    ujian,
    banks.get(ujian.questionBankId) ?? { sections: [], unassignedQuestions: 0 },
  );
}

/** Kesiapan banyak ujian sekaligus (daftar ujian): tetap 2 query. */
export async function getReadinessMap(
  ujians: Array<ReadinessInput & { id: string; questionBankId: string }>,
): Promise<Map<string, Readiness>> {
  const banks = await loadBankInfo(ujians.map((u) => u.questionBankId));
  const map = new Map<string, Readiness>();
  for (const u of ujians) {
    map.set(
      u.id,
      evaluateReadiness(u, banks.get(u.questionBankId) ?? { sections: [], unassignedQuestions: 0 }),
    );
  }
  return map;
}
