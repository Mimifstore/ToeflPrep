"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CornerDownLeft,
  Search,
  SearchX,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_NAV } from "@/constants/admin-navigation";
import { ADMIN_QUICK_ACTIONS, ADMIN_SEARCH_GROUPS } from "@/constants/admin-search";
import { useAdminSearch } from "@/hooks/useAdminSearch";
import { filterAdminNav, filterByQuery } from "@/libs/admin-nav";
import { normalizeQuery } from "@/libs/admin-search-utils";
import {
  ADMIN_SEARCH_MIN_LENGTH,
  ADMIN_SEARCH_TYPES,
  type AdminSearchTone,
} from "@/types/admin-search";
import HighlightedText from "../sidebar/HighlightedText";
import Avatar from "./Avatar";

type Row = {
  key: string;
  href: string;
  title: string;
  subtitle?: string;
  badge?: string;
  tone?: AdminSearchTone;
  icon: LucideIcon;
  /** Diisi kalau ini hasil pengguna: tampil sebagai avatar, bukan icon. */
  user?: { image?: string | null; email?: string };
};

type Section = { key: string; label: string; rows: Row[] };

const TONE_CLASS: Record<AdminSearchTone, string> = {
  neutral: "bg-white text-gray-600 ring-1 ring-inset ring-gray-200",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
};

const MARK_CLASS = "bg-transparent font-semibold text-gray-900";
const MAX_PAGE_MATCHES = 4;
const LIST_ID = "admin-search-list";

