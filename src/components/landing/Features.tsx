"use client";

import { Headphones, BookOpen, Mic, PenTool, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Headphones,
    title: "Listening Practice",
    desc: "Latihan listening dengan berbagai topik akademik dan percakapan sehari-hari.",
    bg: "bg-blue-50",
    iconBg: "bg-blue-600",
    text: "text-blue-700",
    border: "hover:border-blue-200",
  },
  {
    icon: BookOpen,
    title: "Reading Test",
    desc: "Tingkatkan kemampuan reading dengan passage berkualitas tinggi dan beragam tema.",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-600",
    text: "text-emerald-700",
    border: "hover:border-emerald-200",
  },
  {
    icon: Mic,
    title: "Speaking Evaluation",
    desc: "Rekam jawaban speaking-mu dan dapatkan analisis AI dan feedback instan.",
    bg: "bg-violet-50",
    iconBg: "bg-violet-600",
    text: "text-violet-700",
    border: "hover:border-violet-200",
  },
  {
    icon: PenTool,
    title: "Writing Check",
    desc: "Cek grammar, struktur, dan dapatkan skor estimasi untuk writing task kamu.",
    bg: "bg-amber-50",
    iconBg: "bg-amber-600",
    text: "text-amber-700",
    border: "hover:border-amber-200",
  },
];

export default function Features() {
  return (
    <section className="w-full py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-10">
        {/* HEADER */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <p className="text-sm text-blue-600 font-medium tracking-wide uppercase">
            Fitur Unggulan
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Semua yang Kamu Butuhkan untuk Skor Terbaik
          </h2>

          <p className="text-sm text-gray-500">
            Fitur lengkap yang dirancang untuk membantumu menguasai setiap
            section TOEFL
          </p>
        </div>

        {/* CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
                className={`group relative overflow-hidden border border-gray-100 rounded-xl p-5 ${f.bg} transition-all duration-300 ${f.border} hover:shadow-md hover:-translate-y-1`}
              >
                {/* ICON */}
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-lg mb-4 ${f.iconBg} text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* TITLE */}
                <h3 className="text-sm font-semibold text-gray-800 mb-1.5">
                  {f.title}
                </h3>

                {/* DESC */}
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {f.desc}
                </p>

                {/* LINK */}
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${f.text} cursor-pointer`}>
                  Mulai Latihan
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}