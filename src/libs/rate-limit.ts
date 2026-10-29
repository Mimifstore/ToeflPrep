type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

// 🔥 CLEANUP otomatis setiap 10 menit biar memory tidak bocor
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 10 * 60 * 1000);

type RateLimitOptions = {
  key: string;       // identifier unik (misal: IP, email, userId)
  limit: number;      // max request
  windowMs: number;   // periode waktu dalam ms
};

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): {
  success: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = store.get(key);

  // 🔥 Belum ada entry atau window sudah lewat → reset
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  // 🔥 Sudah melebihi limit
  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  // 🔥 Increment
  entry.count++;
  store.set(key, entry);

  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

// 🔥 HELPER — ambil IP dari request
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}