"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeQuery } from "@/libs/admin-search-utils";
import {
  ADMIN_SEARCH_MIN_LENGTH,
  type AdminSearchItem,
  type AdminSearchResponse,
} from "@/types/admin-search";

export type AdminSearchStatus = "idle" | "loading" | "ready" | "error";

const DEBOUNCE_MS = 250;
const CACHE_LIMIT = 30;

/**
 * Cari data admin lewat /api/search.
 * - Ditunda 250ms biar nggak nembak server tiap ketukan.
 * - Request lama dibatalkan kalau query berubah (hasil basi nggak bisa menimpa yang baru).
 * - Hasil di-cache selama jendela pencarian terbuka, jadi hapus-ketik (backspace) terasa instan.
 */
export function useAdminSearch(query: string, enabled: boolean) {
  const [state, setState] = useState<{
    items: AdminSearchItem[];
    status: AdminSearchStatus;
  }>({ items: [], status: "idle" });
  const [attempt, setAttempt] = useState(0);
  const cache = useRef(new Map<string, AdminSearchItem[]>());

  const term = normalizeQuery(query);

  useEffect(() => {
    if (!enabled) {
      cache.current.clear();
      setState({ items: [], status: "idle" });
      return;
    }
    if (term.length < ADMIN_SEARCH_MIN_LENGTH) {
      setState({ items: [], status: "idle" });
      return;
    }

    const key = term.toLowerCase();
    const cached = cache.current.get(key);
    if (cached) {
      setState({ items: cached, status: "ready" });
      return;
    }

    // Hasil sebelumnya tetap tampil selama memuat, biar daftar nggak berkedip.
    setState((prev) => ({ items: prev.items, status: "loading" }));

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as AdminSearchResponse;
        if (cache.current.size >= CACHE_LIMIT) {
          const oldest = cache.current.keys().next().value;
          if (oldest !== undefined) cache.current.delete(oldest);
        }
        cache.current.set(key, data.items);
        setState({ items: data.items, status: "ready" });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ items: [], status: "error" });
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, enabled, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}
