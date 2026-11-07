import CategoryBadge from "@/components/dashboardUser/ui/CategoryBadge";
import { formatRupiah } from "@/libs/admin-search-utils";
import type { TransactionItem } from "@/types/user-dashboard";

/** Judul ujian + badge kategori, dipakai di semua tabel transaksi. */
export function TransactionTitleCell({ transaction }: { transaction: TransactionItem }) {
  return (
    <>
      <p className="font-medium text-gray-800">{transaction.ujianTitle}</p>
      <div className="mt-1">
        <CategoryBadge name={transaction.category} />
      </div>
    </>
  );
}

export function InvoiceText({ invoice }: { invoice: string }) {
  return <span className="whitespace-nowrap font-mono text-gray-700">{invoice}</span>;
}

/** "Gratis" (hijau) atau nominal rupiah. */
export function TotalText({ total }: { total: number }) {
  if (total === 0) return <span className="font-medium text-green-600">Gratis</span>;
  return <span className="whitespace-nowrap font-semibold text-gray-700">{formatRupiah(total)}</span>;
}
