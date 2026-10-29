/** @type {import('next').NextConfig} */

// 🔥 CSP — whitelist domain yang beneran dipake project ini:
// - 'self' buat semua asset dari domain sendiri
// - Midtrans Snap.js (sandbox & production, sesuai src/app/layout.tsx)
// - Supabase (gambar via next/image + koneksi API)
// - Google/GitHub avatar (foto profil akun yang login lewat OAuth)
// - Google/GitHub buat OAuth redirect
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.midtrans.com https://app.sandbox.midtrans.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://nfrfamcqqkbryfqmxokz.supabase.co https://lh3.googleusercontent.com https://avatars.githubusercontent.com;
  font-src 'self' data:;
  connect-src 'self' https://nfrfamcqqkbryfqmxokz.supabase.co https://app.midtrans.com https://app.sandbox.midtrans.com;
  frame-src 'self' https://app.midtrans.com https://app.sandbox.midtrans.com;
  form-action 'self' https://accounts.google.com https://github.com;
  frame-ancestors 'self';
`.replace(/\s{2,}/g, " ").trim();

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nfrfamcqqkbryfqmxokz.supabase.co"
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // 🔥 GANTI ke "Content-Security-Policy" (tanpa "-Report-Only")
            // SETELAH lu tes beberapa hari dan yakin gak ada yang keblokir.
            key: "Content-Security-Policy-Report-Only",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;