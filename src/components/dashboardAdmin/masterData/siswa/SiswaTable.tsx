"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, PenBox } from "lucide-react";
import { CardListSkeleton, TableRowsSkeleton } from "@/components/Ui/Skeleton";

export default function SiswaTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const perPage = 5;

  const fetchData = async () => {
    try {
      const res = await fetch("/api/siswa");
      const result = await res.json();
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //  SEARCH
  const filtered = data.filter((s) =>
    (s.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  //  PAGINATION
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border">
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <input
          placeholder="Cari Berdasarkan Nama..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded-lg text-sm w-full md:w-64"
        />
      </div>

      {/*  MOBILE */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <CardListSkeleton />
        ) : paginated.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            Data kosong
          </div>
        ) : (
          paginated.map((s, i) => (
            <div
              key={s.id}
              className="border rounded-xl p-4 bg-white shadow-sm active:scale-[0.99] transition"
            >
              {/* TOP */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="text-[11px] text-gray-400">
                    #{(page - 1) * perPage + i + 1}
                  </div>

                  <div className="font-semibold text-sm mt-1 text-gray-800">
                    {s.name || "-"}
                  </div>

                  <div className="text-xs text-gray-500 mt-1 break-all">
                    {s.user?.email || "-"}
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-1 rounded-full font-semibold whitespace-nowrap ${
                    s.isMember
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {s.isMember ? "Member" : "-"}
                </span>
              </div>

              {/* INFO */}
              <div className="flex justify-between mt-3 text-xs text-gray-500">
                <div>{s.phone || "-"}</div>
              </div>

              {/* ACTION */}
              <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                <Link href={`/admin/master-data/siswa/${s.id}`}>
                  <button className="p-1.5 md:p-2 bg-gray-200 rounded-md md:rounded-lg">
                    <LayoutGrid
                      size={14}
                      className="md:w-4 md:h-4"
                      strokeWidth={2.5}
                    />
                  </button>
                </Link>

                <Link href={`/admin/master-data/siswa/${s.id}/edit`}>
                  <button className="p-2 bg-gray-100 rounded-md active:scale-95 transition group">
                    <PenBox
                      size={16}
                      strokeWidth={2.5}
                      className="text-gray-600 group-hover:text-blue-600"
                    />
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TABLE (DESKTOP - UNTOUCHED) */}
      <div className="hidden md:block verflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b text-left text-gray-600">
            <tr>
              <th className="px-3 py-3 w-12">No</th>
              <th className="px-3 py-3">Nama</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3 w-32">Phone</th>
              <th className="px-3 py-3 w-32">Member</th>
              <th className="px-3 py-3 w-40">Action</th>
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
              paginated.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-b text-xs md:text-sm font-medium"
                >
                  <td className="px-3 py-3 text-xs md:text-sm font-medium align-middle">
                    {(page - 1) * perPage + i + 1}
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium align-middle">
                    {s.name || "-"}
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium align-middle">
                    {s.user?.email}
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium align-middle">
                    {s.phone || "-"}
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium align-middle">
                    <span
                      className={`px-2 py-1 text-xs md:text-sm font-medium rounded-full ${
                        s.isMember
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {s.isMember ? "Member" : "-"}
                    </span>
                  </td>

                  <td className="px-3 py-3 flex gap-1 md:gap-2">
                    <Link href={`/admin/master-data/siswa/${s.id}`}>
                      <button className="p-2 bg-gray-100 rounded-md">
                        <LayoutGrid size={14} strokeWidth={2.5} />
                      </button>
                    </Link>

                    <Link href={`/admin/master-data/siswa/${s.id}/edit`}>
                      <button className="p-2 bg-gray-100 rounded-md">
                        <PenBox size={14} strokeWidth={2.5} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-end mt-4 gap-2 text-sm">
          <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-2 py-1 md:px-3 md:py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="bg-blue-600 text-white px-3 py-1 rounded">{page}</span>

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
