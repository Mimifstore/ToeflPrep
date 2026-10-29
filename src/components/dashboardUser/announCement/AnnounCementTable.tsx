"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react";

export function AnnounCementTable() {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 5;

  const fetchData = async (pageNumber = 1) => {
    const res = await fetch(
      `/api/announcement?page=${pageNumber}&limit=${limit}`,
    );
    const result = await res.json();

    setData(result.data);
    setTotalPages(result.totalPages);
    setPage(result.page);
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const isNew = (date: string) => {
    const created = new Date(date).getTime();
    const now = new Date().getTime();
    return now - created < 24 * 60 * 60 * 1000;
  };

  // generate page numbers, with ellipsis for many pages
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
        <table className="min-w-full text-xs md:text-sm text-left">
          <thead className="text-gray-400">
            <tr>
              <th className="px-3 md:px-4 py-3 border-b border-gray-100 font-medium w-12">No</th>
              <th className="px-3 md:px-4 py-3 border-b border-gray-100 font-medium">Judul</th>
              <th className="px-3 md:px-4 py-3 border-b border-gray-100 font-medium whitespace-nowrap">
                Created
              </th>
              <th className="px-3 md:px-4 py-3 border-b border-gray-100 font-medium w-24">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-gray-400 py-8"
                >
                  Data Pengumuman kosong
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 md:px-4 py-3 text-gray-500">
                    {(page - 1) * limit + i + 1}
                  </td>

                  <td className="px-3 md:px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="break-words text-gray-800 font-medium">
                          {item.title}
                        </span>
                        {isNew(item.createdAt) && (
                          <span className="bg-blue-50 text-blue-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                            Baru
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-3 md:px-4 py-3 text-xs md:text-sm whitespace-nowrap text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </td>

                  <td className="px-3 md:px-4 py-3">
                    <Link
                      href={`/user/pengumuman/${item.id}`}
                      className="text-blue-600 hover:underline text-xs md:text-sm font-medium"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center md:justify-end items-center gap-1.5 mt-4">
        <button
          onClick={() => fetchData(page - 1)}
          disabled={page === 1}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-1.5 text-sm text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => fetchData(p)}
              className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => fetchData(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}