import { NextResponse } from "next/server";

import {
  CallbackError,
  handlePaymentCallback,
} from "@/service/payment/handle-payment-callback";

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  try {
    await handlePaymentCallback({ body });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof CallbackError) {
      // INVALID SIGNATURE
      if (error.code === "INVALID_SIGNATURE") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      // NOMINAL TIDAK COCOK
      if (error.code === "INVALID_AMOUNT") {
        return NextResponse.json(
          { message: "Invalid amount" },
          { status: 400 },
        );
      }

      // TRANSACTION NOT FOUND
      if (error.code === "NOT_FOUND") {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
    }

    // selain itu: jangan bocorkan pesan internal. Status 500 membuat Midtrans mengirim ulang.
    console.error("MIDTRANS CALLBACK ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
