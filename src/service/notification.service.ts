import { prisma } from "@/libs/prisma";
import { makeSnippet, stripHtml } from "@/libs/admin-search-utils";
import type { NotificationItem, NotificationType } from "@/types/notification";

/**
 * Notifikasi untuk siswa.
 *
 * Semua fungsi `notify*` bersifat best-effort: kalau gagal, error hanya di-log dan TIDAK dilempar,
 * jadi pembayaran / aksi admin yang memicunya tidak pernah ikut gagal gara-gara notifikasi.
 * Panggil setelah aksi utamanya berhasil (di luar transaksi database).
 */

// ============================================================================
// PEMBUATAN
// ============================================================================

type NotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  href?: string;
  /** Kejadian yang sama (mis. callback Midtrans terkirim ulang) tidak membuat notifikasi dua kali. */
  dedupeKey?: string;
};

/** Jumlah baris per insert saat menyiarkan ke banyak siswa. */
const INSERT_CHUNK_SIZE = 500;

const FALLBACK_UJIAN_TITLE = "ujian ini";

async function save(inputs: NotificationInput[]): Promise<void> {
  if (inputs.length === 0) return;

  try {
    for (let i = 0; i < inputs.length; i += INSERT_CHUNK_SIZE) {
      await prisma.notification.createMany({
        data: inputs.slice(i, i + INSERT_CHUNK_SIZE),
        // dedupeKey yang sudah ada dilewati, bukan error.
        skipDuplicates: true,
      });
    }
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);
  }
}

async function getUjianTitle(ujianId: string): Promise<string> {
  try {
    const ujian = await prisma.ujian.findUnique({
      where: { id: ujianId },
      select: { title: true },
    });
    return ujian?.title ?? FALLBACK_UJIAN_TITLE;
  } catch {
    return FALLBACK_UJIAN_TITLE;
  }
}

type PaymentEvent = {
  userId: string;
  ujianId: string;
  transactionId: string;
};

/** Pembayaran berhasil dan akses ujian sudah terbuka. */
export async function notifyPaymentSuccess({ userId, ujianId, transactionId }: PaymentEvent) {
  const title = await getUjianTitle(ujianId);

  await save([
    {
      userId,
      type: "PAYMENT_SUCCESS",
      title: "Pembayaran berhasil",
      message: `Akses ke ${title} sudah terbuka. Selamat belajar!`,
      href: `/user/tryout/ujian/${ujianId}`,
      dedupeKey: `payment-success:${transactionId}`,
    },
  ]);
}

/** Alasan pembayaran tidak berhasil. Tiga pertama = status dari Midtrans. */
export type PaymentFailureReason = "expire" | "cancel" | "deny" | "failed";

const FAILURE_COPY: Record<PaymentFailureReason, { title: string; detail: string }> = {
  expire: { title: "Pembayaran kedaluwarsa", detail: "melewati batas waktu pembayaran" },
  cancel: { title: "Pembayaran dibatalkan", detail: "dibatalkan" },
  deny: { title: "Pembayaran ditolak", detail: "ditolak oleh penyedia pembayaran" },
  failed: { title: "Pembayaran tidak berhasil", detail: "tidak berhasil diproses" },
};

/** Pembayaran kedaluwarsa, dibatalkan, ditolak, atau ditandai gagal oleh admin. */
export async function notifyPaymentFailed({
  userId,
  ujianId,
  transactionId,
  reason,
}: PaymentEvent & { reason: PaymentFailureReason }) {
  const title = await getUjianTitle(ujianId);
  const copy = FAILURE_COPY[reason] ?? FAILURE_COPY.failed;

  await save([
    {
      userId,
      type: "PAYMENT_FAILED",
      title: copy.title,
      message: `Pembayaran untuk ${title} ${copy.detail}. Kamu bisa mencobanya lagi dari halaman Try Out.`,
      href: "/user/riwayatTransaksi",
      dedupeKey: `payment-failed:${transactionId}`,
    },
  ]);
}

/** Siswa membayar dua kali untuk ujian yang sama (perlu tindak lanjut admin). */
export async function notifyPaymentDuplicate({ userId, ujianId, transactionId }: PaymentEvent) {
  const title = await getUjianTitle(ujianId);

  await save([
    {
      userId,
      type: "PAYMENT_DUPLICATE",
      title: "Pembayaran ganda terdeteksi",
      message: `Kamu sudah punya akses ke ${title}, tetapi pembayaran untuk ujian yang sama masuk lagi. Hubungi admin untuk tindak lanjut.`,
      href: "/user/riwayatTransaksi",
      dedupeKey: `payment-duplicate:${transactionId}`,
    },
  ]);
}

