/** Nama cookie untuk nyimpen status sidebar admin (dibaca server biar nggak kedip pas reload). */
export const SIDEBAR_COLLAPSED_COOKIE = "admin_sidebar_collapsed";

/** Sama seperti di atas, tapi untuk sidebar siswa. */
export const USER_SIDEBAR_COLLAPSED_COOKIE = "user_sidebar_collapsed";

/** 1 tahun */
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Breakpoint `md` Tailwind. Collapse cuma berlaku di desktop, di mobile sidebar tetap drawer. */
export const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";
