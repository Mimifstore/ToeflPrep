import { useEffect, type RefObject } from "react";

export type DismissReason = "outside" | "escape";

/**
 * Menutup popup saat klik/sentuh di luar `rootRef` atau saat menekan Esc.
 * `onDismiss` menerima alasannya, supaya pemanggil bisa mengembalikan fokus ke
 * tombol pemicu kalau popup ditutup lewat Esc.
 */
export function useDismissable(
  open: boolean,
  rootRef: RefObject<HTMLElement>,
  onDismiss: (reason: DismissReason) => void,
) {
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onDismiss("outside");
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss("escape");
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, rootRef, onDismiss]);
}
