"use client";

import { useEffect, useState } from "react";
import { getInitial } from "@/libs/avatar";

type AvatarProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "h-8 w-8 text-sm",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

/**
 * Foto profil kalau ada, kalau nggak ada (atau gagal dimuat) jadi huruf depan nama.
 * Pakai <img> biasa, bukan next/image: foto bisa datang dari Google/GitHub/Supabase
 * dan next/image menolak domain yang belum didaftarkan.
 */
export default function Avatar({
  name,
  email,
  image,
  size = "md",
  className = "",
}: AvatarProps) {
  const [failed, setFailed] = useState(false);

  // URL berganti → coba lagi, jangan terjebak di status gagal dari URL sebelumnya.
  useEffect(() => setFailed(false), [image]);

  const showImage = !!image && !failed;

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-blue-100 font-semibold text-blue-700 ${SIZES[size]} ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          referrerPolicy="no-referrer"
          draggable={false}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        getInitial(name, email)
      )}
    </span>
  );
}
