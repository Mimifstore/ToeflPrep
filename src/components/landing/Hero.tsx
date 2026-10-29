"use client";

import Image from "next/image";
import { CheckCircle, BarChart3, Shield, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: CheckCircle,
    text: "Materi sesuai standar ETS terbaru",
  },
  {
    icon: BarChart3,
    text: "Analisis performa & rekomendasi belajar",
  },
  {
    icon: Shield,
    text: "Aman & nyaman digunakan",
  },
];

export default function Hero() {
  return (
    <section className="relative w-full pt-10 pb-16 md:pt-14 md:pb-24 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Decorative background blobs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative px-4 md:px-6 lg:px-20 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-5"
        >
          {/* BADGE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium w-fit border border-blue-100"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Platform TOEFL All-in-One
          </motion.div>

          {/* TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-[1.15] text-gray-900 tracking-tight"
          >
            Raih Skor TOEFL{" "}
            <span className="relative">
              <span className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                Impianmu, Lebih Cepat
              </span>
            </span>
          </motion.h1>

          {/* DESC */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 text-sm md:text-base max-w-prose leading-relaxed"
          >
            Latihan soal lengkap, simulasi real test, dan analisis performa
            untuk membantumu mencapai target skor TOEFL.
          </motion.p>

          {/* BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <button className="group bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25 inline-flex items-center gap-2">
              Mulai Latihan Gratis
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button className="border border-gray-200 text-gray-900 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-100 hover:border-gray-300 transition-all">
              Coba Simulasi TOEFL
            </button>
          </motion.div>

          {/* FEATURES MINI */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-5"
          >
            {features.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 + i * 0.08 }}
                  className="flex items-start gap-2.5 group"
                >
                  <div className="bg-blue-50 p-2 rounded-lg shrink-0 transition-colors group-hover:bg-blue-100">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 leading-snug">
                    {item.text}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="w-full"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-2xl border border-gray-100 shadow-2xl shadow-blue-900/10 p-2 bg-white"
          >
            <Image
              src="/tryout/im1.png"
              alt="dashboard preview"
              width={1200}
              height={700}
              priority
              className="w-full h-auto rounded-xl"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}