"use client";

import UjianTable from "@/components/dashboardAdmin/ujian/UjianTable";

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold  text-gray-700">Ujian</h1>
      <UjianTable />
    </div>
  );
}
