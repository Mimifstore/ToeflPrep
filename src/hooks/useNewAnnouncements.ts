import { useEffect, useState } from "react";
import { ANNOUNCEMENTS_HREF } from "@/constants/user-navigation";
import { isPathActive } from "@/libs/admin-nav";

const SEEN_AT_KEY = "user_announcements_seen_at";

/** Badge menampilkan maksimal "9+", jadi 10 pengumuman terbaru sudah cukup untuk dihitung. */
const FETCH_LIMIT = 10;

/** Siswa yang belum pernah membuka Pengumuman: hitung yang terbit dalam 7 hari terakhir. */
const FIRST_VISIT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function readSeenAt(): number {
  try {
    const stored = Number(window.localStorage.getItem(SEEN_AT_KEY));
    if (Number.isFinite(stored) && stored > 0) return stored;
  } catch {
    // Storage tidak tersedia: pakai batas bawaan.
  }
  return Date.now() - FIRST_VISIT_WINDOW_MS;
}

function markSeen() {
  try {
    window.localStorage.setItem(SEEN_AT_KEY, String(Date.now()));
  } catch {
    // Storage tidak tersedia: badge muncul lagi di kunjungan berikutnya.
  }
}

/**
 * Jumlah pengumuman yang terbit setelah siswa terakhir membuka halaman Pengumuman.
 * Penanda "sudah dilihat" disimpan di browser (localStorage), jadi berlaku per perangkat.
 */
export function useNewAnnouncements(pathname: string): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Lagi membuka Pengumuman = semuanya dianggap sudah dibaca.
    if (isPathActive(pathname, ANNOUNCEMENTS_HREF)) {
      markSeen();
      setCount(0);
      return;
    }

    const controller = new AbortController();

    fetch(`/api/announcement?limit=${FETCH_LIMIT}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        const items: { createdAt: string }[] = result?.data ?? [];
        const seenAt = readSeenAt();
        setCount(
          items.filter((item) => new Date(item.createdAt).getTime() > seenAt)
            .length,
        );
      })
      .catch(() => {
        // Gagal atau dibatalkan karena pindah halaman: biarkan hitungan sebelumnya.
      });

    return () => controller.abort();
  }, [pathname]);

  return count;
}
