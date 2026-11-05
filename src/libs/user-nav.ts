import type { UserNavSection } from "@/constants/user-navigation";
import { isPathActive } from "@/libs/admin-nav";

/**
 * Cari menu sidebar yang sedang aktif, hasilnya `href` menu itu (atau null kalau tidak ada).
 * Kalau beberapa menu cocok sekaligus (mis. /user/tryout/result/1 cocok dengan "Try Out"
 * dan "Riwayat Try Out"), yang dipilih adalah yang path-nya paling spesifik (paling panjang).
 */
export function findActiveNavHref(
  pathname: string,
  sections: UserNavSection[],
): string | null {
  let activeHref: string | null = null;
  let bestLength = -1;

  for (const { items } of sections) {
    for (const item of items) {
      const candidates = [
        { path: item.href, exact: item.exact },
        ...(item.activeFor ?? []).map((path) => ({ path, exact: false })),
      ];

      for (const { path, exact } of candidates) {
        if (path.length > bestLength && isPathActive(pathname, path, exact)) {
          activeHref = item.href;
          bestLength = path.length;
        }
      }
    }
  }

  return activeHref;
}
