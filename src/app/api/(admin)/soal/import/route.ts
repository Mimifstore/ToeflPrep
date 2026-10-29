import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { prisma } from "@/libs/prisma";
import {
  ImportFileError,
  importSoalService,
} from "@/service/soal/import-soal.service";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// .xlsx = ZIP ("PK\x03\x04"), .xls = OLE2 (D0 CF 11 E0)
function looksLikeExcel(buf: Buffer) {
  const zip =
    buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04;
  const ole =
    buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0;
  return zip || ole;
}

export async function POST(req: Request) {
  //  AUTH — hanya ADMIN yang boleh import soal
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    // 🔥 PARSE FORM DATA
    const formData = await req.formData();
    const file = formData.get("file");
    const examId = formData.get("examId");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "File tidak ditemukan" },
        { status: 400 },
      );
    }

    if (typeof examId !== "string" || !examId) {
      return NextResponse.json(
        { message: "examId tidak ditemukan" },
        { status: 400 },
      );
    }

    // 🔥 VALIDASI EXTENSION
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      return NextResponse.json(
        { message: "File harus berformat .xlsx atau .xls" },
        { status: 400 },
      );
    }

    // 🔥 VALIDASI UKURAN
    if (file.size === 0) {
      return NextResponse.json({ message: "File kosong" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "Ukuran file maksimal 5 MB" },
        { status: 413 },
      );
    }

    // 🔥 CEK EXAM EXIST
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true },
    });
    if (!exam) {
      return NextResponse.json(
        { message: "Bank soal tidak ditemukan" },
        { status: 404 },
      );
    }

    // 🔥 CONVERT FILE KE BUFFER + CEK ISI SEBENARNYA (bukan cuma nama)
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!looksLikeExcel(buffer)) {
      return NextResponse.json(
        { message: "Isi file bukan Excel yang valid" },
        { status: 400 },
      );
    }

    // 🔥 IMPORT
    const result = await importSoalService(buffer, examId);

    return NextResponse.json(result);
  } catch (error) {
    // masalah pada isi file: pesannya jelas dan aman ditampilkan
    if (error instanceof ImportFileError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("IMPORT SOAL ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
