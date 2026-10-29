import { useEffect, useState } from "react";
import {
  ChartArea,
  LayoutGrid,
  PenBox,
  Text,
  User,
  UserMinus,
  Wallet,
  WalletCards,
} from "lucide-react";

export default function StatCards() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const data = [
    {
      title: "Total Siswa",
      value: stats.totalUser || 0,
      color: "text-white",
      bg: "bg-blue-500",
      colors: "text-white",
      icon: <User className="w-7 h-7" strokeWidth={3} />,
    },
    {
      title: "Total Akun Aktif",
      value: stats.activeUser || 0,
      color: "text-white",
      bg: "bg-green-500",
      colors: "text-white",
      icon: <User className="w-7 h-7" strokeWidth={3} />,
    },
    {
      title: "Total Akun Non Aktif",
      value: stats.nonActiveUser || 0,
      color: "text-white",
      bg: "bg-red-500",
      colors: "text-white",
      icon: <UserMinus className="w-7 h-7" strokeWidth={3} />,
    },
    {
      title: "Total Siswa Menjadi Member",
      value: stats.memberUser || 0,
      color: "text-white",
      bg: "bg-yellow-500",
      colors: "text-white",
      icon: <Text className="w-7 h-7" strokeWidth={3} />,
    },
    {
      title: "Transaksi Hari Ini",
      value: stats.transaksiHariIni || 0,
      color: "bg-gradient-to-tr from-yellow-400 to-yellow-600",
      colors: "text-gray-400",
      border: "border-yellow-400",
      icon: <PenBox className="w-6 h-6" strokeWidth={3} />,
    },
    {
      title: "Total Transaksi Bulan Ini",
      value: stats.transaksiBulanIni || 0,
      color: "bg-gradient-to-tl from-red-400 to-red-600",
      colors: "text-gray-400",
      border: "border-red-400",
      icon: <LayoutGrid className="w-6 h-6" strokeWidth={3} />,
    },
    {
      title: "Total Transaksi Tahun Ini",
      value: stats.transaksiTahunIni || 0,
      color: "bg-gradient-to-tr from-green-400 to-green-600",
      colors: "text-gray-400",
      border: "border-green-400",
      icon: <WalletCards className="w-6 h-6" strokeWidth={3} />,
    },
    {
      title: "Total Pemasukan Bulan Ini",
      value: stats.pemasukanBulan
        ? `Rp ${stats.pemasukanBulan.toLocaleString("id-ID")}`
        : "Rp 0",
      color: "bg-gradient-to-tl from-blue-400 to-blue-600",
      colors: "text-gray-400",
      border: "border-blue-400",
      icon: <ChartArea className="w-6 h-6" strokeWidth={3} />,
    },
    {
      title: "Transaksi Pending",
      value: stats.pending || 0,
      color: "bg-gradient-to-tr from-blue-400 to-blue-600",
      colors: "text-gray-400",
      border: "border-blue-400",
      icon: <Wallet className="w-6 h-6" strokeWidth={3} />,
    },
    {
      title: "Transaksi Dibayar",
      value: stats.success || 0,
      color: "bg-gradient-to-tl from-green-400 to-green-600",
      colors: "text-gray-400",
      border: "border-green-400",
      icon: <Wallet className="w-6 h-6" strokeWidth={3} />,
    },
    {
      title: "Transaksi Filed",
      value: stats.failed || 0,
      color: "bg-gradient-to-tr from-red-400 to-red-600",
      colors: "text-gray-400",
      border: "border-red-400",
      icon: <Wallet className="w-6 h-6" strokeWidth={3} />,
    },
    {
      title: "Transaksi Selesai",
      value: stats.success || 0,
      color: "bg-gradient-to-tl from-yellow-400 to-yellow-600",
      colors: "text-gray-400",
      border: "border-yellow-400",
      icon: <Wallet className="w-6 h-6" strokeWidth={3} />,
    },
  ];

  const mobileData = data.slice(0, 4);

  return (
    <>
      {/* MOBILE */}
      <div className="md:hidden space-y-3">
        {mobileData.map((s) => (
          <div
            key={s.title}
            className={`${s.bg} p-4 rounded-2xl shadow flex items-center justify-between`}
          >
            <div>
              <div className="text-white/80 text-xs">{s.title}</div>
              <div className="text-xl font-bold text-white">
                {loading ? "..." : s.value}
              </div>
            </div>

            <div className={`w-10 h-10 rounded-md flex items-center justify-center ${s.color} text-white`}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-4 gap-4">
        {data.map((s) => (
          <div
            key={s.title}
            className={`${s.bg} p-4 rounded-2xl shadow-lg border-l-4 ${s.border} flex items-center justify-between`}
          >
            <div>
              <div className={`${s.colors} text-sm`}>{s.title}</div>
              <div className={`text-2xl font-bold ${s.colors}`}>
                {loading ? "..." : s.value}
              </div>
            </div>
            <div
              className={`w-12 h-12 rounded-md flex items-center justify-center ${s.color} text-white`}
            >
              {s.icon}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}