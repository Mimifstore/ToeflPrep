"use client";

import { useState } from "react";
import { Play, Timer } from "lucide-react";
import ExerciseAction, { hasExerciseAction } from "@/components/dashboardUser/shared/ExerciseAction";
import {
  ExerciseTitleCell,
  EMPTY_CELL,
  ScoreText,
} from "@/components/dashboardUser/shared/exercise-cells";
import { ActionLink } from "@/components/dashboardUser/ui/ActionButton";
import CategoryBadge from "@/components/dashboardUser/ui/CategoryBadge";
import DashboardCard from "@/components/dashboardUser/ui/DashboardCard";
import DataTable, { type DataColumn } from "@/components/dashboardUser/ui/DataTable";
import EmptyState from "@/components/dashboardUser/ui/EmptyState";
import Pagination from "@/components/dashboardUser/ui/Pagination";
import RowCard from "@/components/dashboardUser/ui/RowCard";
import StatusBadge from "@/components/dashboardUser/ui/StatusBadge";
import { resolveStatus, SESSION_STATUS } from "@/constants/user-status";
import { useApiData } from "@/hooks/useApiData";
import { formatDateTime } from "@/libs/user-format";
import type { ExerciseItem, PagedResponse } from "@/types/user-dashboard";

const PER_PAGE = 10;

export default function ExerciseList() {
  const [page, setPage] = useState(1);
  const { data, status, reload } = useApiData<PagedResponse<ExerciseItem>>(
    `/api/user/exercises?page=${page}&limit=${PER_PAGE}`,
  );

  const total = data?.total ?? 0;
  const startNumber = (page - 1) * PER_PAGE;

  const columns: DataColumn<ExerciseItem>[] = [
    { header: "No", className: "text-gray-400", cell: (_, i) => startNumber + i + 1 },
    { header: "Ujian", cell: (d) => <ExerciseTitleCell exercise={d} /> },
    { header: "Score", cell: (d) => <ScoreText score={d.score} /> },
    {
      header: "Status",
      cell: (d) => <StatusBadge status={resolveStatus(SESSION_STATUS, d.status)} />,
    },
    {
      header: "Waktu Mulai",
      className: "whitespace-nowrap text-gray-500",
      cell: (d) => formatDateTime(d.startedAt),
    },
    {
      header: "Waktu Selesai",
      className: "whitespace-nowrap text-gray-500",
      cell: (d) => formatDateTime(d.submittedAt),
    },
    {
      header: "Aksi",
      cell: (d) => (hasExerciseAction(d) ? <ExerciseAction exercise={d} /> : EMPTY_CELL),
    },
  ];

  return (
    <DashboardCard
      title="Riwayat Latihan Soal"
      subtitle={data ? `${total} total latihan` : undefined}
    >
      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        getRowKey={(d) => d.id}
        status={status}
        onRetry={reload}
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
        renderCard={(d, i) => (
          <RowCard
            title={d.ujianTitle}
            meta={
              <>
                <CategoryBadge name={d.category} />
                <span>#{startNumber + i + 1}</span>
              </>
            }
            badge={<StatusBadge status={resolveStatus(SESSION_STATUS, d.status)} />}
            details={[
              { label: "Score", value: <ScoreText score={d.score} /> },
              { label: "Waktu Mulai", value: formatDateTime(d.startedAt) },
              { label: "Waktu Selesai", value: formatDateTime(d.submittedAt) },
            ]}
            action={
              hasExerciseAction(d) ? <ExerciseAction exercise={d} size="md" fullWidth /> : undefined
            }
          />
        )}
      />

      <Pagination
        page={page}
        totalPages={data?.totalPages ?? 1}
        total={total}
        perPage={PER_PAGE}
        onPageChange={setPage}
        disabled={status === "loading"}
      />
    </DashboardCard>
  );
}
