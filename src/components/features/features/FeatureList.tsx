"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Listening Practice",
    desc: "Latihan listening dengan berbagai topik akademik dan percakapan sehari-hari.",
    image: "/features/listening.png",
  },
  {
    title: "Reading Test",
    desc: "Tingkatkan kemampuan reading dengan passage berkualitas tinggi.",
    image: "/features/reading.png",
  },
  {
    title: "Speaking Evaluation",
    desc: "Rekam jawaban speaking dan dapatkan analisis AI serta feedback instan.",
    image: "/features/speaking.png",
  },
  {
    title: "Writing Check",
    desc: "Cek grammar, struktur, dan dapatkan estimasi skor writing.",
    image: "/features/writing.png",
  },
];

export default function FeatureList() {
  return (
    <section className="w-full pb-14 md:pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-16 md:space-y-24">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`grid md:grid-cols-2 gap-10 items-center ${
              i % 2 !== 0 ? "md:grid-flow-dense" : ""
            }`}
          >
            {/* IMAGE - placeholder, swap with <Image> later */}
            <div className={`${i % 2 !== 0 ? "md:col-start-2" : ""}`}>
              <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden">
                <Image
                  src={f.image}
                  alt={f.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* TEXT */}
            <div className="space-y-3">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                {f.title}
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed max-w-md">
                {f.desc}
              </p>

              <button className="inline-flex items-center gap-1.5 text-blue-600 text-sm font-medium hover:gap-2.5 transition-all">
                Pelajari Lebih Lanjut
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
