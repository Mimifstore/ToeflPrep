"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import ExamInformation from "./ExamInformation";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  exam: any;
  user: any;
};

export default function ExamDetailPage({ exam, user }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStartExam = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/tryout/start", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ujianId: exam.id,
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();

      router.push(`/user/tryout/session/${data.sessionId}`);
    } catch (error) {
      console.log(error);

      alert("Gagal memulai ujian");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-semibold text-xl">Ujian</span>

          <span className="mx-3 text-2xl">|</span>

          <Link href="/user" className="text-blue-600">
            <Home className="w-4 h-4" />
          </Link>

          <span className="mx-2 text-2xl">›</span>

          <span className="text-gray-700 font-medium">Detail Ujian</span>
        </div>

        <button
          onClick={() => history.back()}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md"
        >
          Kembali
        </button>
      </div>

      {/* CONTENT */}
      <div className="space-y-5">
        {/* INFORMASI */}
        <ExamInformation />

        {/* DESKRIPSI */}
        <div className="border rounded-md overflow-hidden shadow-sm">
          <div className="bg-blue-600 px-4 py-2">
            <h2 className="text-white font-semibold text-sm md:text-base">
              Deskripsi Ujian
            </h2>
          </div>

          <div className="bg-white">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="w-52 px-4 py-3 font-semibold">Email</td>

                  <td className="px-4 py-3">:</td>

                  <td className="px-4 py-3 text-gray-700">{user?.email}</td>
                </tr>

                <tr className="border-b">
                  <td className="px-4 py-3 font-semibold">Nama</td>

                  <td className="px-4 py-3">:</td>

                  <td className="px-4 py-3 text-gray-700">{user?.name}</td>
                </tr>

                <tr className="border-b">
                  <td className="px-4 py-3 font-semibold">Kategori</td>

                  <td className="px-4 py-3">:</td>

                  <td className="px-4 py-3">
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      {exam?.program?.name}
                    </span>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="px-4 py-3 font-semibold">Judul Ujian</td>

                  <td className="px-4 py-3">:</td>

                  <td className="px-4 py-3 text-gray-700">{exam?.title}</td>
                </tr>

                <tr>
                  <td className="px-4 py-3 font-semibold">Durasi</td>

                  <td className="px-4 py-3">:</td>

                  <td className="px-4 py-3 text-gray-700">
                    {exam?.timeType === "SINGLE"
                      ? `${exam.totalTime} Menit`
                      : "Per Section"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* BUTTON */}
            <div className="flex justify-center py-8">
              <button
                onClick={handleStartExam}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-8 py-3 rounded-md text-sm font-medium shadow"
              >
                {loading ? "Memulai..." : "Mulai Kerjakan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
