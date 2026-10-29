"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, LogOut } from "lucide-react";
import type { TopbarUser } from "@/types/admin-shell";
import Avatar from "./Avatar";

type UserMenuProps = {
  user: TopbarUser;
  logoutAction: () => void;
};

export default function UserMenu({ user, logoutAction }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const displayName =
    user.name?.trim() || user.email?.split("@")[0] || "Admin";
  const roleLabel = user.role === "ADMIN" ? "Admin" : user.role;

  // Klik di luar atau tekan Esc → menu menutup.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Menu akun"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`rounded-full p-0.5 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 ${
          open ? "bg-gray-100" : ""
        }`}
      >
        <Avatar name={user.name} email={user.email} image={user.image} size="md" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-2xl border bg-white shadow-lg">
          {/* IDENTITAS */}
          <div className="flex items-center gap-3 p-4">
            <Avatar name={user.name} email={user.email} image={user.image} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {displayName}
              </p>
              {user.email && (
                <p className="truncate text-xs text-gray-500">{user.email}</p>
              )}
              {roleLabel && (
                <span className="mt-1.5 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium capitalize text-gray-600">
                  {roleLabel}
                </span>
              )}
            </div>
          </div>

          {/* AKSI */}
          <div className="border-t p-1.5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ExternalLink className="h-4 w-4 text-gray-400" />
              Lihat situs
            </a>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
