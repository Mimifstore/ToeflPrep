"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function DetailKategoriPenilaian() {
  const params = useParams();

  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetch(`/api/category-score/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow">
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow">
        Data tidak ditemukan
      </div>
    );
  }

  const totalPages = Math.ceil(
    data.mappings.length / perPage,
  );

  const paginated = data.mappings.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {data.name}
        </h1>

        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
            Program: {data.program}
          </span>

          <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg">
            Section: {data.section?.title || "-"}
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">
                No
              </th>

              <th className="p-3 text-left">
                Nilai Minimal
              </th>

              <th className="p-3 text-left">
                Nilai Maksimal
              </th>

              <th className="p-3 text-left">
                Nilai Akhir
              </th>
            </tr>
          </thead>

          <tbody>
            {paginated.map(
              (m: any, i: number) => (
                <tr
                  key={m.id}
                  className="border-t text-sm"
                >
                  <td className="p-3">
                    {(page - 1) * perPage +
                      i +
                      1}
                  </td>

                  <td className="p-3">
                    {m.minScore}
                  </td>

                  <td className="p-3">
                    {m.maxScore}
                  </td>

                  <td className="p-3 font-semibold text-blue-600">
                    {m.finalScore}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-end items-center gap-3">
        <button
          onClick={() =>
            setPage((prev) => prev - 1)
          }
          disabled={page === 1}
          className="px-4 py-2 rounded-lg border disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">
          {page} / {totalPages}
        </span>

        <button
          onClick={() =>
            setPage((prev) => prev + 1)
          }
          disabled={page === totalPages}
          className="px-4 py-2 rounded-lg border disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}