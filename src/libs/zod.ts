import { object, string } from "zod";

export const signInSchema = object({
  email: string()
    .trim()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: string()
    .min(8, "Password minimal 8 karakter")
    .max(32, "Password maksimal 32 karakter"),
});

export const RegisterSchema = object({
  name: string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh berisi huruf dan spasi"),
  email: string()
    .trim()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: string()
    .min(8, "Password minimal 8 karakter")
    .max(32, "Password maksimal 32 karakter"),
  ConfirmPassword: string()
    .min(8, "Password minimal 8 karakter")
    .max(32, "Password maksimal 32 karakter"),
}).refine((data) => data.password === data.ConfirmPassword, {
  message: "Konfirmasi password tidak sama",
  path: ["ConfirmPassword"],
});