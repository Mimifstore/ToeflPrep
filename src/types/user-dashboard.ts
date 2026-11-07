/** Bentuk data dari API `/api/user/*` yang dipakai dashboard siswa. */

export type ExerciseItem = {
  id: string;
  /** Null selama belum ada hasil (belum selesai). */
  resultId: string | null;
  ujianTitle: string;
  category: string;
  /** SUBMITTED | ONGOING | EXPIRED */
  status: string;
  score: number | null;
  startedAt: string;
  submittedAt: string | null;
};

export type TransactionItem = {
  id: string;
  invoice: string;
  createdAt: string;
  expiredAt: string | null;
  category: string;
  ujianTitle: string;
  /** SUCCESS | PENDING | WAITING | FAILED */
  status: string;
  total: number;
  /** Tautan pembayaran Midtrans, ada selama transaksi belum dibayar. */
  redirectUrl: string | null;
};

export type AnnouncementItem = {
  id: string;
  title: string;
  /** HTML dari editor. */
  content: string | null;
  createdAt: string;
};

export type PagedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
};

export type UserStats = {
  /** Latihan yang dimulai bulan ini. */
  totalSessions?: number;
  /** Try out yang sudah diselesaikan (sepanjang waktu). */
  completedSessions?: number;
  /** Sesi yang masih bisa dilanjutkan. */
  ongoingSessions?: number;
  /** Transaksi yang dibuat bulan ini. */
  totalTransactions?: number;
};
