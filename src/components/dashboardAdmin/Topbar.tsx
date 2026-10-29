"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { TopbarSession } from "@/types/admin-shell";
import GlobalSearch from "./topbar/GlobalSearch";
import UserMenu from "./topbar/UserMenu";

type TopbarProps = {
  onOpenSidebar: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  session: TopbarSession;
  logoutAction: () => void;
};

export default function Topbar({
  onOpenSidebar,
  collapsed,
  onToggleCollapsed,
  session,
  logoutAction,
}: TopbarProps) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile: buka drawer */}
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Buka menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 transition hover:bg-gray-200 md:hidden"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>

          {/* Desktop: lipat / lebarkan sidebar */}
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Lebarkan sidebar" : "Ciutkan sidebar"}
            aria-controls="admin-sidebar"
            aria-expanded={!collapsed}
            title={`${collapsed ? "Lebarkan" : "Ciutkan"} sidebar (Ctrl+B)`}
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 md:flex"
          >
            <ToggleIcon className="h-5 w-5" />
          </button>

          {/* TITLE */}
          <div className="hidden min-w-0 md:block">
            <h1 className="truncate text-sm font-semibold text-gray-800">Admin Panel</h1>
            <p className="truncate text-xs text-gray-500">Manage system & data</p>
          </div>
        </div>

        {/* RIGHT: search + akun */}
        <div className="flex shrink-0 items-center gap-2">
          <GlobalSearch />
          {session && <UserMenu user={session.user} logoutAction={logoutAction} />}
        </div>
      </div>
    </header>
  );
}
