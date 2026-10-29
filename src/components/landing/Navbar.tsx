"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const menus = [
    { name: "Beranda", href: "/" },
    { name: "Fitur", href: "/features" },
    { name: "FAQ", href: "/faq" },
    { name: "Tentang", href: "/tentang" },
  ];

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="px-4 md:px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="logo" width={110} height={110} />
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {menus.map((m) => {
            const isActive = pathname === m.href;

            return (
              <Link
                key={m.name}
                href={m.href}
                className="relative group"
              >
                <span
                  className={`transition-colors ${
                    isActive
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 group-hover:text-blue-600"
                  }`}
                >
                  {m.name}
                </span>

                {/* garis bawah */}
                <span
                  className={`absolute left-0 -bottom-6 h-[2px] bg-blue-600 transition-all duration-300 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* ACTION DESKTOP */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm px-4 py-2 rounded-full border border-gray-300 text-gray-600 hover:border-blue-600 hover:text-blue-600 transition"
          >
            Masuk
          </Link>

          <Link
            href="/register"
            className="text-sm bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition"
          >
            Daftar Gratis
          </Link>
        </div>

        {/* HAMBURGER */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-4 pb-4 space-y-4 pt-3 border-t bg-white">
          {menus.map((m) => {
            const isActive = pathname === m.href;

            return (
              <Link
                key={m.name}
                href={m.href}
                onClick={() => setOpen(false)}
                className={`block text-sm transition-colors ${
                  isActive
                    ? "text-blue-600 font-medium"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {m.name}
              </Link>
            );
          })}

          <div className="pt-3 border-t flex flex-col gap-2">
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-full border border-gray-300 text-gray-600 text-center"
            >
              Masuk
            </Link>

            <Link
              href="/register"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-full text-center"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}