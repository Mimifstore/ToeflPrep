import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { paymentSchema } from "@/app/validations/payment";
import { createPayment, PaymentError } from "@/service/payment/create-payment";
import { checkRateLimit, checkUserRateLimit } from "@/libs/api-auth";

export async function POST(req: Request) {
  // jaring pengaman per IP (longgar: banyak peserta bisa satu jaringan)
  const ipLimit = checkRateLimit(req, {
    limit: 300,
    windowMs: 60 * 1000,
    prefix: "payment",
  });
  if (ipLimit.error) return ipLimit.error;

  try {
    const session = await auth();

    // pakai id (bukan email): akun OAuth tanpa email tetap bisa membeli
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // batas per peserta
    const userLimit = checkUserRateLimit(session.user.id, {
      limit: 10,
      windowMs: 60 * 1000,
      prefix: "payment",
    });
    if (userLimit.error) return userLimit.error;

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    const validated = paymentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0]?.message || "Validation error" },
        { status: 400 },
      );
    }

    const result = await createPayment({
      ujianId: validated.data.ujianId,
      userId: session.user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PaymentError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    // jangan bocorkan pesan internal ke browser
    console.error("CREATE PAYMENT ERROR:", error);
    return NextResponse.json(
      { message: "Gagal membuat pembayaran" },
      { status: 500 },
    );
  }
}
