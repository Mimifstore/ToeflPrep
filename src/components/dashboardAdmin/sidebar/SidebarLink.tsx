"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import HighlightedText from "./HighlightedText";
import SidebarTooltip from "./SidebarTooltip";
import { CENTER_WHEN_COLLAPSED, HIDE_WHEN_COLLAPSED } from "./styles";

type SidebarLinkProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  collapsed: boolean;
  query: string;
  /** Item di dalam submenu: lebih kecil dan nggak pakai tooltip. */
  nested?: boolean;
  tabIndex?: number;
  onNavigate?: () => void;
};

const ACTIVE = "bg-blue-50 font-semibold text-blue-700";
const IDLE = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

export default function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
  query,
  nested = false,
  tabIndex,
  onNavigate,
}: SidebarLinkProps) {
  const link = (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      tabIndex={tabIndex}
      onClick={onNavigate}
      className={`flex items-center rounded-lg transition-colors ${
        nested
          ? "gap-2 px-3 py-2 text-sm md:py-1.5"
          : `gap-3 px-2.5 py-2.5 md:py-2 ${CENTER_WHEN_COLLAPSED}`
      } ${active ? ACTIVE : IDLE}`}
    >
      <Icon className={`shrink-0 ${nested ? "h-4 w-4" : "h-5 w-5"}`} />
      <span className={`truncate ${nested ? "" : HIDE_WHEN_COLLAPSED}`}>
        <HighlightedText text={label} query={query} />
      </span>
    </Link>
  );

  if (nested) return link;

  return (
    <SidebarTooltip label={label} enabled={collapsed}>
      {link}
    </SidebarTooltip>
  );
}
