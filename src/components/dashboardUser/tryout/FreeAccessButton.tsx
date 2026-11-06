"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Busy from "@/components/Ui/Busy";

type Props = {
  ujianId: string;
  className?: string;
  children?: React.ReactNode;
};

export default function FreeAccessButton({
  ujianId,
  className,
  children,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFreeAccess = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payment/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ujianId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mendapatkan akses");

      toast.success("Akses berhasil didapatkan");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFreeAccess}
      disabled={loading}
      className={`w-full disabled:opacity-50 ${className || ""}`}
    >
      <Busy loading={loading} text="Memproses...">
        {children || "Mulai Gratis"}
      </Busy>
    </button>
  );
}
