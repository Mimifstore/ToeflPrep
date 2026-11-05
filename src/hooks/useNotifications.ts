import { useCallback, useEffect, useRef, useState } from "react";
import type { NotificationItem, NotificationListResponse } from "@/types/notification";

export type NotificationStatus = "idle" | "loading" | "ready" | "error";

/** Jeda cek jumlah belum dibaca (hanya saat tab terlihat). */
const POLL_MS = 60_000;
const PAGE_SIZE = 20;

const isAbort = (error: unknown) =>
  error instanceof DOMException && error.name === "AbortError";

/**
 * Notifikasi siswa.
 * - Jumlah belum dibaca dicek berkala (60 detik), dan saat tab/jendela kembali aktif.
 * - Daftar notifikasi baru dimuat saat panel dibuka (`open`), lalu dimuat ulang kalau ada yang baru masuk.
 * - Tandai dibaca bersifat optimistis: tampilan langsung berubah, kalau server gagal disamakan ulang.
 */
export function useNotifications(open: boolean) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [status, setStatus] = useState<NotificationStatus>("idle");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Nilai terbaru untuk dibaca di dalam callback tanpa membuatnya berganti terus.
  const openRef = useRef(open);
  const itemsRef = useRef(items);
  const countRef = useRef(0);
  useEffect(() => {
    openRef.current = open;
    itemsRef.current = items;
  }, [open, items]);

  const reload = useCallback(() => setReloadKey((n) => n + 1), []);

  const applyCount = useCallback((count: number) => {
    countRef.current = count;
    setUnreadCount(count);
  }, []);

  // --- Cek jumlah belum dibaca berkala ---
  useEffect(() => {
    const controller = new AbortController();

    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/user/notifications/unread-count", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) return;

        const { unreadCount: count } = (await res.json()) as { unreadCount: number };
        // Ada yang baru masuk saat panel terbuka: muat ulang daftarnya.
        if (count > countRef.current && openRef.current) reload();
        applyCount(count);
      } catch {
        // Gagal atau dibatalkan: pakai angka sebelumnya.
      }
    };

    void refresh();
    const timer = setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      controller.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [applyCount, reload]);

  // --- Muat daftar saat panel dibuka ---
  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    // Daftar lama tetap tampil selama dimuat ulang, biar nggak berkedip.
    setStatus((prev) => (prev === "ready" ? prev : "loading"));

    fetch(`/api/user/notifications?limit=${PAGE_SIZE}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<NotificationListResponse>;
      })
      .then((data) => {
        setItems(data.items);
        setNextCursor(data.nextCursor);
        applyCount(data.unreadCount);
        setStatus("ready");
      })
      .catch((error) => {
        if (!isAbort(error)) setStatus("error");
      });

    return () => controller.abort();
  }, [open, reloadKey, applyCount]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/user/notifications?limit=${PAGE_SIZE}&cursor=${encodeURIComponent(nextCursor)}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as NotificationListResponse;
      setItems((prev) => {
        const known = new Set(prev.map((item) => item.id));
        return [...prev, ...data.items.filter((item) => !known.has(item.id))];
      });
      setNextCursor(data.nextCursor);
    } catch {
      // Tombol "Muat lebih banyak" tetap ada, bisa dicoba lagi.
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore]);

  const sendRead = useCallback(
    async (payload: { ids: string[] } | { all: true }) => {
      try {
        const res = await fetch("/api/user/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          // Tetap terkirim walau halaman langsung berpindah setelah klik.
          keepalive: true,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const { unreadCount: count } = (await res.json()) as { unreadCount: number };
        applyCount(count);
      } catch {
        // Gagal: samakan lagi dengan server.
        reload();
      }
    },
    [applyCount, reload],
  );

  /** Tandai satu notifikasi dibaca. Yang sudah dibaca diabaikan. */
  const markRead = useCallback(
    (id: string) => {
      const target = itemsRef.current.find((item) => item.id === id);
      if (!target || target.read) return;

      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
      applyCount(Math.max(0, countRef.current - 1));
      void sendRead({ ids: [id] });
    },
    [applyCount, sendRead],
  );

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((item) => (item.read ? item : { ...item, read: true })));
    applyCount(0);
    void sendRead({ all: true });
  }, [applyCount, sendRead]);

  return {
    unreadCount,
    items,
    status,
    hasMore: nextCursor !== null,
    loadingMore,
    loadMore,
    retry: reload,
    markRead,
    markAllRead,
  };
}
