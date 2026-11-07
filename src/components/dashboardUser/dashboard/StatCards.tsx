"use client";

import Link from "next/link";
import { CircleCheck, PenLine, Receipt, Timer, type LucideIcon } from "lucide-react";
import { StatValueSkeleton } from "@/components/dashboardUser/skeletons";
import { useApiData } from "@/hooks/useApiData";
import type { UserStats } from "@/types/user-dashboard";

type StatCard = {
  key: keyof UserStats;
  title: string;
  href: string;
  icon: LucideIcon;
  /** Warna kartu. Sedikit lebih gelap dari kartu admin supaya teks putih tetap terbaca. */
  color: string;
};

const CARDS: StatCard[] = [
  {
    key: "totalSessions",
    title: "Latihan Bulan Ini",
    href: "/user/riwayat",
    icon: PenLine,
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    key: "completedSessions",
    title: "Try Out Selesai",
    href: "/user/riwayat",
    icon: CircleCheck,
    color: "bg-green-600 hover:bg-green-700",
  },
  {
    key: "ongoingSessions",
    title: "Sedang Berlangsung",
    href: "/user/riwayat",
    icon: Timer,
    color: "bg-amber-600 hover:bg-amber-700",
  },
  {
    key: "totalTransactions",
    title: "Transaksi Bulan Ini",
    href: "/user/riwayatTransaksi",
    icon: Receipt,
    color: "bg-red-600 hover:bg-red-700",
  },
];

export default function StatCards() {
  const { data, status, reload } = useApiData<UserStats>("/api/user/stats");

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {CARDS.map(({ key, title, href, icon: Icon, color }) => (
          <Link
            key={key}
            href={href}
            className={`flex items-center justify-between gap-3 rounded-2xl p-4 text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${color}`}
          >
            <div className="min-w-0">
              <p className="text-xs font-medium leading-snug text-white/90 md:text-sm">{title}</p>
              {status === "loading" ? (
                <StatValueSkeleton />
              ) : (
                <p className="mt-0.5 text-2xl font-bold leading-8">
                  {status === "error" ? "–" : (data?.[key] ?? 0)}
                </p>
              )}
            </div>

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 md:h-12 md:w-12">
              <Icon className="h-5 w-5 md:h-6 md:w-6" />
            </span>
          </Link>
        ))}
      </div>

      {status === "error" && (
        <p role="alert" className="mt-3 text-xs text-gray-500">
          Statistik belum bisa dimuat.{" "}
          <button
            type="button"
            onClick={reload}
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Coba lagi
          </button>
        </p>
      )}
    </div>
  );
}
