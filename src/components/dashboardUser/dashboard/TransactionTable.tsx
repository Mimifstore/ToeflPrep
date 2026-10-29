"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TransactionTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/transactions")
      .then((res) => res.json())
      .then((res) => {
        setData(res.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status: string) => {
    if (status === "SUCCESS") return "bg-emerald-50 text-emerald-700";
    if (status === "PENDING") return "bg-amber-50 text-amber-700";
    if (status === "WAITING") return "bg-blue-50 text-blue-700";
    if (status === "FAILED") return "bg-red-50 text-red-600";
    return "bg-gray-100 text-gray-600";
  };

  const statusLabel = (status: string) => {
    if (status === "SUCCESS") return "Sukses";
    if (status === "PENDING") return "Pending";
    if (status === "WAITING") return "Menunggu";
    if (status === "FAILED") return "Gagal";
    return status;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Transaksi Terakhir</h3>
        <Link href="/user/riwayatTransaksi" className="text-xs text-blue-600 hover:underline">
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
          Belum ada riwayat transaksi
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-2 px-2 font-medium">Invoice</th>
                <th className="pb-2 px-2 font-medium">Ujian</th>
                <th className="pb-2 px-2 font-medium">Total</th>
                <th className="pb-2 px-2 font-medium">Status</th>
                <th className="pb-2 px-2 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {data.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2">
                    <span className="text-xs font-mono text-gray-500">{t.invoice}</span>
                  </td>
                  <td className="py-3 px-2">
                    <p className="font-medium text-gray-800 text-xs">{t.ujianTitle}</p>
                    <p className="text-xs text-gray-400">{t.category}</p>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-xs font-semibold text-gray-700">
                      {t.total === 0 ? "Gratis" : `Rp ${t.total.toLocaleString("id-ID")}`}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(t.status)}`}>
                      {statusLabel(t.status)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString("id-ID", {
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