"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const statusColor: any = {
  PENDING: "bg-yellow-100 text-yellow-600",
  WAITING: "bg-blue-100 text-blue-600",
  SUCCESS: "bg-green-100 text-green-600",
  FAILED: "bg-red-100 text-red-600",
};

const statusLabel: any = {
  PENDING: "Pending",
  WAITING: "Menunggu Pembayaran",
  SUCCESS: "Sukses",
  FAILED: "Gagal",
};

export function TransactionDetail({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/transaction/${id}`)
      .then((res) => res.json())
      .then(setData);
  }, [id]);

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/transaction/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Transaksi berhasil di-${status === "SUCCESS" ? "approve" : "reject"}`);
      // refresh data
      const updated = await fetch(`/api/transaction/${id}`).then((r) => r.json());
      setData(updated);
    } catch {
      toast.error("Gagal update status");
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow border space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow border space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Detail Transaksi</h1>
          <p className="text-xs text-gray-400 font-mono mt-1">{data.invoice}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Kembali
        </button>
      </div>

      {/* STATUS BADGE */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusColor[data.status]}`}>
          {statusLabel[data.status] || data.status}
        </span>
        {data.paidAt && (
          <span className="text-xs text-gray-400">
            Dibayar: {new Date(data.paidAt).toLocaleString("id-ID")}
          </span>
        )}
      </div>

      {/* INFO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          ["Invoice", data.invoice],
          ["User", data.user?.name],
          ["Email", data.user?.email],
          ["Ujian", data.ujian?.title],
          ["Kategori", data.ujian?.program?.name || "-"],
          ["Total", data.total === 0 ? "Gratis" : `Rp ${data.total?.toLocaleString("id-ID")}`],
          ["Tipe Pembayaran", data.paymentType || "-"],
          ["Expired", data.expiredAt ? new Date(data.expiredAt).toLocaleString("id-ID") : "-"],
          ["Dibuat", new Date(data.createdAt).toLocaleString("id-ID")],
        ].map(([label, value]) => (
          <div key={label} className="space-y-1">
            <p className="text-xs text-gray-400 font-medium">{label}</p>
            <p className="text-sm text-gray-800 font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* ACTION BUTTONS — hanya muncul kalau status bukan SUCCESS/FAILED */}
      {data.status !== "SUCCESS" && data.status !== "FAILED" && (
        <div className="flex gap-3 pt-4 border-t">
          <button
            disabled={loading}
            onClick={() => updateStatus("SUCCESS")}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "✓ Approve"}
          </button>
          <button
            disabled={loading}
            onClick={() => updateStatus("FAILED")}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "✗ Reject"}
          </button>
        </div>
      )}

      {data.status === "SUCCESS" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
          Transaksi ini sudah berhasil diproses dan akses ujian sudah diberikan ke user.
        </div>
      )}

      {data.status === "FAILED" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          Transaksi ini telah ditolak.
        </div>
      )}
    </div>
  );
}