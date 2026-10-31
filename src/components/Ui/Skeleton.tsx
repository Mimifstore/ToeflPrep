/**
 * Kerangka loading yang seragam di seluruh panel admin.
 * Semua pakai warna & animasi yang sama; animasi mati otomatis kalau user set "reduce motion".
 */

// Lebar bervariasi biar baris kerangka nggak kelihatan kaku. Ditulis lengkap supaya terbaca Tailwind.
const BAR_WIDTHS = [
  "w-3/4",
  "w-1/2",
  "w-2/3",
  "w-5/6",
  "w-1/3",
  "w-2/5",
  "w-3/5",
  "w-1/4",
];

/** Satu balok kerangka. Atur ukuran lewat className (mis. "h-4 w-1/2"). */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-gray-200 motion-reduce:animate-none ${className}`}
    />
  );
}

/** Baris kerangka di dalam <tbody>. `cols` = jumlah kolom tabelnya. */
export function TableRowsSkeleton({
  rows = 5,
  cols,
}: {
  rows?: number;
  cols: number;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} aria-hidden="true" className="border-b border-gray-50">
          {Array.from({ length: cols }, (_, c) => (
            <td key={c} className="px-3 py-4">
              <Skeleton
                className={`h-4 ${c === 0 ? "w-6" : BAR_WIDTHS[(r + c) % BAR_WIDTHS.length]}`}
              />
            </td>
          ))}
        </tr>
      ))}
      <tr>
        <td colSpan={cols} className="sr-only" role="status">
          Memuat data
        </td>
      </tr>
    </>
  );
}

/** Kartu kerangka untuk tampilan mobile (taruh di dalam wrapper `md:hidden space-y-3`). */
export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="rounded-xl border border-gray-100 bg-white p-4"
        >
          <Skeleton className="h-3 w-8" />
          <Skeleton className="mt-2.5 h-4 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/2" />
          <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </div>
      ))}
    </>
  );
}

/** Kerangka halaman form (tambah/edit). */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div
      role="status"
      aria-label="Memuat formulir"
      className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 md:p-6"
    >
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} aria-hidden="true">
          <Skeleton className="mb-2 h-3.5 w-28" />
          <Skeleton className={i === fields - 1 ? "h-24 w-full" : "h-10 w-full"} />
        </div>
      ))}
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

/** Kerangka halaman detail (label + nilai). */
export function DetailSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-label="Memuat detail"
      className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 md:p-6"
    >
      <div aria-hidden="true" className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3.5 w-1/4" />
        </div>
      </div>
      <div aria-hidden="true" className="grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i}>
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className={`h-4 ${BAR_WIDTHS[i % BAR_WIDTHS.length]}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Kerangka isi halaman admin secara umum (judul + toolbar + tabel). Dipakai loading.tsx. */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Memuat halaman" className="space-y-6">
      <div aria-hidden="true" className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:justify-between">
            <Skeleton className="h-10 w-full md:w-64" />
            <Skeleton className="h-10 w-full md:w-44" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-6" />
                <Skeleton className={`h-4 ${BAR_WIDTHS[i % BAR_WIDTHS.length]}`} />
                <Skeleton className="ml-auto hidden h-4 w-24 md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
