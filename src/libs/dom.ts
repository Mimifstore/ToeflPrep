import { DESKTOP_MEDIA_QUERY } from "@/constants/sidebar";

/** Aman dipanggil di event handler / effect (client only). */
export function isDesktopViewport(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(DESKTOP_MEDIA_QUERY).matches
  );
}

/** true kalau fokus lagi di field yang bisa diketik (input, textarea, editor Quill, dll). */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}
