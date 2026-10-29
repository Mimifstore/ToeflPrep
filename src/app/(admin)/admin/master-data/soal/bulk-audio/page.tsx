"use client";

import Link from "next/link";
import BulkAudioUpload from "@/components/dashboardAdmin/masterData/soal/BulkAudioUpload";

export default function BulkAudioPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/admin/master-data/soal">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            Kembali
          </button>
        </Link>
      </div>
      <BulkAudioUpload />
    </div>
  );
}
