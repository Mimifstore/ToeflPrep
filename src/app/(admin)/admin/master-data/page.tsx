import Link from "next/link";
import { User, BookOpen, Layers, FileText } from "lucide-react";

const menus = [
  {
    title: "User Account",
    desc: "Kelola akun pengguna",
    icon: <User className="w-6 h-6" />,
    href: "/admin/master-data/users",
  },
  {
    title: "Siswa",
    desc: "Data siswa / peserta",
    icon: <User className="w-6 h-6" />,
    href: "/admin/master-data/siswa",
  },
  {
    title: "Kategori",
    desc: "Kategori ujian",
    icon: <Layers className="w-6 h-6" />,
    href: "/admin/master-data/kategori",
  },
  {
    title: "Kategori Penilaian",
    desc: "Penilaian TOEFL",
    icon: <BookOpen className="w-6 h-6" />,
    href: "/admin/master-data/kategori-penilaian",
  },
  {
    title: "Soal",
    desc: "Bank soal TOEFL",
    icon: <FileText className="w-6 h-6" />,
    href: "/admin/master-data/soal",
  },
];

export default function MasterDataPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-700">
        Master Data
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menus.map((menu) => (
          <Link
            key={menu.title}
            href={menu.href}
            className="bg-white p-4 rounded-2xl shadow hover:shadow-md transition border"
          >
            <div className="flex items-center gap-3 mb-2 text-blue-600">
              {menu.icon}
              <h3 className="font-semibold">{menu.title}</h3>
            </div>
            <p className="text-sm text-gray-500">{menu.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}