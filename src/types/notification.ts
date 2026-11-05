/** Jenis notifikasi yang dibuat server. Disimpan sebagai teks di kolom `Notification.type`. */
export const NOTIFICATION_TYPES = [
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
  "PAYMENT_DUPLICATE",
  "ACCESS_GRANTED",
  "MEMBER_ACTIVATED",
  "MEMBER_DEACTIVATED",
  "ANNOUNCEMENT",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Bentuk notifikasi yang dikirim API ke browser. */
export type NotificationItem = {
  id: string;
  /** Bisa berisi jenis yang belum dikenal browser (mis. dari versi server lebih baru). */
  type: string;
  title: string;
  message: string;
  /** Halaman tujuan; null = notifikasi tanpa tautan. */
  href: string | null;
  read: boolean;
  /** ISO 8601 */
  createdAt: string;
};

export type NotificationListResponse = {
  items: NotificationItem[];
  /** Null = sudah habis. */
  nextCursor: string | null;
  unreadCount: number;
};
