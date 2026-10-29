import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-10 h-10 text-blue-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-gray-500 mb-8">
          Halaman yang kamu cari tidak ditemukan atau sudah dipindahkan.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition"
        >
          <Home className="w-4 h-4" />
          Kembali ke Awal
        </Link>
      </div>
    </div>
  );
}
