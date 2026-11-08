/** Bentuk data fitur Try Out (kategori, daftar ujian, detail ujian) di sisi siswa. */

export type ProgramItem = {
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  /** Jumlah paket ujian di kategori ini. */
  _count?: { ujians: number };
};

/** Kolom waktu pengerjaan sebuah ujian. */
export type UjianDuration = {
  /** SINGLE = satu batas waktu total, PER_SECTION = tiap section punya batas sendiri. */
  timeType: string;
  totalTime: number | null;
  listeningTime: number | null;
  structureTime: number | null;
  readingTime: number | null;
};

export type UjianItem = UjianDuration & {
  id: string;
  title: string;
  description: string | null;
  price: number;
  /** false = belum lengkap (tanpa soal atau durasi), belum aman dibeli atau dikerjakan. */
  ready: boolean;
};

export type ExamDetail = UjianDuration & {
  id: string;
  title: string;
  description: string | null;
  programId: string;
  program: { name: string };
  /** 0 = tanpa batas. */
  maxExitAttempts: number;
};

/** Data peserta yang boleh sampai ke browser. Sengaja tanpa field lain dari tabel User. */
export type ExamParticipant = {
  name: string | null;
  email: string | null;
};
