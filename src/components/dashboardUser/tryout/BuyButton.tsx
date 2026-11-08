"use client";

import { useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { ActionButton } from "@/components/dashboardUser/ui/ActionButton";

type Props = {
  ujianId: string;
  size?: "sm" | "md";
  fullWidth?: boolean;
  children?: React.ReactNode;
};

// Akses diberikan oleh callback Midtrans yang bisa terlambat beberapa detik.
// Setelah popup melaporkan sukses, tunggu sampai akses benar-benar aktif.
const POLL_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 2000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function BuyButton({ ujianId, size = "md", fullWidth = false, children }: Props) {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const waitForAccess = async (): Promise<boolean> => {
    for (let i = 0; i < POLL_ATTEMPTS; i++) {
      if (!mountedRef.current) return false;

      try {
        const res = await fetch(
          `/api/payment/status?ujianId=${encodeURIComponent(ujianId)}`,
          { cache: "no-store" },
        );
        if (res.ok) {
          const data = await res.json();
          if (data.hasAccess) return true;
        }
      } catch {
        // jaringan sesaat bermasalah: coba lagi
      }

      await sleep(POLL_INTERVAL_MS);
    }
    return false;
  };

  const handlePaid = async () => {
    toast.loading("Memverifikasi pembayaran...", { id: "payment" });

    const ok = await waitForAccess();

    if (ok) {
      toast.success("Pembayaran berhasil, akses aktif", { id: "payment" });
      if (mountedRef.current) router.refresh();
      return;
    }

    toast(
      "Pembayaran diterima. Akses akan aktif sebentar lagi, muat ulang halaman jika belum muncul.",
      {
        id: "payment",
        duration: 8000,
      },
    );
  };

  const handleBuy = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/payment", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ujianId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal membuat pembayaran");
      }

      if (!window.snap) {
        toast.error("Midtrans belum siap");

        return;
      }

      window.snap.pay(data.token, {
        onSuccess: function () {
          handlePaid();
        },

        onPending: function () {
          toast.success("Menunggu pembayaran");
        },

        onError: function () {
          toast.error("Pembayaran gagal");
        },

        onClose: function () {
          toast("Popup pembayaran ditutup");
        },
      });
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActionButton
      onClick={handleBuy}
      loading={loading}
      icon={ShoppingCart}
      size={size}
      fullWidth={fullWidth}
    >
      {children || "Beli Paket"}
    </ActionButton>
  );
}
