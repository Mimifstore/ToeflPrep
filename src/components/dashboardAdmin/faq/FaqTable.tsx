"use client";

import { useEffect, useState } from "react";
import { Trash2, PenBox, Search } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CardListSkeleton, TableRowsSkeleton } from "@/components/Ui/Skeleton";
import Busy from "@/components/Ui/Busy";

export default function FaqTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [page, setPage] = useState(1);
  const perPage = 5;

  const fetchData = async () => {
    try {
      const res = await fetch("/api/faq");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = data.filter((d) =>
    d.question?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-white p-4 rounded-2xl shadow border">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between gap-3 mb-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari Pertanyaan..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <Link href="/admin/faq/create">
          <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm w-full md:w-auto">
            + Tambah FAQ
          </button>
        </Link>
      </div>

      {/* ✅ MOBILE CARD */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <CardListSkeleton />
        ) : paginated.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            Data FAQ kosong
          </div>
        ) : (
          paginated.map((item, i) => (
            <div
              key={item.id}
              className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
            >
              {/* TOP */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-gray-400">
                    #{(page - 1) * perPage + i + 1}
                  </div>

                  <div className="font-semibold text-sm mt-1 leading-snug">
                    {item.question}
                  </div>
                </div>

                <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500 text-white font-semibold">
                  {item.category || "-"}
                </span>
              </div>

              {/* INFO */}
              <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                <span
                  className={`px-2 py-1 rounded ${
                    item.isActive
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-red-500"
                  }`}
                >
                  {item.isActive ? "Aktif" : "Nonaktif"}
                </span>

                <span>
                  {new Date(item.createdAt).toLocaleDateString("id-ID")}
                </span>
              </div>

              {/* ACTION */}
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Link href={`/admin/faq/edit/${item.id}`}>
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <PenBox size={14} strokeWidth={2.5} />
                  </button>
                </Link>

                <button
                  onClick={() => setDeleteId(item.id)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-red-100 group"
                >
                  <Trash2
                    size={14}
                    strokeWidth={2.5}
                    className="text-gray-600 group-hover:text-red-600"
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✅ DESKTOP (UNCHANGED) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b text-left text-gray-600">
            <tr>
              <th className="px-3 py-3 w-12">No</th>
              <th className="px-3 py-3">Pertanyaan</th>
              <th className="px-3 py-3">Kategori</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Created</th>
              <th className="px-3 py-3 w-32">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TableRowsSkeleton cols={6} />
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  Data FAQ kosong
                </td>
              </tr>
            ) : (
              paginated.map((item, i) => (
                <tr key={item.id} className="border-b text-xs">
                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {(page - 1) * perPage + i + 1}
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {item.question}
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {item.category || "-"}
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.isActive
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-red-500"
                      }`}
                    >
                      {item.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </td>

                  <td className="px-3 py-3 flex gap-1 md:gap-2">
                    <Link href={`/admin/faq/edit/${item.id}`}>
                      <button className="p-1.5 md:p-2 bg-gray-200 rounded-md md:rounded-lg">
                        <PenBox size={14} strokeWidth={2.5} />
                      </button>
                    </Link>

                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="p-1.5 rounded-md bg-gray-100 hover:bg-red-100 transition group"
                    >
                      <Trash2
                        size={14}
                        strokeWidth={2.5}
                        className="md:w-4 md:h-4 text-gray-600 group-hover:text-red-600"
                      />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Hapus FAQ</h2>
            <p className="text-sm text-gray-500 mb-4">
              Yakin mau hapus FAQ ini?
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

                    const res = await fetch(`/api/faq/${deleteId}`, {
                      method: "DELETE",
                    });

                    if (!res.ok) throw new Error();

                    setData((prev) => prev.filter((i) => i.id !== deleteId));

                    toast.success("FAQ berhasil dihapus");
                    setDeleteId(null);
                  } catch (err) {
                    toast.error("Gagal menghapus FAQ");
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
    </div>
  );
}