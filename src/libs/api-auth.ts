import { auth } from "../../auth";
import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "./rate-limit";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }
  return { error: null, session };
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }
  if (session.user.role !== "ADMIN") {
    return {
      error: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
      session: null,
    };
  }
  return { error: null, session };
}

// RATE LIMIT untuk endpoint sensitif (payment, submit, dll)
export function checkRateLimit(
  req: Request,
  options: { limit: number; windowMs: number; prefix: string },
) {
  const ip = getClientIp(req);
  const { success, resetAt } = rateLimit({
    key: `${options.prefix}:${ip}`,
    limit: options.limit,
    windowMs: options.windowMs,
  });

  if (!success) {
    const waitSeconds = Math.ceil((resetAt - Date.now()) / 1000);
    return {
      error: NextResponse.json(
        {
          message: `Terlalu banyak request. Coba lagi dalam ${waitSeconds} detik.`,
        },
        { status: 429 },
      ),
    };
  }

  return { error: null };
}

//  RATE LIMIT per USER (untuk endpoint yang sudah login).
// Lebih adil dari per IP kalau banyak peserta berbagi satu jaringan.
export function checkUserRateLimit(
  userId: string,
  options: { limit: number; windowMs: number; prefix: string },
) {
  const { success, resetAt } = rateLimit({
    key: `${options.prefix}:user:${userId}`,
    limit: options.limit,
    windowMs: options.windowMs,
  });

  if (!success) {
    const waitSeconds = Math.ceil((resetAt - Date.now()) / 1000);
    return {
      error: NextResponse.json(
        {
          message: `Terlalu banyak request. Coba lagi dalam ${waitSeconds} detik.`,
        },
        { status: 429 },
      ),
    };
  }

  return { error: null };
}
