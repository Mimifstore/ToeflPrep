"use client";

import { logoutAction } from "./navbar.actions";
import type { Session } from "next-auth";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Ui/Button";
import { Menu, X } from "lucide-react";

interface NavbarClientProps {
  session: Session | null;
}

export default function NavbarClient({ session }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-blue-700 sticky top-0 z-50 md:static transition-all duration-300">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="logo"
            width={150}
            height={150}
            className="h-8 md:h-10 w-auto cursor-pointer hover:opacity-90 transition"
          />
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-4 md:gap-6 text-white text-sm md:text-base">
        <Link href="/" className="hover:underline">
          Beranda
        </Link>
        <Link href="/user/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link href="/caraDaftar" className="hover:underline">
          Cara Daftar
        </Link>
        <Link href="/features" className="hover:underline">
          Fitur
        </Link>
        <Link href="/faq" className="hover:underline">
          FAQ
        </Link>

        {session ? (
          <form action={logoutAction}>
            <Button
              variant="secondary"
              className="bg-white text-blue-700 font-semibold hover:bg-blue-100 transition"
            >
              Logout
            </Button>
          </form>
        ) : (
          <Link href="/login">
            <Button
              variant="secondary"
              className="bg-white text-blue-700 font-semibold hover:bg-blue-100 transition"
            >
              Masuk
            </Button>
          </Link>
        )}
      </div>

      <button
        className="md:hidden text-white transition-transform duration-200 active:scale-90"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`absolute top-full left-0 w-full bg-blue-700/90 flex flex-col items-center gap-4 py-4 text-white text-sm md:hidden backdrop-blur-md shadow-md transition-all duration-500 ease-in-out ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <Link href="/" onClick={() => setIsOpen(false)}>
          Beranda
        </Link>
        <Link href="/caraDaftar" onClick={() => setIsOpen(false)}>
          Cara Daftar
        </Link>
        <Link href="/features" onClick={() => setIsOpen(false)}>
          Fitur
        </Link>
        <Link href="/faq" onClick={() => setIsOpen(false)}>
          FAQ
        </Link>

        {session ? (
          <form action={logoutAction}>
            <Button variant="secondary">Logout</Button>
          </form>
        ) : (
          <Link href="/login">
            <Button variant="secondary">Masuk</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}