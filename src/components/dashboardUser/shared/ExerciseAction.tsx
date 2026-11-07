import { Eye, Play } from "lucide-react";
import { ActionLink } from "@/components/dashboardUser/ui/ActionButton";
import type { ExerciseItem } from "@/types/user-dashboard";

/** Ada tindakan yang bisa dilakukan pada latihan ini? (hasil kalau selesai, lanjutkan kalau berjalan) */
export function hasExerciseAction(exercise: ExerciseItem): boolean {
  return (
    (exercise.status === "SUBMITTED" && exercise.resultId !== null) ||
    exercise.status === "ONGOING"
  );
}

type ExerciseActionProps = {
  exercise: ExerciseItem;
  size?: "sm" | "md";
  fullWidth?: boolean;
};

/** Tombol "Lihat Hasil" atau "Lanjutkan". Kosong (null) kalau tidak ada tindakan. */
export default function ExerciseAction({ exercise, size, fullWidth }: ExerciseActionProps) {
  if (exercise.status === "SUBMITTED" && exercise.resultId) {
    return (
      <ActionLink
        href={`/user/tryout/result/${exercise.resultId}`}
        icon={Eye}
        size={size}
        fullWidth={fullWidth}
      >
        Lihat Hasil
      </ActionLink>
    );
  }

  if (exercise.status === "ONGOING") {
    return (
      <ActionLink
        href={`/user/tryout/session/${exercise.id}`}
        icon={Play}
        variant="warning"
        size={size}
        fullWidth={fullWidth}
      >
        Lanjutkan
      </ActionLink>
    );
  }

  return null;
}
