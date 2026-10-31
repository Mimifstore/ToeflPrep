import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        // Logo terisi warna dari bawah ke atas, tahan sebentar, memudar, lalu ulang (BrandLoader).
        'brand-fill': {
          '0%': { clipPath: 'inset(100% 0 0 0)', opacity: '1' },
          '60%': { clipPath: 'inset(0 0 0 0)', opacity: '1' },
          '85%': { clipPath: 'inset(0 0 0 0)', opacity: '1' },
          '100%': { clipPath: 'inset(0 0 0 0)', opacity: '0' },
        },
        'brand-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'brand-fill': 'brand-fill 1.8s ease-in-out infinite',
        // `both` = tetap transparan selama animation-delay, jadi loader baru kelihatan kalau prosesnya lama.
        'brand-in': 'brand-in 200ms ease-out both',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
            color: {
                primary: '#f97316',
                accent: '#2563eb',
                secondary: '#eeeeee',
                dark: '#222831',
                darkMode: "class",
            }
          }
    },
  },
  plugins: [],
}
export default config
