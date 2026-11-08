"use client";

import { useState } from "react";
import Image from "next/image";

type ProgramCoverProps = {
  name: string;
  image: string | null;
  /** Ukuran dan sudut, mis. "h-40 w-full rounded-xl". */
  className?: string;
};

/**
 * Gambar sampul kategori. Kalau gambarnya kosong atau gagal dimuat, diganti blok gradien
 * dengan huruf pertama nama kategori (tanpa bergantung pada file gambar bawaan).
 */
export default function ProgramCover({ name, image, className = "" }: ProgramCoverProps) {
  const [failed, setFailed] = useState(false);

  if (!image || failed) {
    return (
      <div
        aria-hidden="true"
        className={`flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100 ${className}`}
      >
        <span className="text-4xl font-bold text-blue-300">
          {name.trim().charAt(0).toUpperCase() || "?"}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gray-50 ${className}`}>
      <Image
        src={image}
        alt={name}
        fill
        sizes="(min-width: 1024px) 320px, (min-width: 768px) 45vw, 100vw"
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
