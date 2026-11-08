/** Tindakan yang ditawarkan pada sebuah kartu ujian. */
export type ExamAction = "unavailable" | "start" | "claim-free" | "buy";

/**
 * Tombol apa yang tampil di kartu ujian.
 * Ujian yang belum siap tidak bisa dibeli maupun dikerjakan, sekalipun siswa sudah punya aksesnya.
 */
export function resolveExamAction({
  ready,
  price,
  hasAccess,
}: {
  ready: boolean;
  price: number;
  hasAccess: boolean;
}): ExamAction {
  if (!ready) return "unavailable";
  if (hasAccess) return "start";
  return price === 0 ? "claim-free" : "buy";
}
