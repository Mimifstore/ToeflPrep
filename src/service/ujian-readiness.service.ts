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

/** Section + jumlah soal untuk beberapa bank soal sekaligus (2 query, berapa pun banyaknya bank). */
export async function loadBankInfo(bankIds: string[]): Promise<Map<string, BankInfo>> {
  const ids = [...new Set(bankIds)].filter(Boolean);
  const result = new Map<string, BankInfo>();
  for (const id of ids) result.set(id, { sections: [], unassignedQuestions: 0 });
  if (ids.length === 0) return result;

  const [sections, groups]: [SectionRow[], GroupRow[]] = await Promise.all([
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

  const infoBySection = new Map<string, BankSectionInfo>();
  for (const s of sections) {
    if (!s.examId) continue;
    const info: BankSectionInfo = {
      id: s.id,
      title: s.title,
      order: s.order,
      questionCount: 0,
      realQuestionCount: 0,
    };
    infoBySection.set(s.id, info);
    result.get(s.examId)?.sections.push(info);
  }

  for (const g of groups) {
    const count = g._count._all;
    if (!g.sectionId) {
      const bank = result.get(g.examId);
      if (bank && g.type === "QUESTION") bank.unassignedQuestions += count;
      continue;
    }
    const info = infoBySection.get(g.sectionId);
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
