"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import {
  CENTER_WHEN_COLLAPSED,
  HIDE_WHEN_COLLAPSED,
  SHOW_WHEN_COLLAPSED,
} from "@/components/dashboardAdmin/sidebar/styles";
import { USER_NAV, type UserNavBadge } from "@/constants/user-navigation";
import { useActiveExam } from "@/hooks/useActiveExam";
import { useNewAnnouncements } from "@/hooks/useNewAnnouncements";
import { findActiveNavHref } from "@/libs/user-nav";
import ActiveExamLink from "./sidebar/ActiveExamLink";
import SidebarLink from "./sidebar/SidebarLink";

type SidebarProps = {
  /** Mobile: drawer lagi kebuka atau nggak. */
  isOpen: boolean;
  onClose: () => void;
  /** Desktop: true = cuma icon. */
  collapsed: boolean;
};

export default function Sidebar({ isOpen, onClose, collapsed }: SidebarProps) {
  const pathname = usePathname();
  const activeHref = findActiveNavHref(pathname, USER_NAV);
  const activeExam = useActiveExam(pathname);
  const newAnnouncements = useNewAnnouncements(pathname);

  const badgeCounts: Record<UserNavBadge, number> = {
    announcements: newAnnouncements,
  };

  return (
    <>
      {/* OVERLAY (mobile) */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* SIDEBAR */}
      <aside
        id="user-sidebar"
        aria-label="Sidebar siswa"
        data-collapsed={collapsed}
        className={`group/sidebar fixed left-0 top-0 z-40 h-[100dvh] w-64 border-r bg-white
        transition-[transform,width] duration-200
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:data-[collapsed=true]:w-16`}
      >
        <div className="flex h-full flex-col p-3 group-data-[collapsed=true]/sidebar:md:p-2">
          {/* HEADER */}
          <div
            className={`mb-3 flex h-12 shrink-0 items-center justify-between border-b pb-3 ${CENTER_WHEN_COLLAPSED}`}
          >
            <Link href="/" aria-label="ToeflPrep" className="flex items-center px-1">
              <Image
                src="/images/logo.png"
                alt="ToeflPrep"
                width={110}
                height={30}
                priority
                className={HIDE_WHEN_COLLAPSED}
              />
              <Image
                src="/images/logo-mark.png"
                alt=""
                width={32}
                height={32}
                priority
                className={SHOW_WHEN_COLLAPSED}
              />
            </Link>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup menu"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* UJIAN BERLANGSUNG */}
          <ActiveExamLink exam={activeExam} collapsed={collapsed} />

          {/* NAV */}
          <nav
            aria-label="Menu siswa"
            className="-mx-1 flex-1 space-y-1 overflow-y-auto px-1 text-sm font-medium"
          >
            {USER_NAV.map((section, index) => (
              <div key={section.title ?? `section-${index}`} className="space-y-1">
                {section.title && (
                  <>
                    <p
                      className={`px-3 pb-1 pt-5 text-[11px] md:pt-4 font-semibold uppercase tracking-wide text-gray-400 ${HIDE_WHEN_COLLAPSED}`}
                    >
                      {section.title}
                    </p>
                    <div
                      className={`mx-2 my-3 border-t ${SHOW_WHEN_COLLAPSED}`}
                      aria-hidden="true"
                    />
                  </>
                )}

                {section.items.map((item) => (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    active={item.href === activeHref}
                    collapsed={collapsed}
                    badgeCount={item.badge ? badgeCounts[item.badge] : 0}
                  />
                ))}
              </div>
            ))}
          </nav>

          {/* FOOTER */}
          <div
            className={`mt-3 shrink-0 border-t px-3 pt-3 text-xs font-medium text-gray-400 ${HIDE_WHEN_COLLAPSED}`}
          >
            © {new Date().getFullYear()} ToeflPrep
          </div>
        </div>
      </aside>
    </>
  );
}
