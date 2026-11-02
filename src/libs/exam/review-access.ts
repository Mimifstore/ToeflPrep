// Aturan hasil ujian: lulus atau tidak, dan boleh tidaknya peserta melihat pembahasan.
// Murni logika: dipakai halaman hasil, halaman pembahasan, dan test.

/**
 * Nilai kelulusan 0 (atau tidak diisi) = ujian tanpa nilai kelulusan → tidak ada status lulus.
 * Lulus bila skor SAMA DENGAN atau di atas nilai kelulusan.
 */
export function getPassStatus(score: number, passingScore: number | null | undefined) {
  if (!passingScore || passingScore <= 0) return { hasThreshold: false, passed: null as boolean | null };
  return { hasThreshold: true, passed: score >= passingScore };
}

export type ReviewAccess =
  | { state: "disabled" } // admin tidak mengaktifkan "Tampilkan Jawaban"
  | { state: "locked"; minScore: number } // aktif, tapi skor peserta belum cukup
  | { state: "open" };

/**
 * Pembahasan tampil bila ujian mengaktifkan "Tampilkan Jawaban" DAN skor peserta mencapai
 * skor minimal bank soal (kosong = semua peserta boleh).
 */
export function getReviewAccess(input: {
  showAnswer: boolean;
  score: number;
  minScoreToShow: number | null | undefined;
}): ReviewAccess {
  if (!input.showAnswer) return { state: "disabled" };
  if (input.minScoreToShow != null && input.score < input.minScoreToShow) {
    return { state: "locked", minScore: input.minScoreToShow };
  }
  return { state: "open" };
}
