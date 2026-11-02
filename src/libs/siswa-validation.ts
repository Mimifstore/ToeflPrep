import { z } from "zod";

// Skema ubah data siswa: dipakai halaman edit admin (client) DAN API (server).

/** "" / spasi saja dianggap tidak diisi (null), bukan string kosong. */
const blankToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const optionalText = (label: string, max: number) =>
  z.preprocess(
    blankToNull,
    z.string().trim().max(max, `${label} maksimal ${max} karakter`).nullable().optional(),
  );

export const SISWA_GENDERS = ["Laki-laki", "Perempuan"] as const;

export const siswaUpdateSchema = z.object({
  id: z.string("ID wajib diisi").min(1, "ID wajib diisi"),
  name: z
    .string("Nama wajib diisi")
    .trim()
    .min(1, "Nama wajib diisi")
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  phone: optionalText("No HP", 20).refine(
    (v) => v == null || /^[0-9+\-\s()]+$/.test(v),
    "No HP hanya boleh berisi angka, spasi, +, - dan tanda kurung",
  ),
  address: optionalText("Alamat", 255),
  gender: z.preprocess(
    blankToNull,
    z.enum(SISWA_GENDERS, "Pilih Laki-laki atau Perempuan").nullable().optional(),
  ),
  province: optionalText("Provinsi", 100),
  city: optionalText("Kota", 100),
  district: optionalText("Kecamatan", 100),
  village: optionalText("Desa", 100),
  isMember: z.boolean().optional(),
});
