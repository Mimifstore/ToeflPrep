"use client";

import { useState } from "react";
import { Receipt, Timer } from "lucide-react";
import { EMPTY_CELL } from "@/components/dashboardUser/shared/exercise-cells";
import TransactionAction, {
  hasTransactionAction,
} from "@/components/dashboardUser/shared/TransactionAction";
import {
  InvoiceText,
  TotalText,
  TransactionTitleCell,
} from "@/components/dashboardUser/shared/transaction-cells";
import { ActionLink } from "@/components/dashboardUser/ui/ActionButton";
import CategoryBadge from "@/components/dashboardUser/ui/CategoryBadge";
import DashboardCard from "@/components/dashboardUser/ui/DashboardCard";
import DataTable, { type DataColumn } from "@/components/dashboardUser/ui/DataTable";
import EmptyState from "@/components/dashboardUser/ui/EmptyState";
import Pagination from "@/components/dashboardUser/ui/Pagination";
import RowCard from "@/components/dashboardUser/ui/RowCard";
import StatusBadge from "@/components/dashboardUser/ui/StatusBadge";
import { resolveStatus, TRANSACTION_STATUS } from "@/constants/user-status";
import { useApiData } from "@/hooks/useApiData";
import { formatDateTime } from "@/libs/user-format";
import type { PagedResponse, TransactionItem } from "@/types/user-dashboard";

const PER_PAGE = 10;

export default function TransactionList() {
  const [page, setPage] = useState(1);
  const { data, status, reload } = useApiData<PagedResponse<TransactionItem>>(
    `/api/user/transactions?page=${page}&limit=${PER_PAGE}`,
  );

  const total = data?.total ?? 0;
  const startNumber = (page - 1) * PER_PAGE;

  const columns: DataColumn<TransactionItem>[] = [
    { header: "No", className: "text-gray-400", cell: (_, i) => startNumber + i + 1 },
    { header: "Invoice", cell: (t) => <InvoiceText invoice={t.invoice} /> },
    { header: "Ujian", cell: (t) => <TransactionTitleCell transaction={t} /> },
    { header: "Total", cell: (t) => <TotalText total={t.total} /> },
    {
      header: "Maks. Bayar",
      className: "whitespace-nowrap text-gray-500",
      cell: (t) => formatDateTime(t.expiredAt),
    },
    {
      header: "Status",
      cell: (t) => <StatusBadge status={resolveStatus(TRANSACTION_STATUS, t.status)} />,
    },
    {
      header: "Aksi",
      cell: (t) => (hasTransactionAction(t) ? <TransactionAction transaction={t} /> : EMPTY_CELL),
    },
  ];

  return (
    <DashboardCard
      title="Riwayat Transaksi"
      subtitle={data ? `${total} total transaksi` : undefined}
    >
      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        getRowKey={(t) => t.id}
        status={status}
        onRetry={reload}
        empty={
          <EmptyState
            icon={Receipt}
            title="Belum ada transaksi"
            description="Pembelian paket try out akan tercatat di sini."
            action={
              <ActionLink href="/user/tryout" icon={Timer} variant="secondary" size="md">
                Lihat Try Out
              </ActionLink>
            }
          />
        }
        renderCard={(t) => (
          <RowCard
            title={<span className="font-mono">{t.invoice}</span>}
            meta={
              <>
                <span>{t.ujianTitle}</span>
                <CategoryBadge name={t.category} />
              </>
            }
            badge={<StatusBadge status={resolveStatus(TRANSACTION_STATUS, t.status)} />}
            details={[
              { label: "Total", value: <TotalText total={t.total} /> },
              { label: "Maks. Bayar", value: formatDateTime(t.expiredAt) },
            ]}
            action={
              hasTransactionAction(t) ? (
                <TransactionAction transaction={t} size="md" fullWidth />
              ) : undefined
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
