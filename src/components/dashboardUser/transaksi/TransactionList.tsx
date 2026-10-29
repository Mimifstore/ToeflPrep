"use client";
import { useEffect, useState } from "react";

export default function TransactionList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const perPage = 10;

  const fetchData = async (p: number) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/user/transactions?page=${p}&limit=${perPage}`,
      );
      const result = await res.json();
      setData(result.data || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const statusBadge = (status: string) => {
    if (status === "SUCCESS") return "bg-green-100 text-green-700";
    if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
    if (status === "WAITING") return "bg-blue-100 text-blue-700";
    if (status === "FAILED") return "bg-red-100 text-red-600";
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-5">
        <div>
          <h2 className="font-semibold text-gray-800">Riwayat Transaksi</h2>
          <p className="text-xs text-gray-400">{total} total transaksi</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b bg-gray-50">
              <th className="px-3 py-3 rounded-tl-lg">No</th>
              <th className="px-3 py-3">Invoice</th>
              <th className="px-3 py-3">Ujian</th>
              <th className="px-3 py-3">Total</th>
              <th className="px-3 py-3">Maks. Bayar</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 rounded-tr-lg">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-3 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-gray-400 text-sm"
                >
                  Belum ada riwayat transaksi
                </td>
              </tr>
            ) : (
              data.map((t, i) => (
                <tr
                  key={t.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="px-3 py-3 text-xs text-gray-500">
                    {(page - 1) * perPage + i + 1}
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs font-mono text-gray-600">
                      {t.invoice}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-xs font-medium text-gray-800">
                      {t.ujianTitle}
                    </p>
                    <p className="text-xs text-gray-400">{t.category}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs font-semibold text-gray-700">
                      {t.total === 0 ? (
                        <span className="text-green-600">Gratis</span>
                      ) : (
                        `Rp ${t.total.toLocaleString("id-ID")}`
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-400">
                    {t.expiredAt
                      ? new Date(t.expiredAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(t.status)}`}
                    >
                      {statusLabel(t.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {t.status === "PENDING" && t.redirectUrl ? (
                      <a
                        href={t.redirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition"
                      >
                        Bayar
                      </a>
                    ) : t.status === "SUCCESS" ? (
                      <span className="text-xs text-green-600 font-medium">
                        Lunas
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-5 pt-4 border-t">
          <p className="text-xs text-gray-400">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              ← Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1.5 text-xs rounded-lg transition ${
                  page === i + 1
                    ? "bg-blue-600 text-white"
                    : "border hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
