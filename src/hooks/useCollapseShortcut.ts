import { useEffect } from "react";
import { isDesktopViewport, isEditableTarget } from "@/libs/dom";

/** Ctrl/⌘ + B buat buka-tutup sidebar di desktop (nggak aktif pas lagi ngetik). */
export function useCollapseShortcut(onToggle: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isToggle =
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "b";
      if (!isToggle || isEditableTarget(event.target) || !isDesktopViewport()) {
        return;
      }
      event.preventDefault();
      onToggle();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onToggle]);
}
