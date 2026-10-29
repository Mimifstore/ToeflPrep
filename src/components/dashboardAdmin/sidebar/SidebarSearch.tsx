"use client";

import type { KeyboardEventHandler, RefObject } from "react";
import { Search, X } from "lucide-react";
import SidebarTooltip from "./SidebarTooltip";
import { HIDE_WHEN_COLLAPSED, SHOW_WHEN_COLLAPSED } from "./styles";

type SidebarSearchProps = {
  value: string;
  inputRef: RefObject<HTMLInputElement>;
  collapsed: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
  onKeyDown: KeyboardEventHandler<HTMLInputElement>;
  /** Dipanggil saat tombol icon (mode collapsed) diklik. */
  onCollapsedClick: () => void;
};

export default function SidebarSearch({
  value,
  inputRef,
  collapsed,
  onChange,
  onClear,
  onKeyDown,
  onCollapsedClick,
}: SidebarSearchProps) {
  return (
    <>
      {/* MODE NORMAL: input */}
      <div className={`relative ${HIDE_WHEN_COLLAPSED}`}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          id="sidebar-search"
          type="text"
          role="searchbox"
          aria-label="Cari menu"
          autoComplete="off"
          spellCheck={false}
          placeholder="Cari menu…"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-9 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {value ? (
          <button
            type="button"
            aria-label="Hapus pencarian"
            onClick={onClear}
            className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-200 hover:text-gray-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute hidden md:block right-2 top-1/2 -translate-y-1/2 rounded border border-gray-200 bg-white px-1.5 text-[10px] font-medium leading-4 text-gray-400">
            /
          </kbd>
        )}
      </div>

      {/* MODE COLLAPSED: tombol icon, klik = buka sidebar + fokus ke input */}
      <div className={SHOW_WHEN_COLLAPSED}>
        <SidebarTooltip label="Cari menu (/)" enabled={collapsed}>
          <button
            type="button"
            aria-label="Cari menu"
            onClick={onCollapsedClick}
            className="flex h-10 w-full items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <Search className="h-5 w-5" />
          </button>
        </SidebarTooltip>
      </div>
    </>
  );
}
