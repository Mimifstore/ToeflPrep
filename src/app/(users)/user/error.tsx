"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function UserError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("USER ERROR:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Ups, Ada Kesalahan
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Halaman gagal dimuat. Silakan coba lagi dalam beberapa saat.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>

          <Link
            href="/user"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium transition"
          >
            Ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
