"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  SIDEBAR_COLLAPSED_COOKIE,
  SIDEBAR_COOKIE_MAX_AGE,
} from "@/constants/sidebar";
import { isDesktopViewport, isEditableTarget } from "@/libs/dom";
import Sidebar from "./Sidebar";
import Topbar, { type TopbarSession } from "./Topbar";

type DashboardShellProps = {
  children: React.ReactNode;
  session: TopbarSession;
  logoutAction: () => void;
  /** Status awal sidebar, dibaca server dari cookie biar nggak kedip pas reload. */
  defaultCollapsed?: boolean;
};

export default function DashboardShell({
  children,
  session,
  logoutAction,
  defaultCollapsed = false,
}: DashboardShellProps) {
  const pathname = usePathname();

  // Mobile: drawer. Desktop: collapsed (cuma icon).
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const updateCollapsed = useCallback((next: boolean) => {
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COLLAPSED_COOKIE}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; samesite=lax`;
  }, []);

  const expandSidebar = useCallback(
    () => updateCollapsed(false),
    [updateCollapsed],
  );

  // Pindah halaman → drawer mobile otomatis nutup.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Shortcut Ctrl/⌘ + B buat buka-tutup sidebar (nggak aktif pas lagi ngetik).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isToggle =
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "b";
      if (!isToggle || isEditableTarget(event.target) || !isDesktopViewport()) {
        return;
      }
      event.preventDefault();
      updateCollapsed(!collapsed);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [collapsed, updateCollapsed]);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar
        isOpen={open}
        onClose={() => setOpen(false)}
        collapsed={collapsed}
        onExpand={expandSidebar}
      />

      <div
        className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-200 ${
          collapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        <Topbar
          onOpenSidebar={() => setOpen(true)}
          collapsed={collapsed}
          onToggleCollapsed={() => updateCollapsed(!collapsed)}
          session={session}
          logoutAction={logoutAction}
        />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
