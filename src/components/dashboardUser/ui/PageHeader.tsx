import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Tautan "kembali" kecil di atas judul. */
  backHref?: string;
  backLabel?: string;
  /** Baris kecil di bawah deskripsi (badge, jumlah item, dst). */
  meta?: ReactNode;
  /** Pojok kanan (tombol). */
  actions?: ReactNode;
};

/** Judul halaman dashboard siswa: tautan kembali, judul, deskripsi, dan tombol di kanan. */
export default function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Kembali",
  meta,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-3 inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
        )}
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 md:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500">{description}</p>
        )}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
