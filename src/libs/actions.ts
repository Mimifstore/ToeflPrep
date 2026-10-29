"use server";
import { RegisterSchema, signInSchema } from "./zod";
import { hashSync } from "bcrypt-ts";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";
import { signIn } from "../../auth";
import { AuthError } from "next-auth";
import { rateLimit } from "./rate-limit";
import { headers } from "next/headers"; // 🔥 BARU — buat ambil IP di Server Action

export const signUpCredentials = async (
  prevState: unknown,
  formData: FormData
) => {
  const validatedField = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedField.success) {
    return {
      error: validatedField.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedField.data;

  // 🔥 RATE LIMIT — cegah spam registrasi
  // Server Action gak punya objek Request langsung, jadi ambil IP dari headers()
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

  const ipLimit = rateLimit({
    key: `register-ip:${ip}`,
    limit: 30,
    windowMs: 15 * 60 * 1000, // 30 pendaftaran / 15 menit / IP
  });

  if (!ipLimit.success) {
    const waitMinutes = Math.ceil((ipLimit.resetAt - Date.now()) / 60000);
    return { message: `Terlalu banyak percobaan registrasi. Coba lagi dalam ${waitMinutes} menit.` };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { message: "Email sudah terdaftar" };
  }

  const hashedPassword = hashSync(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    await prisma.siswa.create({
      data: {
        userId: newUser.id,
        name: newUser.name || null,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return { message: "Gagal mendaftarkan user" };
  }

  redirect("/login");
};

export const signInCredentials = async (
  prevState: unknown,
  formData: FormData
) => {
  const validatedField = signInSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedField.success) {
    return {
      error: validatedField.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedField.data;

  // 🔥 RATE LIMIT — max 5 percobaan login per email per 5 menit
  const { success, resetAt } = rateLimit({
    key: `login:${email}`,
    limit: 5,
    windowMs: 5 * 60 * 1000,
  });

  if (!success) {
    const waitMinutes = Math.ceil((resetAt - Date.now()) / 60000);
    return { message: `Terlalu banyak percobaan login. Coba lagi dalam ${waitMinutes} menit.` };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: "Email atau password salah" };
    }

    if (!user.isActive) {
      return { message: "Akun anda telah dinonaktifkan" };
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { message: "Email atau password salah" };
    }

    if (user.role === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/user");
    }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Email atau password salah" };
        default:
          return { message: "Terjadi kesalahan, coba lagi" };
      }
    }
    throw error;
  }
};