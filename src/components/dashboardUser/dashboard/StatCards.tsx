"use client";
import { PenBox, Receipt } from "lucide-react";
import { useEffect, useState } from "react";

export default function StatCards() {
  const [stats, setStats] = useState({ totalSessions: 0, totalTransactions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: "Latihan Soal Bulan Ini",
      value: stats.totalSessions,
      icon: PenBox,
    },
    {
      title: "Transaksi Bulan Ini",
      value: stats.totalTransactions,
      icon: Receipt,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cards.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.title}
            className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 transition-shadow duration-200 shadow-md"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
              <Icon className="w-5 h-5" strokeWidth={2.25} />
            </div>

            <div>
              <p className="text-sm text-gray-500">{s.title}</p>
              {loading ? (
                <span className="inline-block w-12 h-7 bg-gray-100 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-xl md:text-3xl font-semibold text-gray-900 mt-0.5">
                  {s.value}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}