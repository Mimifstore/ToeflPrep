import { useEffect, useState } from "react";

export type ActiveExam = {
  /** ID sesi ujian yang masih berjalan. */
  id: string;
  title: string;
};

/**
 * Sesi ujian yang masih berjalan milik user, buat pintasan "Lanjutkan Ujian" di sidebar.
 * Dicek ulang tiap pindah halaman, karena layout nggak dirender ulang oleh server
 * saat navigasi di dalam dashboard.
 */
export function useActiveExam(pathname: string): ActiveExam | null {
  const [exam, setExam] = useState<ActiveExam | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/user/active-exam", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setExam(data.exam ?? null);
      })
      .catch(() => {
        // Gagal atau dibatalkan karena pindah halaman: biarkan status sebelumnya.
      });

    return () => controller.abort();
  }, [pathname]);

  return exam;
}
