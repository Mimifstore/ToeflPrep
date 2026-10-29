"use client";

import Image from "next/image";
import Button from "@/components/Ui/Button";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="flex flex-col md:flex-row items-center justify-between px-8 py-12 bg-blue-700 rounded-2xl mt-6 mx-4">

            <div className="max-w-lg space-y-6">
                <h1 className="text-4xl font-bold leading-tight">
                Latihan TOEFL Online, Mudah dan Gratis
                </h1>
                <p className="text-blue-100">
                Coba soal-soal TOEFL terbaru, lihat hasil secara instan, dan tingkatkan skormu.
                </p>
                <div className="flex gap-4">
                <Button variant="primary" className="px-6 py-3">Start For Free</Button>
                <Link href="/register">
                    <Button 
                        variant="secondary" 
                        className="px-6 py-3"
                        >
                            Register
                    </Button>
                </Link>
                </div>
            </div>

            <div className="mt-8 md:mt-0">
                <Image src="/fictures.png" alt="Hero" width={300} height={300} />
            </div>
        </section>
    );
}
