import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type DashboardCardProps = {
  title: string;
  subtitle?: string;
  /** Pojok kanan header, biasanya <CardLink>. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Kartu putih standar dashboard siswa (ukuran dan bayangan sama dengan kartu tabel admin). */
export default function DashboardCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: DashboardCardProps) {
  return (
    <section className={`h-full rounded-2xl border bg-white p-4 shadow md:p-5 ${className}`}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

/** Tautan kecil "Lihat semua →" di header kartu. */
export function CardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 rounded-md px-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
