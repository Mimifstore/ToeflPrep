"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ADMIN_NAV, isNavGroup } from "@/constants/admin-navigation";
import { filterAdminNav, isPathActive } from "@/libs/admin-nav";
import { isDesktopViewport, isEditableTarget } from "@/libs/dom";
import SidebarGroup from "./sidebar/SidebarGroup";
import SidebarLink from "./sidebar/SidebarLink";
import SidebarSearch from "./sidebar/SidebarSearch";
import {
  CENTER_WHEN_COLLAPSED,
  HIDE_WHEN_COLLAPSED,
  SHOW_WHEN_COLLAPSED,
} from "./sidebar/styles";

type SidebarProps = {
  /** Mobile: drawer lagi kebuka atau nggak. */
  isOpen: boolean;
  onClose: () => void;
  /** Desktop: true = cuma icon. */
  collapsed: boolean;
  /** Minta Shell buat melebarkan sidebar lagi. */
  onExpand: () => void;
};

/** Group yang path-nya lagi dibuka langsung kebuka, jadi nggak ada kedip pas halaman dimuat. */
function getInitialOpenGroups(pathname: string): Record<string, boolean> {
  const open: Record<string, boolean> = {};
  for (const section of ADMIN_NAV) {
    for (const item of section.items) {
      if (isNavGroup(item) && isPathActive(pathname, item.basePath)) {
        open[item.basePath] = true;
      }
    }
  }
  return open;
}

export default function Sidebar({
  isOpen,
  onClose,
  collapsed,
  onExpand,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const [query, setQuery] = useState("");
  const [pendingFocus, setPendingFocus] = useState(false);
  const [openGroups, setOpenGroups] = useState(() =>
    getInitialOpenGroups(pathname),
  );

  const isSearching = query.trim() !== "";
  const filtered = useMemo(() => filterAdminNav(ADMIN_NAV, query), [query]);

  // Pindah ke halaman di dalam group → group-nya otomatis kebuka.
  useEffect(() => {
    setOpenGroups((prev) => ({ ...prev, ...getInitialOpenGroups(pathname) }));
  }, [pathname]);

  // Sidebar dilipat → pencarian direset.
  useEffect(() => {
    if (collapsed) setQuery("");
  }, [collapsed]);

  const focusSearch = useCallback(() => {
    if (collapsed) {
      onExpand();
      setPendingFocus(true);
      return;
    }
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [collapsed, onExpand]);

  // Fokus ke input setelah sidebar selesai dilebarkan.
  useEffect(() => {
    if (pendingFocus && !collapsed) {
      inputRef.current?.focus();
      setPendingFocus(false);
    }
  }, [pendingFocus, collapsed]);

  // Shortcut: "/" atau Ctrl/⌘ + K buat langsung nyari menu.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target) || !isDesktopViewport()) return;

      const isSlash =
        event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey;
      const isCtrlK =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (!isSlash && !isCtrlK) return;

      event.preventDefault();
      focusSearch();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusSearch]);

  const clearQuery = () => setQuery("");

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const first = filtered.links[0];
      if (first) {
        router.push(first.href);
        clearQuery();
        inputRef.current?.blur();
      }
    } else if (event.key === "Escape") {
      if (query) clearQuery();
      else inputRef.current?.blur();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      navRef.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
    }
  };

  const toggleGroup = (key: string) => {
    // Lagi collapsed: klik group = lebarkan sidebar sekalian buka submenu-nya.
    if (collapsed && isDesktopViewport()) {
      onExpand();
      setOpenGroups((prev) => ({ ...prev, [key]: true }));
      return;
    }
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
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
        id="admin-sidebar"
        aria-label="Sidebar admin"
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

          {/* SEARCH */}
          <div className="mb-2 shrink-0">
            <SidebarSearch
              value={query}
              inputRef={inputRef}
              collapsed={collapsed}
              onChange={setQuery}
              onClear={() => {
                clearQuery();
                inputRef.current?.focus();
              }}
              onKeyDown={handleSearchKeyDown}
              onCollapsedClick={focusSearch}
            />
          </div>

          {/* Info hasil pencarian buat screen reader (di luar <nav> biar nggak ikut kena spasi antar-item) */}
          <p role="status" aria-live="polite" className="sr-only">
            {isSearching ? `${filtered.links.length} menu ditemukan` : ""}
          </p>

          {/* NAV */}
          <nav
            ref={navRef}
            aria-label="Menu admin"
            className="-mx-1 flex-1 space-y-1 overflow-y-auto px-1 text-sm font-medium"
          >
            {isSearching && filtered.links.length === 0 && (
              <p className="break-words px-3 py-6 text-center text-sm font-normal text-gray-500">
                Menu “{query.trim()}” tidak ditemukan
              </p>
            )}

            {filtered.sections.map((section, index) => (
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

                {section.items.map((item) =>
                  isNavGroup(item) ? (
                    <SidebarGroup
                      key={item.basePath}
                      group={item}
                      open={isSearching || !!openGroups[item.basePath]}
                      collapsed={collapsed}
                      query={query}
                      pathname={pathname}
                      onToggle={() => toggleGroup(item.basePath)}
                      onNavigate={clearQuery}
                    />
                  ) : (
                    <SidebarLink
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      active={isPathActive(pathname, item.href, item.exact)}
                      collapsed={collapsed}
                      query={query}
                      onNavigate={clearQuery}
                    />
                  ),
                )}
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
