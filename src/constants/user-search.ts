import {
  Archive,
  ArrowLeftRight,
  Bell,
  BookOpen,
  Tags,
  Timer,
  User,
  type LucideIcon,
} from "lucide-react";
import type { UserSearchType } from "@/types/user-search";

/** Judul + icon tiap grup hasil pencarian data. */
export const USER_SEARCH_GROUPS: Record<
  UserSearchType,
  { label: string; icon: LucideIcon }
> = {
  ujian: { label: "Try Out", icon: Timer },
  program: { label: "Kategori", icon: Tags },
  riwayat: { label: "Riwayat Try Out", icon: Archive },
  transaksi: { label: "Transaksi", icon: ArrowLeftRight },
  pengumuman: { label: "Pengumuman", icon: Bell },
  faq: { label: "FAQ", icon: BookOpen },
};

export type UserQuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
  keywords?: string[];
};

/** Pintasan yang tampil saat pencarian dibuka kosong, dan bisa dicari juga. */
export const USER_QUICK_ACTIONS: UserQuickAction[] = [
  {
    label: "Mulai try out",
    href: "/user/tryout",
    icon: Timer,
    keywords: ["kerjakan ujian", "latihan", "mulai ujian"],
  },
  {
    label: "Lihat hasil try out",
    href: "/user/riwayat",
    icon: Archive,
    keywords: ["nilai", "skor", "pembahasan"],
  },
  {
    label: "Ubah profil",
    href: "/user/profile",
    icon: User,
    keywords: ["edit profil", "ganti nama", "akun"],
  },
];
