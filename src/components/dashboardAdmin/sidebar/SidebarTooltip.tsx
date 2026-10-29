"use client";

import { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { isDesktopViewport } from "@/libs/dom";

type SidebarTooltipProps = {
  label: string;
  /** Tooltip cuma aktif saat sidebar collapsed. */
  enabled: boolean;
  children: ReactNode;
};

/** Tooltip kecil di sisi kanan item. Dirender lewat portal biar nggak ke-clip overflow sidebar. */
export default function SidebarTooltip({
  label,
  enabled,
  children,
}: SidebarTooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );

  const show = () => {
    if (!enabled || !isDesktopViewport()) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    // Horizontal: ikut tepi kanan sidebar (bukan tepi item) biar nggak nimpa border-nya.
    const sidebarRight = ref.current?.closest("aside")?.getBoundingClientRect().right;
    setPosition({
      top: rect.top + rect.height / 2,
      left: (sidebarRight ?? rect.right) + 8,
    });
  };
  const hide = () => setPosition(null);

  return (
    <div
      ref={ref}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={hide}
    >
      {children}
      {enabled &&
        position &&
        createPortal(
          <span
            role="tooltip"
            style={{ top: position.top, left: position.left }}
            className="pointer-events-none fixed z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white"
          >
            {label}
          </span>,
          document.body,
        )}
    </div>
  );
}
