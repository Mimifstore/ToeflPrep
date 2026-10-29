"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function AnnountCementDetail({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/announcement/${id}`)
      .then((res) => res.json())
      .then(setData);
  }, [id]);

  if (!data) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 🔥 HEADER */}
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

        {/* 🔥 CONTENT */}
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