import {
  AppWindow,
  ArrowLeftRight,
  BarChart2,
  Bell,
  BookOpen,
  FileText,
  Home,
  ListChecks,
  Monitor,
  PenBoxIcon,
  Tags,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Kata lain yang bisa dipakai buat nyari menu ini lewat search sidebar. */
  keywords?: string[];
  /** true = aktif hanya kalau path-nya persis sama (dipakai Dashboard). */
  exact?: boolean;
};

export type AdminNavGroup = {
  label: string;
  /** Prefix path semua child, dipakai buat nentuin group lagi aktif / auto-open. */
  basePath: string;
  icon: LucideIcon;
  keywords?: string[];
  children: AdminNavLink[];
};

export type AdminNavItem = AdminNavLink | AdminNavGroup;

export type AdminNavSection = {
  /** Kosong = section tanpa judul. */
  title?: string;
  items: AdminNavItem[];
};

export const isNavGroup = (item: AdminNavItem): item is AdminNavGroup =>
  "children" in item;

export const ADMIN_NAV: AdminNavSection[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: Home,
        exact: true,
        keywords: ["beranda", "home", "ringkasan", "statistik"],
      },
    ],
  },
  {
    title: "Data",
    items: [
      {
        label: "Master Data",
        basePath: "/admin/master-data",
        icon: AppWindow,
        keywords: ["data master"],
        children: [
          {
            label: "User Account",
            href: "/admin/master-data/users",
            icon: Users,
            keywords: ["akun", "pengguna", "role", "admin"],
          },
          {
            label: "Siswa",
            href: "/admin/master-data/siswa",
            icon: User,
            keywords: ["peserta", "murid", "student"],
          },
          {
            label: "Kategori",
            href: "/admin/master-data/program",
            icon: Tags,
            keywords: ["program", "paket"],
          },
          {
            label: "Kategori Penilaian",
            href: "/admin/master-data/kategori-penilaian",
            icon: ListChecks,
            keywords: ["skor", "konversi", "score"],
          },
          {
            label: "Soal",
            href: "/admin/master-data/soal",
            icon: FileText,
            keywords: ["pertanyaan", "question", "bank soal", "audio"],
          },
        ],
      },
      {
        label: "Ujian",
        href: "/admin/ujian",
        icon: PenBoxIcon,
        keywords: ["tryout", "exam", "tes"],
      },
    ],
  },
  {
    title: "Konten",
    items: [
      {
        label: "Pengumuman",
        href: "/admin/pengumuman",
        icon: Bell,
        keywords: ["announcement", "info"],
      },
      {
        label: "FAQ",
        href: "/admin/faq",
        icon: BookOpen,
        keywords: ["pertanyaan umum", "bantuan"],
      },
    ],
  },
  {
    title: "Operasional",
    items: [
      {
        label: "Monitoring",
        href: "/admin/monitoring",
        icon: Monitor,
        keywords: ["live", "sesi", "peserta online", "force submit"],
      },
      {
        label: "Rekap Nilai",
        href: "/admin/rekap",
        icon: BarChart2,
        keywords: ["hasil", "skor", "export", "pdf", "excel"],
      },
      {
        label: "Transaksi",
        href: "/admin/transaksi",
        icon: ArrowLeftRight,
        keywords: ["pembayaran", "payment", "midtrans", "order"],
      },
    ],
  },
];
