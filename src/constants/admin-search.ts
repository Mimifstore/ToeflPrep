import {
  ArrowLeftRight,
  Bell,
  BookOpen,
  FilePlus2,
  FileText,
  FolderOpen,
  ListChecks,
  PenBoxIcon,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AdminSearchType } from "@/types/admin-search";

/** Judul + icon tiap grup hasil pencarian data. */
export const ADMIN_SEARCH_GROUPS: Record<
  AdminSearchType,
  { label: string; icon: LucideIcon }
> = {
  user: { label: "Pengguna", icon: Users },
  program: { label: "Kategori", icon: Tags },
  penilaian: { label: "Kategori Penilaian", icon: ListChecks },
  "bank-soal": { label: "Bank Soal", icon: FolderOpen },
  soal: { label: "Butir Soal", icon: FileText },
  ujian: { label: "Ujian", icon: PenBoxIcon },
  pengumuman: { label: "Pengumuman", icon: Bell },
  faq: { label: "FAQ", icon: BookOpen },
  transaksi: { label: "Transaksi", icon: ArrowLeftRight },
};

export type AdminQuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
  keywords?: string[];
};

/** Pintasan ke halaman "tambah baru". Tampil saat search dibuka kosong, dan bisa dicari. */
export const ADMIN_QUICK_ACTIONS: AdminQuickAction[] = [
  {
    label: "Buat ujian baru",
    href: "/admin/ujian/create",
    icon: PenBoxIcon,
    keywords: ["tambah ujian", "tryout"],
  },
  {
    label: "Tambah soal",
    href: "/admin/master-data/soal/create",
    icon: FilePlus2,
    keywords: ["buat soal", "bank soal baru", "import soal"],
  },
  {
    label: "Buat pengumuman",
    href: "/admin/pengumuman/create",
    icon: Bell,
    keywords: ["tambah pengumuman", "announcement"],
  },
  {
    label: "Tambah FAQ",
    href: "/admin/faq/create",
    icon: BookOpen,
    keywords: ["buat faq", "pertanyaan umum"],
  },
  {
    label: "Tambah kategori",
    href: "/admin/master-data/program/create",
    icon: Tags,
    keywords: ["buat kategori", "program baru"],
  },
];
