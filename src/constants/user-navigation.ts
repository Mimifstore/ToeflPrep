import {
  Archive,
  ArrowLeftRight,
  Bell,
  BookOpen,
  Home,
  Timer,
  User,
  type LucideIcon,
} from "lucide-react";

/** Menu yang bisa menampilkan penanda "ada yang baru" di sidebar. */
export type UserNavBadge = "announcements";

export type UserNavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** true = aktif hanya kalau path-nya persis sama (dipakai Dashboard). */
  exact?: boolean;
  /** Path lain yang ikut menyalakan menu ini, mis. halaman hasil ujian → Riwayat Try Out. */
  activeFor?: string[];
  badge?: UserNavBadge;
};

export type UserNavSection = {
  /** Kosong = section tanpa judul. */
  title?: string;
  items: UserNavLink[];
};

export const ANNOUNCEMENTS_HREF = "/user/pengumuman";

export const USER_NAV: UserNavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/user", icon: Home, exact: true }],
  },
  {
    title: "Belajar",
    items: [
      { label: "Try Out", href: "/user/tryout", icon: Timer },
      {
        label: "Riwayat Try Out",
        href: "/user/riwayat",
        icon: Archive,
        activeFor: ["/user/tryout/result"],
      },
    ],
  },
  {
    title: "Informasi",
    items: [
      {
        label: "Pengumuman",
        href: ANNOUNCEMENTS_HREF,
        icon: Bell,
        badge: "announcements",
      },
      { label: "FAQ", href: "/user/faq", icon: BookOpen },
    ],
  },
  {
    title: "Akun",
    items: [
      {
        label: "Riwayat Transaksi",
        href: "/user/riwayatTransaksi",
        icon: ArrowLeftRight,
      },
      { label: "Profil", href: "/user/profile", icon: User },
    ],
  },
];
