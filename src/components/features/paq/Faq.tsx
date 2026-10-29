"use client";

import Navbar from "../../landing/Navbar";
import Footer from "../../landing/Footer";
import { useState } from "react";
import { ChevronDown, HelpCircle, Mail } from "lucide-react";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "Apa itu ToeflPrep?",
    a: "ToeflPrep adalah platform all-in-one untuk persiapan TOEFL yang menyediakan latihan soal, simulasi real test, analisis performa, dan materi berkualitas untuk membantu kamu mencapai skor TOEFL impian.",
  },
  {
    q: "Apakah soal di ToeflPrep terbaru dan sesuai standar TOEFL?",
    a: "Ya, semua soal disusun berdasarkan standar TOEFL terbaru.",
  },
  {
    q: "Apakah ada simulasi TOEFL yang menyerupai ujian asli?",
    a: "Tersedia simulasi dengan format dan waktu seperti ujian TOEFL asli.",
  },
  {
    q: "Bagaimana cara melacak perkembangan skor saya?",
    a: "Kamu bisa melihat progress melalui dashboard analitik yang tersedia.",
  },
  {
    q: "Apakah ToeflPrep bisa diakses di semua perangkat?",
    a: "Ya, bisa diakses di desktop, tablet, dan mobile.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <Navbar />

      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-blue-600 text-sm font-semibold mb-2">FAQ</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Pertanyaan yang Sering Diajukan
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Temukan jawaban untuk pertanyaan umum tentang ToeflPrep
            </p>
          </motion.div>

          {/* CONTENT */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* LEFT CARD */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-50 border border-blue-200 mb-4"
              >
                <Mail className="text-blue-600 w-6 h-6" />
              </motion.div>

              <h3 className="font-semibold text-gray-800 mb-2">
                Masih punya pertanyaan?
              </h3>

              <p className="text-sm text-gray-500 mb-4">
                Tim support kami siap membantu kamu kapan pun dibutuhkan.
              </p>

              <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-all hover:shadow-md hover:shadow-blue-600/20 hover:-translate-y-0.5">
                Hubungi Kami
              </button>
            </motion.div>

            {/* RIGHT FAQ */}
            <div className="md:col-span-2 space-y-3">
              {faqs.map((item, i) => {
                const isOpen = open === i;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
                    className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-colors duration-200 ${
                      isOpen ? "border-blue-200" : "hover:border-gray-200"
                    }`}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        {/* ICON */}
                        <div
                          className={`w-7 h-7 flex items-center justify-center rounded-full border transition-colors duration-200 ${
                            isOpen
                              ? "border-blue-300 bg-blue-100"
                              : "border-blue-200 bg-blue-50"
                          }`}
                        >
                          <HelpCircle className="w-4 h-4 text-blue-600" />
                        </div>

                        <span className="text-sm md:text-base font-medium text-gray-800">
                          {item.q}
                        </span>
                      </div>

                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="shrink-0"
                      >
                        <ChevronDown
                          className={`w-5 h-5 ${
                            isOpen ? "text-blue-600" : "text-gray-500"
                          }`}
                        />
                      </motion.div>
                    </button>

                    <motion.div
                      initial={false}
                      animate={{
                        height: isOpen ? "auto" : 0,
                        opacity: isOpen ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={false}
                        animate={{ y: isOpen ? 0 : -8 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="text-sm text-gray-500 pl-10 pr-4 pb-4"
                      >
                        {item.a}
                      </motion.p>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}