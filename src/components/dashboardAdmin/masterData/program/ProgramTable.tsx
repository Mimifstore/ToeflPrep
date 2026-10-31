"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PenBox, Trash2, Plus, AlertTriangle, X } from "lucide-react";
import { CardListSkeleton, TableRowsSkeleton } from "@/components/Ui/Skeleton";
import Busy from "@/components/Ui/Busy";

export default function ProgramTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/program");
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch("/api/program", {
        method: "DELETE",
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      await fetchData();
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between gap-3 mb-4">
        <input
          placeholder="Cari berdasarkan nama..."
          className="border border-gray-200 px-3 py-2 rounded-lg text-sm w-full md:w-64 outline-none focus:border-blue-500 transition-colors"
          onChange={(e) => setSearch(e.target.value)}
        />

        <Link href="/admin/master-data/program/create">
          <button className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium w-full md:w-auto transition-colors">
            <Plus className="w-4 h-4" />
            Tambah Kategori Peminatan
          </button>
        </Link>
      </div>

      {/* MOBILE */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <CardListSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Data kosong
          </div>
        ) : (
          filtered.map((d, i) => (
            <div
              key={d.id}
              className="border border-gray-100 rounded-xl p-4 bg-white hover:border-gray-200 transition-colors"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-gray-400">#{i + 1}</div>
                  <div className="font-semibold text-sm mt-1 leading-snug text-gray-800 truncate">
                    {d.name}
                  </div>
                </div>

                <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                  <Image
                    src={d.image || "/no-image.png"}
                    alt={d.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <Link
                  href={`/admin/master-data/program/create?id=${d.id}`}
                  className="flex-1"
                >
                  <button className="w-full flex items-center justify-center gap-1.5 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-600 transition-colors">
                    <PenBox size={14} strokeWidth={2.25} />
                    Edit
                  </button>
                </Link>

                <button
                  onClick={() => setDeleteTarget({ id: d.id, name: d.name })}
                  className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-medium text-red-600 transition-colors"
                >
                  <Trash2 size={14} strokeWidth={2.25} />
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block overflow-x-auto -mx-2">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b text-left text-gray-600">
            <tr>
              <th className="px-3 py-3 w-12">No</th>
              <th className="px-3 py-3">Nama</th>
              <th className="px-3 py-3">Gambar</th>
              <th className="px-3 py-3 w-32">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TableRowsSkeleton cols={4} />
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">
                  Data kosong
                </td>
              </tr>
            ) : (
              filtered.map((d, i) => (
                <tr
                  key={d.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-3 text-gray-500">{i + 1}</td>

                  <td className="px-3 py-3 font-medium text-gray-800">
                    {d.name}
                  </td>

                  <td className="px-3 py-3">
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                      <Image
                        src={d.image || "/no-image.png"}
                        alt={d.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/master-data/program/${d.id}/edit`}>
                        <button className="p-1.5 md:p-2 bg-gray-200 rounded-md md:rounded-lg">
                          <PenBox
                            size={14}
                            className="md:w-4 md:h-4"
                            strokeWidth={2.5}
                          />
                        </button>
                      </Link>

                      <button
                        onClick={() =>
                          setDeleteTarget({ id: d.id, name: d.name })
                        }
                        className="p-1.5 rounded-md bg-gray-100 hover:bg-red-100 transition group"
                      >
                        <Trash2
                          size={14}
                          className="md:w-4 md:h-4 text-gray-600 group-hover:text-red-600"
                          strokeWidth={2.5}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => setDeleteTarget(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>

            <h3 className="text-base font-semibold text-gray-900 mb-1.5">
              Hapus kategori ini?
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Kamu akan menghapus{" "}
              <span className="font-medium text-gray-700">
                &quot;{deleteTarget.name}&quot;
              </span>
              . Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-2.5 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-medium text-white transition-colors disabled:opacity-50"
              >
                <Busy loading={deleting} text="Menghapus...">Ya, Hapus</Busy>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
