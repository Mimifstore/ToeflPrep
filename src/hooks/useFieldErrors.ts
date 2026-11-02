"use client";

import { useCallback, useState } from "react";
import { focusFirstError, type FieldErrors } from "@/libs/form-errors";

/**
 * State error per field untuk form.
 * - show(errors): tampilkan semua error sekaligus, lalu scroll + fokus ke field pertama yang salah.
 * - clear(key): hapus error satu field (dipanggil saat user mulai memperbaikinya).
 */
export function useFieldErrors() {
  const [errors, setErrors] = useState<FieldErrors>({});

  const show = useCallback((next: FieldErrors) => {
    setErrors(next);
    // tunggu React selesai menggambar penanda error baru, baru fokus
    requestAnimationFrame(() => requestAnimationFrame(() => focusFirstError()));
  }, []);

  const clear = useCallback((key: string) => {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const reset = useCallback(() => setErrors({}), []);

  return { errors, show, clear, reset };
}
