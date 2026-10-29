"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Instagram, Linkedin, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-14">
        {/* TOP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* BRAND */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <Image src="/images/logo.png" alt="logo" width={120} height={40} />

            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Platform latihan TOEFL modern dengan simulasi real test,
              analisis performa, dan pembelajaran terarah.
            </p>

            {/* SOCIAL */}
            <div className="flex items-center gap-2.5 pt-1">
              <Link
                href="#"
                aria-label="Instagram"
                className="p-2 rounded-md border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200"
              >
                <Instagram className="w-4 h-4" />
              </Link>

              <Link
                href="#"
                aria-label="LinkedIn"
                className="p-2 rounded-md border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200"
              >
                <Linkedin className="w-4 h-4" />
              </Link>

              <Link
                href="#"
                aria-label="Facebook"
                className="p-2 rounded-md border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200"
              >
                <Facebook className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* NAVIGATION */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Navigasi
            </h3>

            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Beranda</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Fitur</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Bantuan
            </h3>

            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Kontak</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Kebijakan Privasi</Link></li>
            </ul>

            
              <a href="mailto:support@trytofl.com"
              className="flex items-center gap-2 mt-4 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>support@trytofl.com</span>
            </a>
          </div>

          {/* CTA MINI */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Mulai Sekarang
            </h3>

            <p className="text-sm text-gray-500">
              Daftar gratis dan mulai latihan TOEFL hari ini.
            </p>

            <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Daftar Gratis
            </button>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="border-t border-gray-100 mt-10 pt-6 flex flex-col-reverse md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} TryTOFL. All rights reserved.</p>

          <div className="flex gap-5">
            <Link href="#" className="hover:text-blue-600 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}