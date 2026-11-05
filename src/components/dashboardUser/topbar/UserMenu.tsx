"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Crown, LogOut, User } from "lucide-react";
import Avatar from "@/components/dashboardAdmin/topbar/Avatar";
import { useDismissable, type DismissReason } from "@/hooks/useDismissable";
import type { UserShellUser } from "@/types/user-shell";

type UserMenuProps = {
  user: UserShellUser;
  logoutAction: () => void;
};

export default function UserMenu({ user, logoutAction }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const displayName = user.name?.trim() || user.email?.split("@")[0] || "Siswa";

  const dismiss = useCallback((reason: DismissReason) => {
    setOpen(false);
    if (reason === "escape") buttonRef.current?.focus();
  }, []);

  useDismissable(open, rootRef, dismiss);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Menu akun"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`relative rounded-full p-0.5 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 ${
          open ? "bg-gray-100" : ""
        }`}
      >
        <Avatar name={user.name} email={user.email} image={user.image} size="md" />
        {user.isMember && (
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-white ring-2 ring-white"
          >
            <Crown className="h-2.5 w-2.5" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-2xl border bg-white shadow-lg">
          <div className="flex items-center gap-3 p-4">
            <Avatar name={user.name} email={user.email} image={user.image} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {displayName}
              </p>
              {user.email && (
                <p className="truncate text-xs text-gray-500">{user.email}</p>
              )}
              <span
                className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  user.isMember
                    ? "bg-amber-50 text-amber-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {user.isMember && <Crown className="h-3 w-3" />}
                {user.isMember ? "Member" : "Non-member"}
              </span>
            </div>
          </div>

          <div className="border-t p-1.5">
            <Link
              href="/user/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <User className="h-4 w-4 text-gray-400" />
              Profil Saya
            </Link>

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
