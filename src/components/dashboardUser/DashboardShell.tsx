"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  SIDEBAR_COOKIE_MAX_AGE,
  USER_SIDEBAR_COLLAPSED_COOKIE,
} from "@/constants/sidebar";
import { useCollapseShortcut } from "@/hooks/useCollapseShortcut";
import type { UserShellSession } from "@/types/user-shell";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type DashboardShellProps = {
  children: React.ReactNode;
  session: UserShellSession;
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
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = useCallback(() => {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${USER_SIDEBAR_COLLAPSED_COOKIE}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; samesite=lax`;
  }, [collapsed]);

  // Pindah halaman → drawer mobile otomatis nutup.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useCollapseShortcut(toggleCollapsed);

  return (
    <div className="flex min-h-screen animate-brand-in bg-gray-50 text-gray-800">
      <Sidebar
        isOpen={open}
        onClose={() => setOpen(false)}
        collapsed={collapsed}
      />

      <div
        className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-200 ${
          collapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        <Topbar
          onOpenSidebar={() => setOpen(true)}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          session={session}
          logoutAction={logoutAction}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
