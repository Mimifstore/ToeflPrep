import RekapTable from "@/components/dashboardAdmin/rekap/RekapTable";
import { Home, BarChart2 } from "lucide-react";
import Link from "next/link";

export default function RekapPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center text-sm text-gray-500 gap-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-xl text-gray-800">Rekap Nilai</span>
        </div>
        <span className="text-gray-300 text-xl">|</span>
        <Link href="/admin" className="text-blue-600 hover:text-blue-700">
          <Home className="w-4 h-4" />
        </Link>
        <span className="text-gray-400">›</span>
        <span className="text-gray-600 font-medium">Rekap Hasil Ujian</span>
      </div>

      <RekapTable />
    </div>
  );
}
