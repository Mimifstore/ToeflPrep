"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Gift } from "lucide-react";
import { ActionButton } from "@/components/dashboardUser/ui/ActionButton";

type Props = {
  ujianId: string;
  size?: "sm" | "md";
  fullWidth?: boolean;
  children?: React.ReactNode;
};

export default function FreeAccessButton({
  ujianId,
  size = "md",
  fullWidth = false,
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
    <ActionButton
      onClick={handleFreeAccess}
      loading={loading}
      variant="success"
      icon={Gift}
      size={size}
      fullWidth={fullWidth}
    >
      {children || "Ambil Akses"}
    </ActionButton>
  );
}
