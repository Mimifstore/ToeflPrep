"use client";
import { useEffect, useState } from "react";
import { Search, Eye } from "lucide-react";
import Link from "next/link";

const statusColor: any = {
  PENDING: "bg-yellow-100 text-yellow-600",
  WAITING: "bg-blue-100 text-blue-600",
  SUCCESS: "bg-green-100 text-green-600",
  FAILED: "bg-red-100 text-red-600",
};

const statusLabel: any = {
  PENDING: "Pending",
  WAITING: "Menunggu",
  SUCCESS: "Sukses",
  FAILED: "Gagal",
};

export function TransactionTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/transaction");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((d) =>
    d.invoice?.toLowerCase().includes(search.toLowerCase()) ||
    d.ujian?.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-4 rounded-2xl shadow border">
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari invoice, ujian, user..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-6 text-sm">
            Data transaksi kosong
          </div>
        ) : (
          filtered.map((d, i) => (
            <div key={d.id} className="border rounded-xl p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-gray-400">#{i + 1}</div>
                  <div className="font-semibold text-sm mt-1 font-mono">{d.invoice}</div>
                  <div className="text-xs text-gray-500 mt-1">{d.ujian?.title}</div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${statusColor[d.status]}`}>
                  {statusLabel[d.status] || d.status}
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <div>{d.ujian?.program?.name}</div>
                <div>{d.user?.name}</div>
                <div>Exp: {d.expiredAt ? new Date(d.expiredAt).toLocaleString("id-ID") : "-"}</div>
                <div className="font-semibold text-gray-700">
                  {d.total === 0 ? "Gratis" : `Rp ${d.total?.toLocaleString("id-ID")}`}
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Link href={`/admin/transaksi/${d.id}`}>
                  <button className="p-2 bg-gray-100 rounded-lg">
                    <Eye size={14} />
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b text-gray-600 text-xs">
            <tr>
              <th className="px-3 py-3 text-left">No</th>
              <th className="px-3 py-3 text-left">Invoice</th>
              <th className="px-3 py-3 text-left">Kategori</th>
              <th className="px-3 py-3 text-left">Judul Ujian</th>
              <th className="px-3 py-3 text-left">User</th>
              <th className="px-3 py-3 text-left">Expired</th>
              <th className="px-3 py-3 text-left">Total</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b">
                  {[...Array(9)].map((_, j) => (
                    <td key={j} className="px-3 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-gray-400">
                  Data transaksi kosong
                </td>
              </tr>
            ) : (
              filtered.map((d, i) => (
                <tr key={d.id} className="border-b hover:bg-gray-50 text-xs">
                  <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-3 py-3 font-mono text-gray-700">{d.invoice}</td>
                  <td className="px-3 py-3">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      {d.ujian?.program?.name || "-"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-700">{d.ujian?.title}</td>
                  <td className="px-3 py-3 text-gray-600">{d.user?.name}</td>
                  <td className="px-3 py-3 text-gray-500">
                    {d.expiredAt ? new Date(d.expiredAt).toLocaleString("id-ID") : "-"}
                  </td>
                  <td className="px-3 py-3 font-semibold text-gray-700">
                    {d.total === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      `Rp ${d.total?.toLocaleString("id-ID")}`
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[d.status]}`}>
                      {statusLabel[d.status] || d.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <Link href={`/admin/transaksi/${d.id}`}>
                      <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                        <Eye size={14} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}