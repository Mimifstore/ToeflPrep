"use client";

import { useEffect, useState } from "react";
import { Trash2, Search, LayoutGrid, PenBox } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CardListSkeleton, TableRowsSkeleton } from "@/components/Ui/Skeleton";
import Busy from "@/components/Ui/Busy";

export default function UjianTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const perPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/exam");
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
    d.title?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-white p-4 rounded-2xl shadow border">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari Berdasarkan Judul..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <Link href={"/admin/ujian/create"}>
          <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm w-full md:w-auto">
            + Tambah Ujian
          </button>
        </Link>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <CardListSkeleton />
        ) : paginated.length === 0 ? (
          <div className="text-center text-gray-400 py-6">
            Belum ada data ujian
          </div>
        ) : (
          paginated.map((item, i) => (
            <div
              key={item.id}
              className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-gray-400">
                    #{(page - 1) * perPage + i + 1}
                  </div>

                  <div className="font-semibold text-sm mt-1 leading-snug">
                    {item.title}
                  </div>
                </div>

                <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500 text-white font-semibold">
                  {item.program?.name || "-"}
                </span>
              </div>

              {/* INFO */}
              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <div>
                  <span className="text-gray-400">Soal:</span>{" "}
                  {item.questionBank?.title || "-"}
                </div>

                <div>
                  <span className="text-gray-400">Durasi:</span>{" "}
                  {item.timeType === "SINGLE" ? (
                    `${item.totalTime} Menit`
                  ) : (
                    <span>Per Section</span>
                  )}
                </div>

                <div>
                  <span className="text-gray-400">Harga:</span>{" "}
                  {item.price
                    ? `Rp ${item.price.toLocaleString("id-ID")}`
                    : "Gratis"}
                </div>

                <div>
                  <span className="text-gray-400">User:</span>{" "}
                  {item._count?.users || 0}
                </div>
              </div>

              {/* ACTION */}
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Link href={`/admin/ujian/${item.id}`}>
                  <button className="p-2 bg-gray-100 rounded-lg">
                    <LayoutGrid size={14} />
                  </button>
                </Link>

                <Link href={`/admin/ujian/${item.id}/edit`}>
                  <button className="p-2 bg-gray-100 rounded-lg">
                    <PenBox size={14} strokeWidth={2.5} />
                  </button>
                </Link>

                <button
                  onClick={() => setDeleteId(item.id)}
                  className="p-2 bg-gray-100 rounded-lg group hover:bg-red-100"
                >
                  <Trash2
                    size={14}
                    className="text-gray-600 group-hover:text-red-600"
                    strokeWidth={2.5}
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= DESKTOP (UNCHANGED) ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b text-left text-gray-600">
            <tr>
              <th className="px-3 py-3 w-12">No</th>
              <th className="px-3 py-3">Kategori</th>
              <th className="px-3 py-3">Judul Soal</th>
              <th className="px-3 py-3">Judul Ujian</th>
              <th className="px-3 py-3">Durasi</th>
              <th className="px-3 py-3">Harga</th>
              <th className="px-3 py-3">User</th>
              <th className="px-3 py-3 w-40">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TableRowsSkeleton cols={8} />
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">
                  Belum ada data ujian
                </td>
              </tr>
            ) : (
              paginated.map((item, i) => (
                <tr key={item.id} className="border-b text-xs">
                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {(page - 1) * perPage + i + 1}
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm font-medium">
                      {item.program?.name}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {item.questionBank?.title}
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {item.title}
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {item.timeType === "SINGLE" ? (
                      `${item.totalTime} Menit`
                    ) : (
                      <div className="flex flex-col text-[11px] leading-4">
                        <span className="font-semibold text-blue-600">
                          Per Section
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {item.price
                      ? `Rp ${item.price.toLocaleString("id-ID")}`
                      : "Gratis"}
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {item._count?.users || 0}
                  </td>

                  <td className="px-3 py-3 flex gap-1 md:gap-2">
                    <Link href={`/admin/ujian/${item.id}`}>
                      <button className="p-1.5 md:p-2 bg-gray-200 rounded-md md:rounded-lg">
                        <LayoutGrid size={14} />
                      </button>
                    </Link>

                    <Link href={`/admin/ujian/${item.id}/edit`}>
                      <button className="p-1.5 md:p-2 bg-gray-200 rounded-md md:rounded-lg">
                        <PenBox size={14} strokeWidth={2.5} />
                      </button>
                    </Link>

                    <button
                      className="p-1.5 rounded-md bg-gray-100 hover:bg-red-100 transition group"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2
                        size={14}
                        className="md:w-4 md:h-4 text-gray-600 group-hover:text-red-600"
                        strokeWidth={2.5}
                      />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Hapus Ujian</h2>
            <p className="text-sm text-gray-500 mb-4">
              Yakin mau hapus ujian ini?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-3 py-2 text-sm bg-gray-100 rounded-lg"
              >
                Batal
              </button>

              <button
                disabled={loadingDelete}
                onClick={async () => {
                  try {
                    setLoadingDelete(true);

                    const res = await fetch(`/api/exam/${deleteId}`, {
                      method: "DELETE",
                    });

                    if (!res.ok) throw new Error();

                    setData((prev) =>
                      prev.filter((item) => item.id !== deleteId),
                    );

                    toast.success("Ujian berhasil dihapus");
                    setDeleteId(null);
                  } catch (err) {
                    toast.error("Gagal menghapus ujian");
                  } finally {
                    setLoadingDelete(false);
                  }
                }}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg"
              >
                <Busy loading={loadingDelete} text="Menghapus...">Hapus</Busy>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-between md:justify-end mt-4 gap-2 text-xs md:text-sm">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-2 py-1 md:px-3 md:py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="bg-blue-600 text-white px-2 md:px-3 py-1 rounded">
          {page}
        </span>

        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages || totalPages === 0}
          className="px-2 py-1 md:px-3 md:py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
