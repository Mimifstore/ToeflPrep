"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AnnouncementDetailSkeleton } from "@/components/dashboardUser/skeletons";

export function AnnountCementDetail({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gagal atau tidak ditemukan sama-sama berakhir dengan data null.
    fetch(`/api/announcement/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (!data) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        {loading ? (
          <AnnouncementDetailSkeleton />
        ) : (
          <div className="mx-auto max-w-4xl py-16 text-center text-sm text-gray-400">
            <p>Pengumuman tidak ditemukan.</p>
            <button
              onClick={() => router.back()}
              className="mt-3 inline-flex items-center gap-1 text-gray-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-base md:text-lg font-semibold text-gray-800 leading-snug">
              {data.title}
            </h1>

            <p className="text-xs text-gray-400 mt-1">
              {new Date(data.createdAt).toLocaleString("id-ID")}
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
        </div>

        {/* CONTENT */}
        <div className="bg-white border rounded-2xl shadow-sm p-4 md:p-6">
          <div
            className="
              prose max-w-none break-words [&_*]:max-w-full [&_*]:break-words
              text-sm md:text-[15px]
              text-gray-700
              leading-relaxed

              prose-headings:text-gray-800
              prose-p:text-gray-700
              prose-li:text-gray-700
              prose-strong:text-gray-800
            "
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </div>
      </div>
    </div>
  );
}