"use client";

import { Play, Timer } from "lucide-react";
import ExerciseAction, { hasExerciseAction } from "@/components/dashboardUser/shared/ExerciseAction";
import {
  ExerciseTitleCell,
  EMPTY_CELL,
  ScoreText,
} from "@/components/dashboardUser/shared/exercise-cells";
import { ActionLink } from "@/components/dashboardUser/ui/ActionButton";
import CategoryBadge from "@/components/dashboardUser/ui/CategoryBadge";
import DashboardCard, { CardLink } from "@/components/dashboardUser/ui/DashboardCard";
import DataTable, { type DataColumn } from "@/components/dashboardUser/ui/DataTable";
import EmptyState from "@/components/dashboardUser/ui/EmptyState";
import RowCard from "@/components/dashboardUser/ui/RowCard";
import StatusBadge from "@/components/dashboardUser/ui/StatusBadge";
import { resolveStatus, SESSION_STATUS } from "@/constants/user-status";
import { useApiData } from "@/hooks/useApiData";
import { formatDate } from "@/libs/user-format";
import type { ExerciseItem, PagedResponse } from "@/types/user-dashboard";

const LIMIT = 5;

const COLUMNS: DataColumn<ExerciseItem>[] = [
  { header: "Ujian", cell: (d) => <ExerciseTitleCell exercise={d} /> },
  { header: "Skor", cell: (d) => <ScoreText score={d.score} /> },
  {
    header: "Status",
    cell: (d) => <StatusBadge status={resolveStatus(SESSION_STATUS, d.status)} />,
  },
  {
    header: "Tanggal",
    className: "whitespace-nowrap text-gray-500",
    cell: (d) => formatDate(d.startedAt),
  },
  {
    header: "Aksi",
    cell: (d) => (hasExerciseAction(d) ? <ExerciseAction exercise={d} /> : EMPTY_CELL),
  },
];

export default function ExerciseTable() {
  const { data, status, reload } = useApiData<PagedResponse<ExerciseItem>>(
    `/api/user/exercises?limit=${LIMIT}`,
  );

  return (
    <DashboardCard
      title="Latihan Terakhir"
      subtitle="Aktivitas try out terbaru kamu"
      action={<CardLink href="/user/riwayat">Lihat semua</CardLink>}
    >
      <DataTable
        columns={COLUMNS}
        rows={data?.data ?? []}
        getRowKey={(d) => d.id}
        status={status}
        onRetry={reload}
        skeletonRows={LIMIT}
        empty={
          <EmptyState
            icon={Timer}
            title="Belum ada riwayat latihan"
            description="Mulai try out pertamamu, hasilnya akan muncul di sini."
            action={
              <ActionLink href="/user/tryout" icon={Play} size="md">
                Mulai Try Out
              </ActionLink>
            }
          />
        }
        renderCard={(d) => (
          <RowCard
            title={d.ujianTitle}
            meta={
              <>
                <CategoryBadge name={d.category} />
                <span>{formatDate(d.startedAt)}</span>
              </>
            }
            badge={<StatusBadge status={resolveStatus(SESSION_STATUS, d.status)} />}
            details={[{ label: "Skor", value: <ScoreText score={d.score} /> }]}
            action={
              hasExerciseAction(d) ? <ExerciseAction exercise={d} size="md" fullWidth /> : undefined
            }
          />
        )}
      />
    </DashboardCard>
  );
}