export default function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [isMac, setIsMac] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const { items, status, retry } = useAdminSearch(query, open);

  const term = normalizeQuery(query);
  const canSearchData = term.length >= ADMIN_SEARCH_MIN_LENGTH;

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  const openSearch = useCallback(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActive(0);
    setOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    returnFocusRef.current?.focus?.();
  }, []);

  // Ctrl/⌘ + K: buka atau tutup. Dilewati di editor teks kaya (Quill) karena Ctrl+K di sana = sisipkan link.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut =
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "k";
      if (!isShortcut) return;
      if (event.target instanceof HTMLElement && event.target.isContentEditable) return;

      event.preventDefault();
      if (open) closeSearch();
      else openSearch();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, openSearch, closeSearch]);

  // Selama terbuka: halaman di belakang nggak ikut scroll, fokus langsung ke input.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const sections = useMemo<Section[]>(() => {
    const result: Section[] = [];

    const quickActions = filterByQuery(ADMIN_QUICK_ACTIONS, term);
    const pages = term ? filterAdminNav(ADMIN_NAV, term).links : [];

    if (pages.length > 0) {
      result.push({
        key: "pages",
        label: "Halaman",
        rows: pages.slice(0, MAX_PAGE_MATCHES).map((page) => ({
          key: `page:${page.href}`,
          href: page.href,
          title: page.label,
          icon: page.icon,
        })),
      });
    }

    if (quickActions.length > 0) {
      result.push({
        key: "actions",
        label: "Aksi cepat",
        rows: quickActions.slice(0, term ? 3 : undefined).map((action) => ({
          key: `action:${action.href}`,
          href: action.href,
          title: action.label,
          icon: action.icon,
        })),
      });
    }

    if (canSearchData) {
      for (const type of ADMIN_SEARCH_TYPES) {
        const group = ADMIN_SEARCH_GROUPS[type];
        const rows = items
          .filter((item) => item.type === type)
          .map<Row>((item) => ({
            key: `${type}:${item.id}`,
            href: item.href,
            title: item.title,
            subtitle: item.subtitle,
            badge: item.badge,
            tone: item.tone,
            icon: group.icon,
            user:
              type === "user"
                ? { image: item.imageUrl, email: item.subtitle }
                : undefined,
          }));
        if (rows.length > 0) result.push({ key: type, label: group.label, rows });
      }
    }

    return result;
  }, [term, canSearchData, items]);

  const rows = useMemo(() => sections.flatMap((section) => section.rows), [sections]);
  const rowsSignature = rows.map((row) => row.key).join("|");

  // Daftar berubah → sorotan kembali ke baris pertama.
  useEffect(() => {
    setActive(0);
  }, [rowsSignature]);

  // Baris yang disorot selalu kelihatan saat dinavigasi pakai keyboard.
  useEffect(() => {
    if (!open) return;
    if (active === 0 && listRef.current) {
      listRef.current.scrollTop = 0;
      return;
    }
    document.getElementById(`admin-search-row-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const goTo = (href: string, newTab = false) => {
    if (newTab) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    setOpen(false);
    router.push(href);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return; // lagi mengetik pakai IME

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (rows.length) setActive((i) => (i + 1) % rows.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (rows.length) setActive((i) => (i - 1 + rows.length) % rows.length);
        break;
      case "Enter": {
        const row = rows[active];
        if (row) {
          event.preventDefault();
          goTo(row.href, event.ctrlKey || event.metaKey);
        }
        break;
      }
      case "Escape":
        event.preventDefault();
        closeSearch();
        break;
      case "Tab":
        event.preventDefault(); // fokus tetap di input; pilih hasil pakai panah
        break;
    }
  };

  const loading = status === "loading";
  const showEmpty =
    canSearchData && status === "ready" && rows.length === 0;
  const showHint = !canSearchData && term.length > 0;
  const shortcutLabel = isMac ? "⌘K" : "Ctrl K";

  let rowIndex = -1;

  return (
    <>
      {/* TRIGGER — desktop: kolom pencarian, mobile: tombol icon */}
      <button
        type="button"
        onClick={openSearch}
        aria-label="Cari data"
        aria-haspopup="dialog"
        className="hidden h-10 w-64 items-center gap-2.5 rounded-xl bg-gray-100 px-3 text-sm text-gray-500 transition-colors hover:bg-gray-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 md:flex lg:w-72"
      >
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <span className="flex-1 truncate text-left">Cari data…</span>
        <kbd className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-medium text-gray-400">
          {shortcutLabel}
        </kbd>
      </button>
      <button
        type="button"
        onClick={openSearch}
        aria-label="Cari data"
        aria-haspopup="dialog"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 md:hidden"
      >
        <Search className="h-5 w-5" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-16 sm:p-4 sm:pt-[12vh]">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gray-900/30"
              onClick={closeSearch}
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-label="Pencarian"
              className="relative flex max-h-[min(34rem,calc(100dvh-5rem))] w-full max-w-xl flex-col overflow-hidden rounded-2xl border bg-white shadow-xl"
            >
              {/* INPUT */}
              <div className="flex shrink-0 items-center gap-3 border-b px-4">
                <Search className="h-5 w-5 shrink-0 text-gray-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onInputKeyDown}
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={LIST_ID}
                  aria-autocomplete="list"
                  aria-activedescendant={rows.length ? `admin-search-row-${active}` : undefined}
                  aria-label="Cari data admin"
                  placeholder="Cari siswa, ujian, soal, transaksi…"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={64}
                  className="h-14 min-w-0 flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400"
                />
                {query ? (
                  <button
                    type="button"
                    aria-label="Hapus pencarian"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500 hover:bg-gray-200"
                  >
                    Esc
                  </button>
                )}
              </div>

              <p role="status" aria-live="polite" className="sr-only">
                {canSearchData && status === "ready" ? `${rows.length} hasil ditemukan` : ""}
              </p>

              {/* HASIL */}
              <div
                ref={listRef}
                id={LIST_ID}
                role="listbox"
                aria-label="Hasil pencarian"
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
              >
                {sections.map((section) => (
                  <div
                    key={section.key}
                    role="group"
                    aria-label={section.label}
                    className="pb-1"
                  >
                    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      {section.label}
                    </p>
                    {section.rows.map((row) => {
                      rowIndex += 1;
                      const index = rowIndex;
                      const isActive = index === active;
                      const Icon = row.icon;

                      return (
                        <Link
                          key={row.key}
                          id={`admin-search-row-${index}`}
                          href={row.href}
                          role="option"
                          aria-selected={isActive}
                          tabIndex={-1}
                          onMouseMove={() => setActive(index)}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                            isActive ? "bg-gray-100" : ""
                          }`}
                        >
                          {row.user ? (
                            <Avatar
                              name={row.title}
                              email={row.user.email}
                              image={row.user.image}
                              size="md"
                            />
                          ) : (
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                isActive ? "bg-white text-gray-700" : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              <Icon className="h-[18px] w-[18px]" />
                            </span>
                          )}

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-gray-700">
                              <HighlightedText text={row.title} query={term} markClassName={MARK_CLASS} />
                            </span>
                            {row.subtitle && (
                              <span className="block truncate text-xs text-gray-500">
                                <HighlightedText text={row.subtitle} query={term} markClassName={MARK_CLASS} />
                              </span>
                            )}
                          </span>

                          {row.badge && (
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                TONE_CLASS[row.tone ?? "neutral"]
                              }`}
                            >
                              {row.badge}
                            </span>
                          )}
                          {isActive && (
                            <CornerDownLeft className="hidden h-4 w-4 shrink-0 text-gray-400 sm:block" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ))}

                {/* Memuat, belum ada hasil sama sekali */}
                {loading && items.length === 0 && (
                  <div className="space-y-1 px-1 pb-1 pt-2" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex animate-pulse items-center gap-3 px-2 py-2">
                        <div className="h-9 w-9 rounded-lg bg-gray-100" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-2/5 rounded bg-gray-100" />
                          <div className="h-2.5 w-3/5 rounded bg-gray-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showHint && (
                  <p className="px-3 py-3 text-center text-xs text-gray-500">
                    Ketik minimal {ADMIN_SEARCH_MIN_LENGTH} huruf untuk mencari data.
                  </p>
                )}

                {status === "error" && (
                  <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                    <TriangleAlert className="h-6 w-6 text-gray-400" />
                    <p className="text-sm text-gray-600">Data belum bisa dimuat.</p>
                    <button
                      type="button"
                      onClick={retry}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                    >
                      Coba lagi
                    </button>
                  </div>
                )}

                {showEmpty && (
                  <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
                    <SearchX className="mb-1 h-7 w-7 text-gray-300" />
                    <p className="text-sm font-medium text-gray-700">
                      Tidak ada hasil untuk “{term}”
                    </p>
                    <p className="text-xs text-gray-500">Coba kata kunci lain atau periksa ejaannya.</p>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="hidden shrink-0 items-center justify-between border-t bg-gray-50/70 px-4 py-2 text-[11px] text-gray-500 sm:flex">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-white px-1 py-0.5 font-medium ring-1 ring-inset ring-gray-200">↑</kbd>
                    <kbd className="rounded bg-white px-1 py-0.5 font-medium ring-1 ring-inset ring-gray-200">↓</kbd>
                    pilih
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-white px-1 py-0.5 font-medium ring-1 ring-inset ring-gray-200">↵</kbd>
                    buka
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-white px-1 py-0.5 font-medium ring-1 ring-inset ring-gray-200">{isMac ? "⌘" : "Ctrl"} ↵</kbd>
                    tab baru
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-white px-1 py-0.5 font-medium ring-1 ring-inset ring-gray-200">Esc</kbd>
                  tutup
                </span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
