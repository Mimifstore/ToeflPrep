"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 🔥 Log error ke console (nanti bisa diganti ke error tracking service)
    console.error("GLOBAL ERROR:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Terjadi Kesalahan
        </h1>
        <p className="text-gray-500 mb-8">
          Maaf, terjadi masalah saat memuat halaman ini. Silakan coba lagi atau
          kembali ke halaman utama.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition"
          >
            <Home className="w-4 h-4" />
            Kembali ke Awal
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left bg-red-50 border border-red-200 rounded-xl p-4">
            <summary className="text-sm font-medium text-red-600 cursor-pointer">
              Detail Error (Development Only)
            </summary>
            <pre className="mt-2 text-xs text-red-500 overflow-auto whitespace-pre-wrap">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
