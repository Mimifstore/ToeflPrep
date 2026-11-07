import type { ReactNode } from "react";

type RowCardProps = {
  title: ReactNode;
  /** Baris kecil di bawah judul (badge kategori, tanggal, dst). */
  meta?: ReactNode;
  /** Pojok kanan atas, biasanya <StatusBadge>. */
  badge?: ReactNode;
  details?: { label: string; value: ReactNode }[];
  /** Tombol di bagian bawah kartu. */
  action?: ReactNode;
};

/** Satu baris data dalam bentuk kartu, untuk tampilan mobile (gaya kartu daftar admin). */
export default function RowCard({ title, meta, badge, details, action }: RowCardProps) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-gray-800">{title}</p>
          {meta && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">{meta}</div>
          )}
        </div>
        {badge}
      </div>

      {details && details.length > 0 && (
        <dl className="mt-3 space-y-1.5 text-xs">
          {details.map((detail) => (
            <div key={detail.label} className="flex items-center justify-between gap-3">
              <dt className="text-gray-400">{detail.label}</dt>
              <dd className="text-right font-medium text-gray-700">{detail.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {action && <div className="mt-3 border-t pt-3">{action}</div>}
    </div>
  );
}
