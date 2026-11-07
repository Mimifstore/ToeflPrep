import { useCallback, useEffect, useState } from "react";

export type ApiStatus = "loading" | "ready" | "error";

type State<T> = { data: T | null; status: ApiStatus };

/**
 * Ambil data dari endpoint GET (JSON).
 * - Ganti `url` (mis. pindah halaman) → status kembali "loading" dan request lama dibatalkan.
 * - `data` terakhir tetap dipegang selama "loading", jadi info seperti total/jumlah halaman tidak berkedip.
 * - Gagal (jaringan atau status bukan 2xx) → status "error", dan `reload()` mencoba lagi.
 */
export function useApiData<T>(url: string) {
  const [state, setState] = useState<State<T>>({ data: null, status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ data: prev.data, status: "loading" }));

    fetch(url, { signal: controller.signal, cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<T>;
      })
      .then((data) => setState({ data, status: "ready" }))
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ data: null, status: "error" });
      });

    return () => controller.abort();
  }, [url, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, reload };
}
