import { z } from "zod";

type IntOptions = {
  /** true = kosong ditolak ("wajib diisi"). */
  required?: boolean;
  /** Nilai bila dikosongkan dan tidak wajib. Default: null. */
  fallback?: number | null;
};

/** Bilangan bulat dari input teks/angka: kosong, bukan angka, pecahan, dan di luar batas ditolak dengan pesan jelas. */
export const intField = (label: string, min: number, max: number, opts: IntOptions = {}) =>
  z.any().transform((value, ctx): number | null => {
    const blank =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "");

    if (blank) {
      if (opts.required) {
        ctx.addIssue({ code: "custom", message: `${label} wajib diisi` });
        return z.NEVER;
      }
      return opts.fallback ?? null;
    }

    const n = typeof value === "number" ? value : Number(String(value).trim());
    if (!Number.isFinite(n)) {
      ctx.addIssue({ code: "custom", message: `${label} harus berupa angka` });
      return z.NEVER;
    }
    if (!Number.isInteger(n)) {
      ctx.addIssue({ code: "custom", message: `${label} harus bilangan bulat` });
      return z.NEVER;
    }
    if (n < min) {
      ctx.addIssue({ code: "custom", message: `${label} minimal ${min}` });
      return z.NEVER;
    }
    if (n > max) {
      ctx.addIssue({ code: "custom", message: `${label} maksimal ${max}` });
      return z.NEVER;
    }
    return n;
  });
