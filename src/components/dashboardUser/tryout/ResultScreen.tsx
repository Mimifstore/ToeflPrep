"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Props = {
  data: {
    id: string;
    examTitle: string;
    score: number;
    maxScore: number; // 🔥 BARU
    program: string; // 🔥 BARU — "TOEFL" | "TOEIC" | "CUSTOM"
    totalQuestion: number;
    correctAnswer: number;
    wrongAnswer: number;
    categories: any[];
  };
};

export default function ResultScreen({ data }: Props) {
  const router = useRouter();

  // 🔥 FIX: persentase ring sekarang dihitung dari score/maxScore sesuai
  // skala aslinya (TOEFL bisa sampai ~677, TOEIC sampai 990), bukan
  // diasumsikan skala 0-100. Kalau maxScore belum ke-set (0), fallback ke 0
  // biar nggak NaN.
  const scorePercent =
    data.maxScore > 0
      ? Math.min(Math.max((data.score / data.maxScore) * 100, 0), 100)
      : 0;
  const circumference = 2 * Math.PI * 70; // r=70
  const offset = circumference - (scorePercent / 100) * circumference;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <p className="text-sm text-blue-600 font-semibold mb-2">
                Hasil Ujian
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {data.examTitle}
              </h1>
              <p className="text-sm text-gray-500 mt-2 max-w-md">
                Berikut adalah ringkasan performa kamu pada ujian ini. Cek
                detail di bawah untuk melihat penilaian per kategori.
              </p>
            </div>

            {/* SCORE CIRCLE - animated ring */}
            <div className="relative w-40 h-40 shrink-0 mx-auto lg:mx-0">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="10"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl md:text-5xl font-bold text-gray-900">
                    {data.score}
                  </p>
                  {/* 🔥 BARU — tampilkan skala max biar konteksnya jelas, mis. "990" buat TOEIC */}
                  <p className="text-sm text-gray-400">
                    Score {data.maxScore > 0 ? `/ ${data.maxScore}` : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total soal",
              value: data.totalQuestion,
              accent: "text-gray-900",
            },
            {
              label: "Jawaban benar",
              value: data.correctAnswer,
              accent: "text-emerald-600",
            },
            {
              label: "Jawaban salah",
              value: data.wrongAnswer,
              accent: "text-red-500",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className="bg-white border border-gray-100 rounded-2xl p-5"
            >
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <h2 className={`text-3xl font-bold ${s.accent}`}>{s.value}</h2>
            </motion.div>
          ))}
        </div>

        {/* CATEGORY */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8"
        >
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-5">
            Detail penilaian
          </h2>

          {data.categories.length <= 0 ? (
            <div className="text-sm text-gray-400 text-center py-6">
              Belum ada detail kategori.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.categories.map((item: any) => {
                const percent =
                  item.total > 0 ? (item.correct / item.total) * 100 : 0;
                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-sm md:text-base font-semibold text-gray-800">
                          {item.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-400">
                          {item.correct} benar dari {item.total} soal
                        </p>
                      </div>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 shrink-0">
                        {item.score}
                      </p>
                    </div>

                    {/* progress bar */}
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{
                          duration: 0.8,
                          delay: 0.4,
                          ease: "easeOut",
                        }}
                        className="h-full bg-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* BACK BUTTON */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => router.push("/user/tryout")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-semibold transition-colors"
          >
            Kembali ke Daftar Tryout
          </button>
        </div>
      </div>
    </div>
  );
}
