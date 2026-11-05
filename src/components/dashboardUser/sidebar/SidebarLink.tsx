import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import SidebarTooltip from "@/components/dashboardAdmin/sidebar/SidebarTooltip";
import {
  CENTER_WHEN_COLLAPSED,
  HIDE_WHEN_COLLAPSED,
  SHOW_WHEN_COLLAPSED,
} from "@/components/dashboardAdmin/sidebar/styles";

type SidebarLinkProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  /** Sidebar lagi mode icon (desktop). */
  collapsed: boolean;
  /** Jumlah hal baru di menu ini. 0 = tanpa penanda. */
  badgeCount?: number;
};

const ACTIVE = "bg-blue-50 font-semibold text-blue-700";
const IDLE = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

/** Angka di atas ini ditampilkan sebagai "9+". */
const BADGE_CAP = 9;

export default function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
  badgeCount = 0,
}: SidebarLinkProps) {
  const hasBadge = badgeCount > 0;
  const badgeText = badgeCount > BADGE_CAP ? `${BADGE_CAP}+` : String(badgeCount);

  return (
    <SidebarTooltip label={label} enabled={collapsed}>
      <Link
        href={href}
        aria-label={hasBadge ? `${label}, ${badgeText} baru` : label}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors md:py-2 ${CENTER_WHEN_COLLAPSED} ${
          active ? ACTIVE : IDLE
        }`}
      >
        <span className="relative shrink-0">
          <Icon className="h-5 w-5" />
          {/* Mode icon: cukup titik kecil di pojok icon. */}
          {hasBadge && (
            <span
              aria-hidden="true"
              className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white ${SHOW_WHEN_COLLAPSED}`}
            />
          )}
        </span>
        <span className={`flex-1 truncate ${HIDE_WHEN_COLLAPSED}`}>{label}</span>
        {hasBadge && (
          <span
            aria-hidden="true"
            className={`rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold leading-4 text-white ${HIDE_WHEN_COLLAPSED}`}
          >
            {badgeText}
          </span>
        )}
      </Link>
    </SidebarTooltip>
  );
}
