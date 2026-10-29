"use client";

import { useState } from "react";
import {
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  User2Icon,
} from "lucide-react";

export type TopbarSession = {
  user: { name?: string | null; role?: string | null };
} | null;

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
  const [openUser, setOpenUser] = useState(false);
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* Mobile: buka drawer */}
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Buka menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition hover:bg-gray-200 md:hidden"
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
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 md:flex"
          >
            <ToggleIcon className="h-5 w-5" />
          </button>

          {/* BRAND / TITLE */}
          <div className="hidden md:block">
            <h1 className="text-sm font-semibold text-gray-800">Admin Panel</h1>
            <p className="text-xs text-gray-500">Manage system & data</p>
          </div>
        </div>

        {/* RIGHT */}
        {session && (
          <div className="relative flex items-center gap-3">
            {/* USER BUTTON */}
            <button
              type="button"
              onClick={() => setOpenUser(!openUser)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-gray-100"
            >
              {/* AVATAR */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-blue-100">
                <User2Icon className="h-5 w-5 text-blue-600" />
              </div>

              {/* INFO (DESKTOP ONLY) */}
              <div className="hidden text-left md:block">
                <div className="text-sm font-semibold leading-tight text-gray-800">
                  {session.user.name}
                </div>
                <div className="text-xs capitalize text-gray-500">
                  {session.user.role}
                </div>
              </div>

              <ChevronDown className="hidden h-4 w-4 text-gray-500 md:block" />
            </button>

            {/* DROPDOWN */}
            {openUser && (
              <div className="absolute right-0 top-12 w-44 overflow-hidden rounded-xl border bg-white shadow-lg">
                <div className="border-b px-3 py-2 text-xs text-gray-500">
                  Signed in as
                  <div className="font-semibold text-gray-800">
                    {session.user.name}
                  </div>
                </div>

                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={10} strokeWidth={2.5} />
                    Logout
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
