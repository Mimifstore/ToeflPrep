"use client";

import { ChevronRight } from "lucide-react";
import type { AdminNavGroup } from "@/constants/admin-navigation";
import { isPathActive } from "@/libs/admin-nav";
import HighlightedText from "./HighlightedText";
import SidebarLink from "./SidebarLink";
import SidebarTooltip from "./SidebarTooltip";
import { CENTER_WHEN_COLLAPSED, HIDE_WHEN_COLLAPSED } from "./styles";

type SidebarGroupProps = {
  group: AdminNavGroup;
  open: boolean;
  collapsed: boolean;
  query: string;
  pathname: string;
  onToggle: () => void;
  onNavigate?: () => void;
};

export default function SidebarGroup({
  group,
  open,
  collapsed,
  query,
  pathname,
  onToggle,
  onNavigate,
}: SidebarGroupProps) {
  const Icon = group.icon;
  const active = isPathActive(pathname, group.basePath);
  const panelId = `sidebar-group-${group.basePath.replace(/\W+/g, "-")}`;

  return (
    <div>
      <SidebarTooltip label={group.label} enabled={collapsed}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={group.label}
          onClick={onToggle}
          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 transition-colors md:py-2 ${CENTER_WHEN_COLLAPSED} ${
            active
              ? "font-semibold text-blue-700 group-data-[collapsed=true]/sidebar:md:bg-blue-50"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <span className="flex min-w-0 items-center gap-3">
            <Icon className="h-5 w-5 shrink-0" />
            <span className={`truncate ${HIDE_WHEN_COLLAPSED}`}>
              <HighlightedText text={group.label} query={query} />
            </span>
          </span>
          <ChevronRight
            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
              open ? "rotate-90" : ""
            } ${HIDE_WHEN_COLLAPSED}`}
          />
        </button>
      </SidebarTooltip>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows,visibility] duration-200 ${
          open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
        } ${HIDE_WHEN_COLLAPSED}`}
      >
        <div className="overflow-hidden">
          <div className="ml-5 mt-1 space-y-1 border-l pl-3">
            {group.children.map((child) => (
              <SidebarLink
                key={child.href}
                href={child.href}
                icon={child.icon}
                label={child.label}
                active={isPathActive(pathname, child.href, child.exact)}
                collapsed={collapsed}
                query={query}
                nested
                tabIndex={open ? undefined : -1}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
