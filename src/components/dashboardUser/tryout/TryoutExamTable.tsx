"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, ChevronRight, ChevronLeft, Crown } from "lucide-react";
import BuyButton from "./BuyButton";
import FreeAccessButton from "./FreeAccessButton";

type UjianType = {
  id: string;
  title: string;
  price: number;
  description?: string;
  program?: {
    id: string;
    name: string;
    image: string;
  };
};

export default function TryoutExamTable({
  programId,
  accessIds,
  isMember = false,
}: {
  programId: string;
  accessIds: string[];
  isMember?: boolean;
}) {
  const [data, setData] = useState<UjianType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const perPage = 4;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/exam?programId=${programId}`);
      const result = await res.json();
      setData(result || []);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(data.length / perPage);
  const paginated = data.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-5 flex-wrap">
        <span className="text-lg font-semibold text-gray-800">Try Out</span>
        <span className="flex items-center gap-2 text-gray-400">
          <ChevronRight className="w-4 h-4" />
          <Link href="/user" className="flex items-center gap-1 text-blue-600 hover:underline">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-700 font-medium">Soal</span>
        </span>
      </div>

      {/* Title */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Pilih soal tryout yang akan kamu kerjakan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pastikan kamu sudah siap sebelum memulai pengerjaan.
          </p>
        </div>

        {/* 🔥 BADGE MEMBER */}
        {isMember && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">
            <Crown className="w-4 h-4" />
            Member - Akses Semua Ujian
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-md overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-100" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-100 rounded w-32" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-8 bg-gray-100 rounded w-24 mx-auto mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-400">
          Belum ada ujian tersedia
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {paginated.map((item) => {
              // 🔥 MEMBER OTOMATIS PUNYA AKSES KE SEMUA UJIAN
              const hasAccess = isMember || accessIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-md overflow-hidden shadow hover:shadow-lg transition relative"
                >
                  {/* 🔥 BADGE MEMBER DI CARD */}
                  {isMember && (
                    <div className="absolute top-2 right-2 z-10 bg-yellow-400 text-white p-1.5 rounded-full shadow">
                      <Crown className="w-3 h-3" />
                    </div>
                  )}

                  <div className="p-3 pb-0">
                    <Image
                      src={item.program?.image || "/no-image.png"}
                      alt={item.title}
                      width={500}
                      height={300}
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>

                  <div className="p-4">
                    <h2 className="font-semibold text-gray-700 text-lg mb-2">{item.title}</h2>
                    <p className="text-sm text-gray-500 leading-relaxed min-h-[48px]">
                      Kerjakan soal sesuai perintah yang ada dalam informasi.
                    </p>

                    <div className="flex justify-center mt-5">
                      {isMember ? (
                        <div className="bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                          Akses Member
                        </div>
                      ) : item.price === 0 ? (
                        <div className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                          Gratis
                        </div>
                      ) : (
                        <div className="bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full">
                          Rp {item.price.toLocaleString("id-ID")}
                        </div>
                      )}
                    </div>

                    <div className="mt-5">
                      {hasAccess ? (
                        <Link
                          href={`/user/tryout/ujian/${item.id}`}
                          className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white transition rounded-md py-2 text-sm font-medium"
                        >
                          Kerjakan Ujian
                        </Link>
                      ) : item.price === 0 ? (
                        <FreeAccessButton
                          ujianId={item.id}
                          className="w-full block text-center bg-green-600 hover:bg-green-700 text-white transition rounded-md py-2 text-sm font-medium"
                        >
                          Ambil Akses Gratis
                        </FreeAccessButton>
                      ) : (
                        <BuyButton
                          ujianId={item.id}
                          className="w-full block text-center border border-red-300 text-red-400 hover:bg-red-500 hover:text-white transition rounded-md py-2 text-sm font-medium"
                        >
                          Beli Paket Try Out
                        </BuyButton>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium">{page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages || totalPages === 0}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}