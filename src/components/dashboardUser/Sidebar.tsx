"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Bell,
  BookOpen,
  Archive,
  User,
  ArrowLeftRight,
  ArrowLeftFromLine,
  TimerIcon,
  Crown,
} from "lucide-react";

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [isMember, setIsMember] = useState<boolean | null>(null);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => setIsMember(data.isMember ?? false))
      .catch(() => setIsMember(false));
  }, []);

  return (
    <>
      {/* OVERLAY */}
      <div
        className={`md:hidden fixed inset-0 bg-black/40 z-30 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-40 h-[100dvh] w-64 bg-white border-r
        transform transition-transform duration-200
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="h-full flex flex-col px-4 py-5">

          {/* HEADER — logo */}
          <div className="pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <Link href="/">
                <Image
                  src="/images/logo.png"
                  alt="logo"
                  width={110}
                  height={110}
                />
              </Link>

              <button
                onClick={onClose}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeftFromLine className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* MEMBER BADGE — di bawah border logo */}
          <div className="py-3 border-gray-100">
            {isMember === null ? (
              <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
            ) : isMember ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                <Crown className="w-3 h-3" />
                Member
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-medium text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                Non-Member
              </span>
            )}
          </div>

          {/* NAV */}
          <nav className="flex-1 mt-4 space-y-0.5 text-sm overflow-y-auto">
            <NavItem
              href="/user"
              icon={<Home className="w-4 h-4" />}
              label="Dashboard"
              active={isActive("/user")}
            />

            <NavItem
              href="/user/pengumuman"
              icon={<Bell className="w-4 h-4" />}
              label="Pengumuman"
              active={isActive("/user/pengumuman")}
            />

            <NavItem
              href="/user/faq"
              icon={<BookOpen className="w-4 h-4" />}
              label="FAQ"
              active={isActive("/user/faq")}
            />

            <div className="text-[10px] font-medium text-gray-400 uppercase px-3 pt-5 pb-1">
              Try Out
            </div>

            <NavItem
              href="/user/tryout"
              icon={<TimerIcon className="w-4 h-4" />}
              label="Try Out"
              active={isActive("/user/tryout")}
            />

            <NavItem
              href="/user/riwayat"
              icon={<Archive className="w-4 h-4" />}
              label="Riwayat Try Out"
              active={isActive("/user/riwayat")}
            />

            <div className="text-[10px] font-medium text-gray-400 uppercase px-3 pt-5 pb-1">
              Transaksi
            </div>

            <NavItem
              href="/user/riwayatTransaksi"
              icon={<ArrowLeftRight className="w-4 h-4" />}
              label="Riwayat Transaksi"
              active={isActive("/user/riwayatTransaksi")}
            />

            <div className="text-[10px] font-medium text-gray-400 uppercase px-3 pt-5 pb-1">
              Akun
            </div>

            <NavItem
              href="/user/profile"
              icon={<User className="w-4 h-4" />}
              label="Profil"
              active={isActive("/user/profile")}
            />
          </nav>

          {/* FOOTER */}
          <div className="text-xs text-gray-400 px-3 pt-4 border-t border-gray-100 mt-2">
            © {new Date().getFullYear()} TryTOFL
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
      ${
        active
          ? "bg-blue-50 text-blue-600"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <span className={active ? "text-blue-600" : "text-gray-400"}>{icon}</span>
      <span className={`text-sm ${active ? "font-semibold" : "font-medium"}`}>
        {label}
      </span>
    </Link>
  );
}