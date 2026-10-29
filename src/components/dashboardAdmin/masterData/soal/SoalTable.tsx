"use client";

import { useState, useEffect } from "react"; // ✅ tambah useEffect
import Link from "next/link";
import { LayoutGrid, PenBox, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import MobileCardList from "@/components/Ui/MobileCardList";

export default function SoalTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any[]>([]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const perPage = 5;

  // 🔥 FETCH DATA DARI API
  useEffect(() => {
    fetch("/api/soal")
      .then((res) => res.json())
      .then((res) => setData(res));
  }, []);

  const filtered = data.filter((d) =>
    d.title?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-white rounded-2xl p-4 shadow border">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between gap-3 mb-4">
        {/* SEARCH */}
        <input
          placeholder="Cari Berdasarkan Nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm w-full md:w-64"
        />

        {/* BUTTON */}
        <Link href="/admin/master-data/soal/create">
          <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm w-full md:w-auto">
            + Tambah Judul Soal
          </button>
        </Link>
      </div>

      <MobileCardList
        data={paginated}
        emptyText="Belum ada data soal"
        renderItem={(d, i) => (
          <div
            key={d.id}
            className="border rounded-xl p-4 bg-white shadow-sm active:scale-[0.99] transition"
          >
            {/* TOP */}
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <div className="text-[11px] text-gray-400">
                  #{(page - 1) * perPage + i + 1}
                </div>

                <div className="font-semibold text-sm mt-1 text-gray-800">
                  {d.title}
                </div>
              </div>

              <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500 text-white font-semibold">
                {d.category?.name || "-"}
              </span>
            </div>

            {/* INFO */}
            <div className="flex justify-between mt-3 text-xs text-gray-500">
              <div>{d.totalOption || 0} opsi</div>
              <div className="text-[11px] text-gray-400">
                Kategori Penilaian
              </div>
            </div>

            {/* ACTION */}
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
              <Link href={`/admin/master-data/soal/${d.id}`}>
                <button className="p-2 bg-gray-100 rounded-md">
                  <LayoutGrid size={16} strokeWidth={2.5} />
                </button>
              </Link>

              <Link href={`/admin/master-data/soal/create?id=${d.id}`}>
                <button className="p-2 bg-gray-100 rounded-md">
                  <PenBox size={16} strokeWidth={2.5} />
                </button>
              </Link>

              <button
                onClick={() => setDeleteId(d.id)}
                className="p-2 bg-gray-100 rounded-md hover:bg-red-100 group"
              >
                <Trash2
                  size={16}
                  strokeWidth={2.5}
                  className="group-hover:text-red-600"
                />
              </button>
            </div>
          </div>
        )}
      />

      {/* dextop */}
      <div className="hidden md:block verflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b text-left text-gray-600">
            <tr>
              <th className="px-3 py-3 w-12">No</th>
              <th className="px-3 py-3">Peminatan</th>
              <th className="px-3 py-3">Judul Soal</th>
              <th className="px-3 py-3">Jumlah Pilihan</th>
              <th className="px-3 py-3">Kategori Penilaian</th>
              <th className="px-3 py-3 w-40">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400">
                  Belum ada data soal
                </td>
              </tr>
            ) : (
              paginated.map((d, i) => (
                <tr
                  key={d.id}
                  className="border-b text-xs md:text-sm font-medium"
                >
                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {(page - 1) * perPage + i + 1}
                  </td>

                  {/* ✅ FIX category */}
                  <td className="px-3 py-3">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm font-medium">
                      {d.category?.name || "-"}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {d.title}
                  </td>

                  {/* ✅ FIX totalOption */}
                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {d.totalOption || 0}
                  </td>

                  <td className="px-3 py-3">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm font-medium whitespace-nowrap">
                      <span className="md:hidden">Kategori Nilai</span>
                      <span className="hidden md:inline">
                        Dibagi Per Kategori Penilaian
                      </span>
                    </span>
                  </td>

                  <td className="px-3 py-3 flex gap-1 md:gap-2">
                    <Link href={`/admin/master-data/soal/${d.id}`}>
                      <button className="p-1.5 md:p-2 bg-gray-200 rounded-md md:rounded-lg">
                        <LayoutGrid
                          size={14}
                          className="md:w-4 md:h-4"
                          strokeWidth={2.5}
                        />
                      </button>
                    </Link>

                    <Link href={`/admin/master-data/soal/create?id=${d.id}`}>
                      <button className="p-1.5 md:p-2 bg-gray-200 rounded-md md:rounded-lg">
                        <PenBox
                          size={14}
                          className="md:w-4 md:h-4"
                          strokeWidth={2.5}
                        />
                      </button>
                    </Link>

                    <button
                      className="p-1.5 rounded-md bg-gray-100 hover:bg-red-100 transition group"
                      onClick={() => setDeleteId(d.id)}
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

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Hapus Soal</h2>
            <p className="text-sm text-gray-500 mb-4">
              Yakin mau hapus soal ini?
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

                    const res = await fetch(`/api/soal/${deleteId}`, {
                      method: "DELETE",
                    });

                    if (!res.ok) throw new Error();

                    // 🔥 UPDATE UI TANPA RELOAD
                    setData((prev) =>
                      prev.filter((item) => item.id !== deleteId),
                    );

                    toast.success("Soal berhasil dihapus");

                    setDeleteId(null);
                  } catch (err) {
                    toast.error("Gagal menghapus soal");
                  } finally {
                    setLoadingDelete(false);
                  }
                }}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg"
              >
                {loadingDelete ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-between md:justify-end mt-4 gap-2 text-xs md:text-sm">
        {/* PREV */}
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-2 py-1 md:px-3 md:py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>

        {/* PAGE INDICATOR */}
        <span className="bg-blue-600 text-white px-2 md:px-3 py-1 rounded">
          {page}
        </span>

        {/* NEXT */}
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
