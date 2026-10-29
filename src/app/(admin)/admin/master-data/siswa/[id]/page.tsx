"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DetailSiswa from "@/components/dashboardAdmin/masterData/siswa/DetailSiswa";

export default function DetailSiswaPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/siswa/${id}`);
      if (!res.ok) return;

      const result = await res.json();
      setData(result);
    };

    if (id) fetchData();
  }, [id]);

  // 🔥 LOADING SPINNER (BULET MUTER)
  if (!data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <DetailSiswa data={data} onBack={() => router.back()} />;
}

