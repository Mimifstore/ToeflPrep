"use client";
import { useEffect, useState } from "react";

export default function AnnouncementTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/announcement?limit=5")
      .then((res) => res.json())
      .then((res) => setData(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md">
      <h3 className="font-semibold text-gray-800 mb-4">Pengumuman</h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">
          Belum ada pengumuman
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {data.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 py-3 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {a.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(a.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}