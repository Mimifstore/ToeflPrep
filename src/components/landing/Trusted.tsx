"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const logos = [
  { src: "/images/logo1.png", name: "Universitas Indonesia" },
  { src: "/images/logo2.png", name: "Institut Teknologi Bandung" },
  { src: "/images/logo3.png", name: "Universitas Gadjah Mada" },
  { src: "/images/logo4.png", name: "Binus University" },
  { src: "/images/logo5.png", name: "Universitas Airlangga" },
];

export default function Trusted() {
  return (
    <section className="w-full -mt-10 md:-mt-16 relative z-10">
      <div className="px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-6 md:px-6 md:py-7"
        >
          {/* TITLE */}
          <p className="text-center text-xs md:text-sm font-medium text-gray-500 mb-5">
            Dipercaya oleh ribuan pelajar dan{" "}
            <span className="font-semibold text-gray-700">500+ institusi</span>
          </p>

          {/* MARQUEE */}
          <div className="relative overflow-hidden">
            {/* fade edges */}
            <div className="absolute left-0 top-0 h-full w-12 md:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-12 md:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <motion.div
              className="flex gap-10 md:gap-16 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              {/* duplicate list twice for seamless loop */}
              {[...logos, ...logos].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 shrink-0 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                >
                  <div className="relative w-7 h-7 md:w-9 md:h-9 flex-shrink-0">
                    <Image
                      src={item.src}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                    {item.name}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}