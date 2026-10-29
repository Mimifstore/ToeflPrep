import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "@/libs/api-auth";
import { z } from "zod";

const createUjianSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  price: z.coerce.number().int().min(0).default(0),
  programId: z.string().min(1, "Program wajib dipilih"),
  questionBankId: z.string().min(1, "Bank soal wajib dipilih"),
  timeType: z.enum(["SINGLE", "PER_SECTION"]),
  totalTime: z.coerce.number().int().min(0).optional().nullable(),
  listeningTime: z.coerce.number().int().min(0).optional().nullable(),
  structureTime: z.coerce.number().int().min(0).optional().nullable(),
  readingTime: z.coerce.number().int().min(0).optional().nullable(),
  shuffleQuestions: z.boolean().default(false),
  shuffleAnswers: z.boolean().default(false),
  showAnswer: z.boolean().default(false),
  showNavigation: z.boolean().default(true),
  showQuestionNumber: z.boolean().default(true),
  autoNextQuestion: z.boolean().default(false),
  showPrevNextButton: z.boolean().default(true),
  questionDisplayType: z.enum(["OPTION", "INLINE"]).default("OPTION"),
  maxExitAttempts: z.coerce.number().int().min(0).default(0),
  passingScore: z.coerce.number().int().min(0).max(1000).default(450),
});

export async function GET(req: Request) {
  // 🔥 FIX — endpoint ini dipake DUA sisi: admin (lihat semua ujian buat
  // dikelola) dan user (browsing daftar tryout per program via ?programId=).
  // requireAdmin() sebelumnya nutup akses user, sekarang requireAuth()
  // (cukup login, gak harus admin) — sama pola kayak fix di program/route.ts.
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("programId");
    const data = await prisma.ujian.findMany({
      where: programId ? { programId } : undefined,
      include: { program: true, questionBank: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET UJIANS ERROR:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = createUjianSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 },
      );
    }

    const program = await prisma.program.findUnique({
      where: { id: validated.data.programId },
    });
    if (!program) {
      return NextResponse.json(
        { error: "Program tidak ditemukan" },
        { status: 404 },
      );
    }

    const exam = await prisma.exam.findUnique({
      where: { id: validated.data.questionBankId },
    });
    if (!exam) {
      return NextResponse.json(
        { error: "Bank soal tidak ditemukan" },
        { status: 404 },
      );
    }

    const created = await prisma.ujian.create({ data: validated.data });
    return NextResponse.json(created);
  } catch (error) {
    console.error("CREATE UJIAN ERROR:", error);
    return NextResponse.json({ error: "Gagal membuat ujian" }, { status: 500 });
  }
}
