"use client";

import { Receipt, Timer } from "lucide-react";
import TransactionAction, {
  hasTransactionAction,
} from "@/components/dashboardUser/shared/TransactionAction";
import { EMPTY_CELL } from "@/components/dashboardUser/shared/exercise-cells";
import {
  InvoiceText,
  TotalText,
  TransactionTitleCell,
} from "@/components/dashboardUser/shared/transaction-cells";
import { ActionLink } from "@/components/dashboardUser/ui/ActionButton";
import CategoryBadge from "@/components/dashboardUser/ui/CategoryBadge";
import DashboardCard, { CardLink } from "@/components/dashboardUser/ui/DashboardCard";
import DataTable, { type DataColumn } from "@/components/dashboardUser/ui/DataTable";
import EmptyState from "@/components/dashboardUser/ui/EmptyState";
import RowCard from "@/components/dashboardUser/ui/RowCard";
import StatusBadge from "@/components/dashboardUser/ui/StatusBadge";
import { resolveStatus, TRANSACTION_STATUS } from "@/constants/user-status";
import { useApiData } from "@/hooks/useApiData";
import { formatDate } from "@/libs/user-format";
import type { PagedResponse, TransactionItem } from "@/types/user-dashboard";

const LIMIT = 5;

const COLUMNS: DataColumn<TransactionItem>[] = [
  { header: "Invoice", cell: (t) => <InvoiceText invoice={t.invoice} /> },
  { header: "Ujian", cell: (t) => <TransactionTitleCell transaction={t} /> },
  { header: "Total", cell: (t) => <TotalText total={t.total} /> },
  {
    header: "Status",
    cell: (t) => <StatusBadge status={resolveStatus(TRANSACTION_STATUS, t.status)} />,
  },
  {
    header: "Tanggal",
    className: "whitespace-nowrap text-gray-500",
    cell: (t) => formatDate(t.createdAt),
  },
  {
    header: "Aksi",
    cell: (t) => (hasTransactionAction(t) ? <TransactionAction transaction={t} /> : EMPTY_CELL),
  },
];

export default function TransactionTable() {
  const { data, status, reload } = useApiData<PagedResponse<TransactionItem>>(
    `/api/user/transactions?limit=${LIMIT}`,
  );

  return (
    <DashboardCard
      title="Transaksi Terakhir"
      subtitle="Pembelian paket try out kamu"
      action={<CardLink href="/user/riwayatTransaksi">Lihat semua</CardLink>}
    >
      <DataTable
        columns={COLUMNS}
        rows={data?.data ?? []}
        getRowKey={(t) => t.id}
        status={status}
        onRetry={reload}
        skeletonRows={LIMIT}
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
              { label: "Tanggal", value: formatDate(t.createdAt) },
            ]}
            action={
              hasTransactionAction(t) ? (
                <TransactionAction transaction={t} size="md" fullWidth />
              ) : undefined
            }
          />
        )}
      />
    </DashboardCard>
  );
}
