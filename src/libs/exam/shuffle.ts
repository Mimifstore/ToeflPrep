// Acak yang STABIL: seed yang sama selalu menghasilkan urutan yang sama.
// Dipakai untuk mengacak pilihan jawaban per peserta: refresh halaman atau membuka pembahasan
// tidak mengubah urutan yang dilihat peserta saat ujian, tanpa perlu menyimpan urutannya di database.

/** Hash string → angka 32-bit (cyrb128 versi ringkas). */
function hashSeed(seed: string): number {
  let h1 = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h1 = Math.imul(h1 ^ seed.charCodeAt(i), 3432918353);
    h1 = (h1 << 13) | (h1 >>> 19);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 = Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 ^= h1 >>> 16) >>> 0;
}

/** Pseudo-random 0..1 dari seed (mulberry32). */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates dengan seed. Tidak mengubah array asli. */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const result = [...items];
  const random = mulberry32(hashSeed(seed));
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
