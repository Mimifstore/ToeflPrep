import crypto from "crypto";
import { prisma } from "@/libs/prisma";
import { snap } from "@/libs/midtrans";

type Props = {
  ujianId: string;
  userId: string;
};

// Error yang pesannya aman ditampilkan ke peserta
export class PaymentError extends Error {
  constructor(
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

// Transaksi yang masih berjalan (belum sukses dan belum gagal)
const ACTIVE = ["PENDING", "WAITING"];
const EXPIRY_MINUTES = 60;
const BUSY_MESSAGE = "Pembayaran sedang diproses, coba lagi sebentar";

// GENERATE INVOICE PENDEK & READABLE
function generateInvoice(): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const randomStr = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `INV-${dateStr}-${randomStr}`;
}

const OLDEST_FIRST = [{ createdAt: "asc" as const }, { id: "asc" as const }];

export async function createPayment({ ujianId, userId }: Props) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new PaymentError("User tidak ditemukan", 404);
  }

  const ujian = await prisma.ujian.findFirst({ where: { id: ujianId } });

  if (!ujian) {
    throw new PaymentError("Ujian tidak ditemukan", 404);
  }

  if (ujian.price <= 0) {
    throw new PaymentError("Ujian ini gratis, gunakan tombol akses gratis");
  }

  const existingAccess = await prisma.userExamAccess.findFirst({
    where: { userId, ujianId },
  });

  if (existingAccess) {
    throw new PaymentError("Anda sudah memiliki akses ujian ini");
  }

  //  PAKAI ULANG TRANSAKSI YANG MASIH BERJALAN (PENDING atau WAITING).
  // WAITING = peserta sudah memilih metode bayar; kalau tidak dipakai ulang,
  // menekan Beli lagi membuat tagihan kedua dan bisa terbayar dua kali.
  const now = new Date();
  const active = await prisma.transaction.findMany({
    where: { userId, ujianId, status: { in: ACTIVE } },
    orderBy: OLDEST_FIRST,
  });

  let busy = false;
  for (const t of active) {
    if (t.expiredAt && now > t.expiredAt) {
      // kedaluwarsa. Kalau ternyata settlement telat datang, callback tetap memprosesnya.
      await prisma.transaction.updateMany({
        where: { id: t.id, status: { in: ACTIVE } },
        data: { status: "FAILED" },
      });
      continue;
    }

    if (t.snapToken) {
      return {
        token: t.snapToken,
        redirectUrl: t.redirectUrl,
        invoice: t.invoice,
        reused: true,
      };
    }

    // belum punya token: request lain sedang membuatnya, atau sisa yang gagal
    if (now.getTime() - t.createdAt.getTime() < 60_000) {
      busy = true;
    } else {
      await prisma.transaction.updateMany({
        where: { id: t.id, status: { in: ACTIVE } },
        data: { status: "FAILED" },
      });
    }
  }

  if (busy) throw new PaymentError(BUSY_MESSAGE, 409);

  // GENERATE INVOICE — retry kalau ternyata collision (sangat kecil kemungkinan)
  let invoice = generateInvoice();
  let attempt = 0;

  while (attempt < 3) {
    const exists = await prisma.transaction.findUnique({ where: { invoice } });
    if (!exists) break;
    invoice = generateInvoice();
    attempt++;
  }

  const expiredAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

  const transaction = await prisma.transaction.create({
    data: {
      invoice,
      userId,
      ujianId,
      total: ujian.price,
      status: "PENDING",
      midtransOrderId: invoice,
      expiredAt,
    },
  });

  // KLIK GANDA / DUA TAB: kalau ada transaksi aktif yang lebih dulu dibuat,
  // yang ini mundur dan memakai punya yang lebih dulu. Urutannya pasti
  // (createdAt lalu id), jadi dua request bersamaan selalu sepakat siapa yang lanjut.
  const earliest = await prisma.transaction.findFirst({
    where: { userId, ujianId, status: { in: ACTIVE } },
    orderBy: OLDEST_FIRST,
  });

  if (earliest && earliest.id !== transaction.id) {
    await prisma.transaction.updateMany({
      where: { id: transaction.id },
      data: { status: "FAILED" },
    });

    if (earliest.snapToken) {
      return {
        token: earliest.snapToken,
        redirectUrl: earliest.redirectUrl,
        invoice: earliest.invoice,
        reused: true,
      };
    }

    throw new PaymentError(BUSY_MESSAGE, 409);
  }

  const payload = {
    transaction_details: {
      order_id: invoice,
      gross_amount: ujian.price,
    },
    customer_details: {
      first_name: user.name || "User",
      email: user.email || "",
      phone: user.phone || "",
    },
    item_details: [
      {
        id: ujian.id,
        price: ujian.price,
        quantity: 1,
        name: ujian.title,
      },
    ],
    enabled_payments: ["credit_card", "qris", "bank_transfer", "gopay", "shopeepay"],
    expiry: {
      unit: "minutes",
      duration: EXPIRY_MINUTES,
    },
  };

  let snapResponse;
  try {
    snapResponse = await snap.createTransaction(payload);
  } catch (error) {
    // jangan tinggalkan transaksi menggantung tanpa token
    console.error("MIDTRANS CREATE TRANSACTION ERROR:", error);
    await prisma.transaction.updateMany({
      where: { id: transaction.id },
      data: { status: "FAILED" },
    });
    throw new PaymentError("Gagal membuat pembayaran, coba lagi sebentar", 502);
  }

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      snapToken: snapResponse.token,
      redirectUrl: snapResponse.redirect_url,
    },
  });

  return {
    token: snapResponse.token,
    redirectUrl: snapResponse.redirect_url,
    invoice,
  };
}