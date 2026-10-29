import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireAdmin } from "@/libs/api-auth";

export async function GET(req: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const ujianId = searchParams.get("ujianId") || "";

    const sessions = await prisma.examSession.findMany({
      where: {
        status: { in: ["SUBMITTED", "EXPIRED"] },
        ...(ujianId ? { ujianId } : {}),
      },
      orderBy: { submittedAt: "desc" },
      include: {
        user: { include: { siswa: true } },
        ujian: true,
        result: true,
        answers: {
          include: {
            question: {
              include: {
                categoryPenilaian: {
                  include: {
                    mappings: { orderBy: { minScore: "asc" } },
                  },
                },
              },
            },
          },
          where: {
            question: { type: { not: "DIRECTION" } },
          },
        },
      },
    });

    // 🔥 BUILD ROWS
    const rows = sessions.map((s, i) => {
      const categoryMap = new Map<
        string,
        { name: string; correct: number; total: number; mappings: any[] }
      >();

      for (const answer of s.answers) {
        const cat = answer.question.categoryPenilaian;
        if (!cat) continue;
        if (!categoryMap.has(cat.id)) {
          categoryMap.set(cat.id, {
            name: cat.name,
            correct: 0,
            total: 0,
            mappings: cat.mappings,
          });
        }
        const c = categoryMap.get(cat.id)!;
        c.total++;
        if (answer.answer && answer.answer === answer.question.correctAnswer)
          c.correct++;
      }

      const categoryScores: Record<string, number> = {};
      for (const cat of categoryMap.values()) {
        const mapping = cat.mappings.find(
          (m) => cat.correct >= m.minScore && cat.correct <= m.maxScore,
        );
        categoryScores[cat.name] = mapping?.finalScore ?? 0;
      }

      const totalScore = s.result?.score ?? 0;
      const passed = totalScore >= s.ujian.passingScore;

      return {
        No: i + 1,
        Nama: s.user.siswa?.name || s.user.name || s.user.email,
        Ujian: s.ujian.title,
        "Listening Score": categoryScores["Listening Comprehension"] ?? "-",
        "Structure Score": categoryScores["Structure Comprehension"] ?? "-",
        "Reading Score": categoryScores["Reading Comprehension"] ?? "-",
        "Total Score": totalScore,
        "Passing Score": s.ujian.passingScore,
        Status: passed ? "LULUS" : "TIDAK LULUS",
        "Waktu Selesai": s.submittedAt
          ? new Date(s.submittedAt).toLocaleString("id-ID")
          : "-",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 5 },
      { wch: 25 },
      { wch: 30 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 12 },
      { wch: 13 },
      { wch: 12 },
      { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Nilai");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="rekap-nilai.xlsx"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
