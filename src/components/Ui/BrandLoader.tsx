"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type BrandLoaderProps = {
  /** "screen": layar penuh abu muda (setelah login / buka dashboard). "overlay": menutupi halaman yang sedang tampil. */
  variant?: "screen" | "overlay";
  /**
   * Jeda (ms) sebelum muncul. Kalau prosesnya selesai lebih cepat dari ini, loader nggak pernah
   * terlihat, jadi nggak ada kedip logo sekilas.
   */
  delay?: number;
  /** Lewat dari ini (ms) tombol "Muat ulang" muncul, supaya user tidak terjebak kalau ada yang macet. */
  slowAfterMs?: number;
};

/**
 * Logo yang terisi warna perlahan (loop). Sengaja tanpa teks.
 * Dua lapisan logo: dasar abu pucat + lapisan berwarna yang "naik" lewat clip-path (lihat `brand-fill`).
 */
export default function BrandLoader({
  variant = "screen",
  delay = 150,
  slowAfterMs = 15000,
}: BrandLoaderProps) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), slowAfterMs);
    return () => clearTimeout(timer);
  }, [slowAfterMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat"
      style={{ animationDelay: `${delay}ms` }}
      className={`fixed inset-0 z-50 flex animate-brand-in flex-col items-center justify-center ${
        variant === "screen" ? "bg-gray-50" : "bg-white/90"
      }`}
    >
      <div className="relative h-16 w-16">
        <Image
          src="/images/logo-mark.png"
          alt=""
          width={64}
          height={64}
          priority
          className="h-16 w-16 opacity-25 grayscale"
        />
        <Image
          src="/images/logo-mark.png"
          alt=""
          width={64}
          height={64}
          priority
          className="absolute inset-0 h-16 w-16 animate-brand-fill motion-reduce:animate-none"
        />
      </div>

      {slow && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-10 animate-brand-in rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          Muat ulang
        </button>
      )}
    </div>
  );
}
