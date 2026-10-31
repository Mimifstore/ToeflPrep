"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DetailSiswa from "@/components/dashboardAdmin/masterData/siswa/DetailSiswa";
import { DetailSkeleton } from "@/components/Ui/Skeleton";

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

  if (!data) return <DetailSkeleton />;

  return <DetailSiswa data={data} onBack={() => router.back()} />;
}

