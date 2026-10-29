import { Card } from "@/components/Ui/Card";
import { Home } from "lucide-react";
import Link from "next/link";
import { AnnounCementTable } from "@/components/dashboardUser/announCement/AnnounCementTable";

export default function PengumumanPage() {
  return (
    <div className="p-4 md:p-2">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-700 md:hidden">
          Pengumuman
        </h1>

        <div className="hidden md:flex items-center text-sm text-gray-500">
          <span className="font-semibold text-xl mx-3">Pengumuman</span>
          <span className="mx-3 text-2xl">|</span>
          <Link href="/user/dashboard" className="mx-2 text-blue-600">
            <Home className="w-4 h-4" />
          </Link>
          <span className="mx-2 text-2xl">›</span>
          <span className="text-gray-700 font-medium">
            Data Pengumuman
          </span>
        </div>
      </div>

      <div className="shadow-lg">
        <Card className="p-4">
          <AnnounCementTable />
        </Card>
      </div>
    </div>
  );
}