/** Akses gratis ke sebuah ujian sudah aktif. */
export async function notifyFreeAccess({ userId, ujianId }: { userId: string; ujianId: string }) {
  const title = await getUjianTitle(ujianId);

  await save([
    {
      userId,
      type: "ACCESS_GRANTED",
      title: "Akses gratis aktif",
      message: `Kamu bisa langsung mengerjakan ${title}.`,
      href: `/user/tryout/ujian/${ujianId}`,
      // Akses per (siswa, ujian) hanya terbuka sekali.
      dedupeKey: `access-free:${userId}:${ujianId}`,
    },
  ]);
}

/** Admin mengaktifkan atau mencabut status member. */
export async function notifyMemberChanged({ userId, isMember }: { userId: string; isMember: boolean }) {
  await save([
    isMember
      ? {
          userId,
          type: "MEMBER_ACTIVATED",
          title: "Kamu sekarang member",
          message: "Semua try out bisa kamu akses tanpa pembelian tambahan.",
          href: "/user/tryout",
        }
      : {
          userId,
          type: "MEMBER_DEACTIVATED",
          title: "Status member berakhir",
          message: "Akses ke try out kembali mengikuti pembelian yang sudah kamu miliki.",
          href: "/user/tryout",
        },
  ]);
}

const ANNOUNCEMENT_SNIPPET_RADIUS = 70;
const ANNOUNCEMENT_FALLBACK_MESSAGE = "Ada pengumuman baru untuk kamu.";

/**
 * Siarkan pengumuman baru ke semua siswa aktif (satu baris per siswa).
 * Pengumuman yang terbit sebelum fitur ini ada tidak ikut disiarkan.
 */
export async function notifyAnnouncement({
  id,
  title,
  content,
}: {
  id: string;
  title: string;
  content: string | null;
}) {
  try {
    const recipients = await prisma.user.findMany({
      where: { role: "USER", isActive: true },
      select: { id: true },
    });
    const message =
      makeSnippet(stripHtml(content ?? ""), "", ANNOUNCEMENT_SNIPPET_RADIUS) ||
      ANNOUNCEMENT_FALLBACK_MESSAGE;

    await save(
      recipients.map(({ id: userId }: { id: string }) => ({
        userId,
        type: "ANNOUNCEMENT" as const,
        title,
        message,
        href: `/user/pengumuman/${id}`,
        dedupeKey: `announcement:${id}:${userId}`,
      })),
    );
  } catch (error) {
    console.error("NOTIFY ANNOUNCEMENT ERROR:", error);
  }
}

/** Pengumuman dihapus: notifikasinya ikut dibersihkan supaya tidak menyisakan tautan mati. */
export async function removeAnnouncementNotifications(announcementId: string) {
  try {
    await prisma.notification.deleteMany({
      where: { dedupeKey: { startsWith: `announcement:${announcementId}:` } },
    });
  } catch (error) {
    console.error("REMOVE ANNOUNCEMENT NOTIFICATIONS ERROR:", error);
  }
}

// ============================================================================
// PEMBACAAN (selalu dibatasi ke userId yang login)
// ============================================================================

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
};

const toItem = (row: NotificationRow): NotificationItem => ({
  id: row.id,
  type: row.type,
  title: row.title,
  message: row.message,
  href: row.href,
  read: row.readAt !== null,
  createdAt: row.createdAt.toISOString(),
});

/** Satu halaman notifikasi, terbaru dulu. `cursor` = id item terakhir dari halaman sebelumnya. */
export async function listNotifications(
  userId: string,
  { limit, cursor }: { limit: number; cursor?: string | null },
): Promise<{ items: NotificationItem[]; nextCursor: string | null }> {
  // Ambil satu lebih untuk tahu masih ada halaman berikutnya atau tidak.
  const rows: NotificationRow[] = await prisma.notification.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      href: true,
      readAt: true,
      createdAt: true,
    },
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  return {
    items: page.map(toItem),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

export function countUnread(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

/** Tandai notifikasi tertentu sudah dibaca. Id milik siswa lain diabaikan. */
export async function markAsRead(userId: string, ids: string[]): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, id: { in: ids }, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
