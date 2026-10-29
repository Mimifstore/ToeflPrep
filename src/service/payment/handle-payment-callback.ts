import crypto from "crypto";
import { prisma } from "@/libs/prisma";
import { logAudit } from "@/libs/audit-log";

type MidtransCallbackBody = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  payment_type?: string;
  fraud_status?: string;
};

type Props = {
  body: MidtransCallbackBody;
};

// Error dengan kode: route callback memetakan kode ini ke status HTTP
export class CallbackError extends Error {
  constructor(
    public code:
      | "INVALID_SIGNATURE"
      | "INVALID_AMOUNT"
      | "NOT_FOUND"
      | "CONFIG",
    message: string,
  ) {
    super(message);
  }
}

// Perbandingan tanda tangan yang tahan serangan timing
function signatureMatches(expectedHex: string, given: unknown): boolean {
  if (typeof given !== "string") return false;
  const a = Buffer.from(expectedHex, "hex");
  const b = Buffer.from(given, "hex"); // hex tidak valid -> lebih pendek -> false
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Status yang masih boleh diubah oleh notifikasi non-sukses
const OPEN_STATUSES = ["PENDING", "WAITING"];

export async function handlePaymentCallback({ body }: Props) {
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    payment_type,
    fraud_status,
  } = body ?? ({} as MidtransCallbackBody);

  //  VERIFY SIGNATURE
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new CallbackError("CONFIG", "Server configuration error");
  }

  if (
    typeof order_id !== "string" ||
    typeof status_code !== "string" ||
    typeof gross_amount !== "string"
  ) {
    throw new CallbackError("INVALID_SIGNATURE", "Invalid signature");
  }

  const expected = crypto
    .createHash("sha512")
    .update(order_id + status_code + gross_amount + serverKey)
    .digest("hex");

  if (!signatureMatches(expected, signature_key)) {
    throw new CallbackError("INVALID_SIGNATURE", "Invalid signature");
  }

  //  FIND TRANSACTION
  const transaction = await prisma.transaction.findUnique({
    where: { midtransOrderId: order_id },
  });

  if (!transaction) {
    throw new CallbackError("NOT_FOUND", "Transaction tidak ditemukan");
  }

  //  VALIDASI NOMINAL — cegah manipulasi
  if (Number(gross_amount) !== transaction.total) {
    throw new CallbackError("INVALID_AMOUNT", "Invalid amount");
  }

  const isSuccess =
    transaction_status === "settlement" ||
    (transaction_status === "capture" && fraud_status === "accept");

  //  SUKSES: status dan akses diubah dalam SATU transaksi database.
  // Kalau salah satu gagal, dua-duanya dibatalkan dan callback ulang dari
  // Midtrans akan memprosesnya lagi dari awal.
  // Notifikasi sukses yang terlambat (transaksi sempat FAILED) tetap diproses:
  // uangnya benar-benar masuk.
  if (isSuccess) {
    const outcome = await prisma.$transaction(async (tx) => {
      // hanya satu callback yang boleh memproses transaksi ini
      const claimed = await tx.transaction.updateMany({
        where: { id: transaction.id, status: { not: "SUCCESS" } },
        data: {
          status: "SUCCESS",
          paymentType: payment_type || null,
          paidAt: new Date(),
          paymentResponse: body,
        },
      });
      if (claimed.count === 0) return "ALREADY_DONE" as const;

      const existing = await tx.userExamAccess.findUnique({
        where: {
          userId_ujianId: {
            userId: transaction.userId,
            ujianId: transaction.ujianId,
          },
        },
      });

      if (existing) {
        // akses sudah ada dari transaksi lain = pembayaran ganda
        return existing.transactionId === transaction.id
          ? ("OK" as const)
          : ("DUPLICATE" as const);
      }

      await tx.userExamAccess.create({
        data: {
          userId: transaction.userId,
          ujianId: transaction.ujianId,
          transactionId: transaction.id,
        },
      });
      return "OK" as const;
    });

    if (outcome === "DUPLICATE") {
      // peserta membayar dua kali untuk ujian yang sama: tandai untuk refund manual
      console.error("DUPLICATE PAYMENT:", order_id, transaction.ujianId);
      await logAudit({
        actorId: transaction.userId,
        action: "DUPLICATE_PAYMENT",
        targetId: transaction.id,
        metadata: {
          orderId: order_id,
          ujianId: transaction.ujianId,
          total: transaction.total,
        },
      });
    }

    return true;
  }

  //  MENUNGGU PEMBAYARAN (peserta sudah memilih metode)
  if (transaction_status === "pending") {
    await prisma.transaction.updateMany({
      where: { id: transaction.id, status: { in: OPEN_STATUSES } },
      data: { status: "WAITING", paymentResponse: body },
    });
    return true;
  }

  // KEDALUWARSA / DIBATALKAN / DITOLAK — tidak menimpa transaksi yang sudah SUCCESS
  if (["expire", "cancel", "deny"].includes(transaction_status)) {
    await prisma.transaction.updateMany({
      where: { id: transaction.id, status: { in: OPEN_STATUSES } },
      data: { status: "FAILED", paymentResponse: body },
    });
    return true;
  }

  //  STATUS LAIN: simpan responsnya saja sebagai jejak
  await prisma.transaction.updateMany({
    where: { id: transaction.id, status: { not: "SUCCESS" } },
    data: { paymentResponse: body },
  });

  return true;
}
