"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="w-full pt-6 pb-12 md:pt-8 md:pb-16 lg:pt-10 lg:pb-20">
      <div className="max-w-full mx-auto px-6 md:px-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative bg-blue-600 text-white rounded-2xl px-6 md:px-10 py-4 md:py-6 overflow-hidden"
        >
          {/* decorative blur shapes */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-400/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/3 w-40 h-40 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

          {/* IMAGE - floating */}
         <motion.div
  animate={{ y: [0, -10, 0] }}
  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
  className="hidden md:block absolute md:pl-32 left-12 -top-10 w-52 h-52 z-10 drop-shadow-[0_8px_24px_rgba(255,255,255,0.25)]"
>
  <Image
    src="/images/book.png"
    alt="CTA Illustration"
    fill
    className="object-contain"
    priority
  />
</motion.div>

          {/* CONTENT */}
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:ml-72">
            {/* TEXT */}
            <div className="max-w-md space-y-2">
              <h2 className="text-lg md:text-2xl font-semibold">
                Siap Mencapai Skor TOEFL Impianmu?
              </h2>

              <p className="text-sm text-blue-100">
                Bergabung sekarang dan dapatkan akses ke semua fitur premium.
                Mulai perjalanan suksesmu hari ini!
              </p>
            </div>

            {/* BUTTON */}
            <div className="flex flex-wrap gap-3 md:pr-8">
              <button className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all">
                Mulai Gratis Sekarang
              </button>

              <button className="border border-white/60 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 hover:border-white transition-all">
                Lihat Paket Premium
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}