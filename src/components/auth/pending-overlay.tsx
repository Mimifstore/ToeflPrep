"use client";

import { useFormStatus } from "react-dom";
import BrandLoader from "@/components/Ui/BrandLoader";

/**
 * Taruh DI DALAM <form>. Saat form sedang diproses (login / OAuth), logo loader menutupi halaman
 * sampai pindah ke dashboard, jadi tidak ada layar "kosong" di antaranya.
 * Jeda 300ms: login yang gagal biasanya balik lebih cepat dari itu, jadi nggak ada kedip logo.
 */
export default function AuthPendingOverlay() {
  const { pending } = useFormStatus();
  if (!pending) return null;

  return <BrandLoader variant="overlay" delay={300} />;
}
