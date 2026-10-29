"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/Ui/Card";
import Link from "next/link";
import Image from "next/image";
import { Home, ChevronRight, ArrowRight } from "lucide-react";

type ProgramType = {
  id: string;
  name: string;
  image: string;
  description?: string;
};

export default function TryoutTable() {
  const [data, setData] = useState<ProgramType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/program");
      const result = await res.json();

      setData(result || []);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 flex-wrap">
        <span className="text-lg font-semibold text-gray-800">Try Out</span>

        <span className="flex items-center gap-2 text-gray-400">
          <ChevronRight className="w-4 h-4" />
          <Link
            href="/user/dashboard"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-700 font-medium">Kategori</span>
        </span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
          Pilih kategori sesuai minatmu
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Mulai latihan dan tryout berdasarkan kategori yang ingin kamu kuasai.
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl animate-pulse"
            >
              <div className="p-3">
                <div className="w-full h-40 bg-gray-100 rounded-xl" />
              </div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-100 rounded w-32" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-9 bg-gray-100 rounded w-28 mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-400 text-sm">
          Data kategori belum tersedia
        </div>
      ) : (
        /* Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-md hover:shadow-gray-200/60 transition-all duration-200 rounded-2xl"
            >
              {/* Image */}
              <div className="p-3">
                <Image
                  src={item.image || "/no-image.png"}
                  alt={item.name}
                  width={500}
                  height={300}
                  className="w-full h-40 object-cover rounded-xl bg-gray-50"
                />
              </div>

              {/* Content */}
              <CardContent className="p-4 pt-0">
                <div className="border-b border-gray-100 pb-4 min-h-[110px]">
                  <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                    {item.name}
                  </h3>

                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.description ||
                      "Pelajari dan pahami materi yang tersedia untuk meningkatkan kemampuan dan hasil try out Anda."}
                  </p>
                </div>

                <div className="pt-4">
                  <Link
                    href={`/user/tryout/${item.id}`}
                    className="group inline-flex items-center justify-center gap-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-blue-400 hover:bg-blue-100 hover:text-blue-600"
                  >
                    Selengkapnya
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
