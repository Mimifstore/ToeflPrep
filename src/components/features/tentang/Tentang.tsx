"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Image from "next/image";
import { motion } from "framer-motion";

const pillars = [
  {
    label: "Misi",
    title: "Belajar TOEFL yang bisa diakses semua orang",
    desc: "Menyediakan platform belajar TOEFL berkualitas tinggi yang mudah diakses oleh semua pelajar di Indonesia.",
  },
  {
    label: "Visi",
    title: "Jadi rujukan utama persiapan TOEFL",
    desc: "Menjadi platform persiapan TOEFL terdepan yang membantu jutaan pelajar meraih skor impian.",
  },
  {
    label: "Komitmen",
    title: "Materi terkini, hasil yang terukur",
    desc: "Memberikan pengalaman belajar terbaik dengan materi terkini, latihan efektif, dan dukungan penuh.",
  },
  {
    label: "Untuk siapa",
    title: "Pelajar, mahasiswa, dan profesional",
    desc: "Untuk siapa pun yang ingin meraih skor TOEFL terbaik untuk masa depan akademik dan karier.",
  },
];

const stats = [
  { value: "10.000+", label: "Siswa terdaftar" },
  { value: "1.000+", label: "Latihan soal" },
  { value: "50+", label: "Simulasi TOEFL" },
  { value: "4.9/5", label: "Rating pengguna" },
];

export default function TentangPage() {
  return (
    <>
      <Navbar />

    {/* HERO - full text, no image */}
<section className="relative bg-gray-50 py-20 md:py-32 overflow-hidden">
  <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
  <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

  <div className="relative max-w-3xl mx-auto px-4 md:px-6 text-center">
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full mb-6"
    >
      Tentang kami
    </motion.div>

    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight"
    >
      Platform belajar TOEFL yang siap membantumu{" "}
      <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
        meraih skor impian
      </span>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="text-gray-500 text-sm md:text-lg mt-5 leading-relaxed max-w-xl mx-auto"
    >
      TOEFLPrep hadir sebagai platform belajar TOEFL all-in-one yang
      lengkap, efektif, dan fleksibel. Kami percaya setiap usaha yang
      konsisten akan membawamu lebih dekat ke tujuanmu.
    </motion.p>

    {/* STAT CARD */}
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="mt-10 inline-flex items-center gap-4 rounded-2xl bg-white border border-gray-100 px-6 py-4 shadow-sm shadow-blue-900/5"
    >
      <div className="text-left">
        <p className="text-2xl font-bold text-gray-900">523</p>
        <p className="text-xs text-gray-400 mt-0.5">Skor rata-rata user</p>
      </div>
      <div className="h-8 w-px bg-gray-100" />
      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
        Good
      </span>
    </motion.div>
  </div>
</section>

      {/* PILLARS - alternating editorial rows */}
      {/* PILLARS - large index numbers as visual anchor */}
      <section className="bg-white py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-10 md:space-y-0">
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={`flex gap-6 md:gap-10 items-start py-8 md:py-10 ${
                i !== 0 ? "border-t border-gray-100" : ""
              }`}
            >
              {/* INDEX NUMBER */}
              <span className="text-4xl md:text-6xl font-bold text-gray-100 leading-none shrink-0 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* CONTENT */}
              <div className="space-y-2 pt-1 md:pt-3">
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  {p.label}
                </span>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
                  {p.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* STATS - dark contrast section */}
      <section className="bg-blue-950 py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              Dipercaya oleh ribuan pelajar
            </h2>
            <p className="text-sm text-blue-200 mt-2">
              Angka yang terus bertambah setiap harinya
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {s.value}
                </p>
                <p className="text-xs md:text-sm text-blue-200 mt-1">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
