"use client";

import { FileText, Pencil, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: FileText,
    title: "Pilih Latihan atau Simulasi",
    desc: "Pilih jenis latihan atau simulasi TOEFL sesuai kebutuhanmu.",
    activeBg: "#2563EB", // blue-600
    activeBorder: "#2563EB",
  },
  {
    icon: Pencil,
    title: "Kerjakan & Pelajari",
    desc: "Kerjakan soal, pelajari materi, dan pahami pembahasannya.",
    activeBg: "#0F766E", // teal-700
    activeBorder: "#0F766E",
  },
  {
    icon: BarChart3,
    title: "Analisis dan Tingkatkan",
    desc: "Lihat analisis performa dan fokus pada area yang perlu ditingkatkan.",
    activeBg: "#7C3AED", // violet-600
    activeBorder: "#7C3AED",
  },
];

function StepIcon({ step, delay }: { step: typeof steps[number]; delay: number }) {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ backgroundColor: "#F1F5F9", borderColor: "#E2E8F0", color: "#94A3B8" }}
      whileInView={{
        backgroundColor: step.activeBg,
        borderColor: step.activeBorder,
        color: "#FFFFFF",
      }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4, delay }}
      className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl border-2 z-10 bg-white"
    >
      <Icon className="w-6 h-6 md:w-7 md:h-7" />
    </motion.div>
  );
}

export default function Steps() {
  return (
    <section className="w-full py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-12">
        {/* HEADER */}
        <div className="text-center space-y-2">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">
            Cara Kerja
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            3 Langkah Mudah untuk{" "}
            <span className="text-blue-600">Meningkatkan Skor TOEFL</span>
          </h2>
        </div>

        {/* STEPS */}
        <div className="relative grid md:grid-cols-3 gap-10 md:gap-6">
          {/* track line */}
          <div className="hidden md:block absolute top-7 left-[16.66%] right-[16.66%] h-[2px] bg-gray-100" />

          {/* progress line - runs once on scroll into view */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            style={{ originX: 0 }}
            className="hidden md:block absolute top-7 left-[16.66%] right-[16.66%] h-[2px] bg-gradient-to-r from-blue-600 via-teal-600 to-violet-600"
          />

          {steps.map((step, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center text-center space-y-4"
            >
              {/* ICON - color changes as line passes */}
              <StepIcon step={step} delay={i * 0.45} />

              {/* NUMBER BADGE */}
              <div className="absolute top-0 left-1/2 translate-x-3 -translate-y-1 w-6 h-6 flex items-center justify-center rounded-full bg-white border-2 border-gray-100 text-gray-500 text-[11px] font-semibold">
                {i + 1}
              </div>

              {/* TEXT */}
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-gray-800">
                  {step.title}
                </h3>

                <p className="text-xs text-gray-500 max-w-[220px] leading-relaxed mx-auto">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}