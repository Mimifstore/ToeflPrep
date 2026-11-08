import type { UjianDuration } from "@/types/user-tryout";

const SECTION_LABELS: [keyof UjianDuration, string][] = [
  ["listeningTime", "Listening"],
  ["structureTime", "Structure"],
  ["readingTime", "Reading"],
];

/** Section yang punya batas waktu (menit > 0), dalam urutan tampil. */
export function getSectionTimes(exam: UjianDuration): { label: string; minutes: number }[] {
  return SECTION_LABELS.map(([key, label]) => ({
    label,
    minutes: Number(exam[key]) || 0,
  })).filter((section) => section.minutes > 0);
}

/** Ringkasan durasi: "120 menit" (satu batas waktu) atau "115 menit · 3 section" (per section). */
export function formatExamDuration(exam: UjianDuration): string {
  if (exam.timeType === "SINGLE") {
    return exam.totalTime ? `${exam.totalTime} menit` : "–";
  }

  const sections = getSectionTimes(exam);
  if (sections.length === 0) return "Per section";

  const total = sections.reduce((sum, section) => sum + section.minutes, 0);
  return `${total} menit · ${sections.length} section`;
}
