import { Fragment, type ReactNode } from "react";
import { CardListSkeleton, TableRowsSkeleton } from "@/components/Ui/Skeleton";
import type { ApiStatus } from "@/hooks/useApiData";
import ErrorState from "./ErrorState";

export type DataColumn<T> = {
  header: string;
  cell: (row: T, index: number) => ReactNode;
  /** Kelas tambahan untuk sel, mis. "whitespace-nowrap". */
  className?: string;
};

type DataTableProps<T> = {
  columns: DataColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  /** Tampilan satu baris di mobile (md ke bawah). */
  renderCard: (row: T, index: number) => ReactNode;
  status: ApiStatus;
  onRetry: () => void;
  /** Ditampilkan kalau data sudah dimuat tapi kosong. */
  empty: ReactNode;
  skeletonRows?: number;
};

/**
 * Tabel responsif: kartu di mobile, tabel di desktop. Menangani semua kondisi sekaligus:
 * memuat (kerangka), gagal (tombol coba lagi), kosong, dan berisi.
 */
export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
  renderCard,
  status,
  onRetry,
  empty,
  skeletonRows = 5,
}: DataTableProps<T>) {
  if (status === "error") return <ErrorState onRetry={onRetry} />;
  if (status === "ready" && rows.length === 0) return <>{empty}</>;

  const loading = status === "loading";

  return (
    <>
      {/* MOBILE: kartu */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div role="status" aria-label="Memuat data" className="space-y-3">
            <CardListSkeleton count={Math.min(skeletonRows, 3)} />
          </div>
        ) : (
          rows.map((row, index) => (
            <Fragment key={getRowKey(row)}>{renderCard(row, index)}</Fragment>
          ))
        )}
      </div>

      {/* DESKTOP: tabel */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-gray-50 text-xs text-gray-600">
            <tr>
              {columns.map((column) => (
                <th key={column.header} scope="col" className="px-3 py-3 text-left">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableRowsSkeleton rows={skeletonRows} cols={columns.length} />
            ) : (
              rows.map((row, index) => (
                <tr key={getRowKey(row)} className="border-b text-xs last:border-0 hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.header} className={`px-3 py-3 align-middle ${column.className ?? ""}`}>
                      {column.cell(row, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
