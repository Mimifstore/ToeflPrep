"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  Bell,
  BookOpen,
  ArrowLeftRight,
  ArrowLeftFromLine,
  AppWindow,
  PenBoxIcon,
  ChevronDown,
  ChevronRight,
  Users,
  User,
  Tags,
  ListChecks,
  FileText,
  Monitor,
  BarChart2,
} from "lucide-react";

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const [openMaster, setOpenMaster] = useState(false);

  // 🔥 AUTO OPEN MASTER DATA IF ON CHILD PAGE
  useEffect(() => {
    if (pathname.includes("/master-data")) {
      setOpenMaster(true);
    }
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  const isActiveGroup = (path: string) => pathname.startsWith(path);

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
        className={`fixed left-0 top-0 z-40 h-[100dvh] w-64 bg-white border-r shadow-xl
        transform transition-transform duration-200
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="h-full flex flex-col p-4">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
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
              <ArrowLeftFromLine className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* NAV */}
          <nav className="flex-1 space-y-1 text-sm font-medium">
            {/* DASHBOARD */}
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition
              ${
                isActive("/admin")
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <Home className="w-5 h-5" />
              Dashboard
            </Link>

            <div className="text-[11px] text-gray-400 uppercase px-3 pt-6">
              Navigation
            </div>

            {/* MASTER DATA */}
            <div>
              <button
                onClick={() => setOpenMaster(!openMaster)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition
                ${
                  isActiveGroup("/admin/master-data")
                    ? "bg-blue-100 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <span className="flex items-center gap-3">
                  <AppWindow className="w-5 h-5" />
                  Master Data
                </span>

                {openMaster ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>

              {/* SUB MENU */}
              <div
                className={`ml-6 mt-2 space-y-1 overflow-hidden transition-all duration-200 ${
                  openMaster ? "max-h-96" : "max-h-0"
                }`}
              >
                <SubItem
                  href="/admin/master-data/users"
                  icon={<Users className="w-4 h-4" />}
                  label="User Account"
                  active={isActive("/admin/master-data/users")}
                />

                <SubItem
                  href="/admin/master-data/siswa"
                  icon={<User className="w-4 h-4" />}
                  label="Siswa"
                  active={isActive("/admin/master-data/siswa")}
                />

                <SubItem
                  href="/admin/master-data/program"
                  icon={<Tags className="w-4 h-4" />}
                  label="Kategori"
                  active={isActive("/admin/master-data/program")}
                />

                <SubItem
                  href="/admin/master-data/kategori-penilaian"
                  icon={<ListChecks className="w-4 h-4" />}
                  label="Kategori Penilaian"
                  active={isActive("/admin/master-data/kategori-penilaian")}
                />

                <SubItem
                  href="/admin/master-data/soal"
                  icon={<FileText className="w-4 h-4" />}
                  label="Soal"
                  active={isActive("/admin/master-data/soal")}
                />
              </div>
            </div>

            {/* MENU LAIN */}
            <NavItem
              href="/admin/ujian"
              icon={<PenBoxIcon className="w-5 h-5" />}
              label="Ujian"
              active={isActive("/admin/ujian")}
            />

            <NavItem
              href="/admin/pengumuman"
              icon={<Bell className="w-5 h-5" />}
              label="Pengumuman"
              active={isActive("/admin/pengumuman")}
            />

            <NavItem
              href="/admin/faq"
              icon={<BookOpen className="w-5 h-5" />}
              label="FAQ"
              active={isActive("/admin/faq")}
            />
            <NavItem
              href="/admin/monitoring"
              icon={<Monitor className="w-5 h-5" />}
              label="Monitoring"
              active={isActive("/admin/monitoring")}
            />
            <NavItem
              href="/admin/rekap"
              icon={<BarChart2 className="w-5 h-5" />}
              label="Rekap Nilai"
              active={isActiveGroup("/admin/rekap")}
            />

            <div className="text-[11px] text-gray-400 uppercase px-3 pt-6">
              Transaksi
            </div>

            <NavItem
              href="/admin/transaksi"
              icon={<ArrowLeftRight className="w-5 h-5" />}
              label="Transaksi"
              active={isActive("/admin/transaksi")}
            />
          </nav>

          {/* FOOTER */}
          <div className="text-xs font-semibold text-gray-400 px-3 pt-4 border-t mt-4">
            © {new Date().getFullYear()} ToeflPrep
          </div>
        </div>
      </aside>
    </>
  );
}

/* 🔥 MAIN ITEM */
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
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition
      ${
        active
          ? "bg-blue-100 text-blue-600 font-semibold"
          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      <span>{icon}</span>
      {label}
    </Link>
  );
}

/* 🔥 SUB ITEM */
function SubItem({
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
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
      ${
        active
          ? "bg-blue-50 text-blue-600 font-semibold"
          : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      <span>{icon}</span>
      {label}
    </Link>
  );
}
