"use client"

import { motion } from "framer-motion"
import { Clock, BarChart3, Brain, Trophy } from "lucide-react"

const features = [
    { icon: Clock, text: "Latihan Soal Berbasis Waktu" },
    { icon: BarChart3, text: "Hasil Otomatis" },
    { icon: Brain, text: "Pembahasan Soal" },
    { icon: Trophy, text: "Riwayat Nilai & Ranking" },
    ]

    export default function Features() {
    return (
        <section className=" from-blue-50 to-white py-10 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            Kenapa Pilih <span className="text-orange-500">TryTOFL?</span>
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((item, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="p-6 bg-color-secondary rounded-2xl shadow-md 
                        flex flex-col items-center text-center
                        transform transition duration-300
                        hover:scale-105 hover:shadow-xl hover:bg-blue-50"
            >
                <div className="bg-blue-100 w-14 h-14 flex items-center justify-center rounded-full transition-colors duration-300 hover:bg-blue-300">
                <item.icon className="w-7 h-7 text-blue-600" />
                </div>
                <p className="mt-4 font-medium text-color-dark">{item.text}</p>
            </motion.div>
            ))}
        </div>
        </section>
    )
}