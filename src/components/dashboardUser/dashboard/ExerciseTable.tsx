"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ExerciseTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/exercises")
      .then((res) => res.json())
      .then((res) => {
        setData(res.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status: string) => {
    if (status === "SUBMITTED") return "bg-emerald-100 text-emerald-700";
    if (status === "EXPIRED") return "bg-red-50 text-red-600";
    return "bg-amber-50 text-amber-700";
  };

  const statusLabel = (status: string) => {
    if (status === "SUBMITTED") return "Selesai";
    if (status === "EXPIRED") return "Expired";
    return "Berlangsung";
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Latihan Terakhir</h3>
        <Link href="/user/riwayat" className="text-xs text-blue-600 hover:underline">
          Lihat semua
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">
          Belum ada riwayat latihan
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-2 px-2 font-medium">Ujian</th>
                <th className="pb-2 px-2 font-medium">Score</th>
                <th className="pb-2 px-2 font-medium">Status</th>
                <th className="pb-2 px-2 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2">
                    <p className="font-medium text-gray-800 text-xs">{d.ujianTitle}</p>
                    <p className="text-xs text-gray-400">{d.category}</p>
                  </td>
                  <td className="py-3 px-2">
                    <span className="font-semibold text-blue-500">
                      {d.score ?? "-"}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(d.status)}`}>
                      {statusLabel(d.status)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-xs text-gray-400">
                    {new Date(d.startedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}