import CategoryBadge from "@/components/dashboardUser/ui/CategoryBadge";
import type { ExerciseItem } from "@/types/user-dashboard";

/** Judul ujian + badge kategori, dipakai di semua tabel latihan. */
export function ExerciseTitleCell({ exercise }: { exercise: ExerciseItem }) {
  return (
    <>
      <p className="font-medium text-gray-800">{exercise.ujianTitle}</p>
      <div className="mt-1">
        <CategoryBadge name={exercise.category} />
      </div>
    </>
  );
}

/** Skor ujian; strip kalau belum ada (belum selesai). */
export function ScoreText({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-300">–</span>;
  return <span className="font-semibold text-blue-600">{score}</span>;
}

/** Isi sel tabel yang kosong (tidak ada skor, tindakan, dst). */
export const EMPTY_CELL = <span className="text-gray-300">–</span>;
