"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, PenBox, Trash2 } from "lucide-react";
import { CardListSkeleton, TableRowsSkeleton } from "@/components/Ui/Skeleton";

export default function Table() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const perPage = 5;

  const fetchData = async () => {
    try {
      const res = await fetch("/api/category-score");
      const result = await res.json();
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = data.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = async (id: string) => {
    await fetch("/api/category-score", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow border">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between gap-3 mb-4">
        <input
          placeholder="Cari Berdasarkan Nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm w-full md:w-64"
        />

        <Link href="/admin/master-data/kategori-penilaian/create">
          <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm w-full md:w-auto">
            + Tambah Kategori Penilaian
          </button>
        </Link>
      </div>

      {/* 🔥 MOBILE */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <CardListSkeleton />
        ) : paginated.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            Data kosong
          </div>
        ) : (
          paginated.map((d, i) => (
            <div
              key={d.id}
              className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-gray-400">
                    #{(page - 1) * perPage + i + 1}
                  </div>

                  <div className="font-semibold text-sm mt-1 leading-snug">
                    {d.name}
                  </div>
                </div>

                <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500 text-white font-semibold">
                  {d.program || "-"}
                </span>
              </div>

              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <div>
                  <span className="text-gray-400">Jenis: </span>
                  Nilai = Jumlah Jawaban Benar
                </div>
                <div>
                  <span className="text-gray-400">Section: </span>
                  {d.section?.order || "-"}
                </div>
              </div>

              {/* ACTION */}
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Link
                  href={`/admin/master-data/kategori-penilaian/${d.id}`}
                >
                  <button className="p-2 bg-gray-100 rounded-lg">
                    <LayoutGrid size={14} strokeWidth={2.5} />
                  </button>
                </Link>

                <Link
                  href={`/admin/master-data/kategori-penilaian/create?id=${d.id}`}
                >
                  <button className="p-2 bg-gray-100 rounded-lg">
                    <PenBox size={14} strokeWidth={2.5} />
                  </button>
                </Link>

                <button
                  onClick={() => handleDelete(d.id)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-red-100 transition group"
                >
                  <Trash2
                    size={14}
                    strokeWidth={2.5}
                    className="group-hover:text-red-600"
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔥 DESKTOP (TIDAK DIUBAH) */}
      <div className="hidden md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b text-gray-600 text-left">
            <tr>
              <th className="px-3 py-3">No</th>
              <th className="px-3 py-3">Kategori</th>
              <th className="px-3 py-3">Nama Penilaian</th>
              <th className="px-3 py-3">Jenis Penilaian</th>
              <th className="px-3 py-3">Section</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TableRowsSkeleton cols={6} />
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400">
                  Data kosong
                </td>
              </tr>
            ) : (
              paginated.map((d, i) => (
                <tr
                  key={d.id}
                  className="border-b align-middle text-xs md:text-sm font-medium"
                >
                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {(page - 1) * perPage + i + 1}
                  </td>
                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {d.program}
                  </td>
                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {d.name}
                  </td>
                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    Nilai = Jumlah Jawaban Benar
                  </td>
                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {d.section?.order || "-"}
                  </td>

                  <td className="flex gap-2 py-2 items-center">
                    <Link href={`/admin/master-data/kategori-penilaian/${d.id}`}>
                      <button className="p-1.5 md:p-2 bg-gray-200 rounded-md md:rounded-lg">
                        <LayoutGrid
                          size={14}
                          className="md:w-4 md:h-4"
                          strokeWidth={2.5}
                        />
                      </button>
                    </Link>

                    <Link
                      href={`/admin/master-data/kategori-penilaian/create?id=${d.id}`}
                    >
                      <button className="p-1.5 md:p-2 bg-gray-200 rounded-md md:rounded-lg">
                        <PenBox
                          size={14}
                          className="md:w-4 md:h-4"
                          strokeWidth={2.5}
                        />
                      </button>
                    </Link>

                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-1.5 rounded-md bg-gray-100 hover:bg-red-100 transition group"
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
          disabled={page === totalPages}
          className="px-2 py-1 md:px-3 md:py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
