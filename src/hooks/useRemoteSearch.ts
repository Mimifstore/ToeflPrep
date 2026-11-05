import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeQuery } from "@/libs/admin-search-utils";

export type SearchStatus = "idle" | "loading" | "ready" | "error";

type UseRemoteSearchOptions = {
  /** Endpoint yang menerima `?q=` dan membalas `{ items: [...] }`. */
  endpoint: string;
  query: string;
  /** false = jendela pencarian tertutup: state dan cache dikosongkan. */
  enabled: boolean;
  /** Query lebih pendek dari ini nggak dikirim ke server. */
  minLength: number;
};

const DEBOUNCE_MS = 250;
const CACHE_LIMIT = 30;

/**
 * Cari data lewat endpoint API.
 * - Ditunda 250ms biar nggak nembak server tiap ketukan.
 * - Request lama dibatalkan kalau query berubah (hasil basi nggak bisa menimpa yang baru).
 * - Hasil di-cache selama jendela pencarian terbuka, jadi hapus-ketik (backspace) terasa instan.
 */
export function useRemoteSearch<T>({
  endpoint,
  query,
  enabled,
  minLength,
}: UseRemoteSearchOptions) {
  const [state, setState] = useState<{ items: T[]; status: SearchStatus }>({
    items: [],
    status: "idle",
  });
  const [attempt, setAttempt] = useState(0);
  const cache = useRef(new Map<string, T[]>());

  const term = normalizeQuery(query);

  useEffect(() => {
    if (!enabled) {
      cache.current.clear();
      setState({ items: [], status: "idle" });
      return;
    }
    if (term.length < minLength) {
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
        const res = await fetch(`${endpoint}?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as { items: T[] };
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
  }, [endpoint, term, enabled, minLength, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}
