import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";

export async function GET(req: Request) {
  try {
    const { error } = await requireAdmin();
     if (error) return error;

    const { searchParams } = new URL(req.url);
    const ujianId = searchParams.get("ujianId") || "";
    const type = searchParams.get("type") || "rekap"; // rekap | sertifikat

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
                  include: { mappings: { orderBy: { minScore: "asc" } } },
                },
              },
            },
          },
          where: { question: { type: { not: "DIRECTION" } } },
        },
      },
    });

    // 🔥 BUILD DATA
    const data = sessions.map((s) => {
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

      const categoryScores = Array.from(categoryMap.values()).map((cat) => {
        const mapping = cat.mappings.find(
          (m) => cat.correct >= m.minScore && cat.correct <= m.maxScore,
        );
        return {
          name: cat.name,
          correct: cat.correct,
          total: cat.total,
          score: mapping?.finalScore ?? 0,
        };
      });

      const totalScore = s.result?.score ?? 0;
      const passed = totalScore >= s.ujian.passingScore;

      return {
        userName: s.user.siswa?.name || s.user.name || s.user.email || "-",
        ujianTitle: s.ujian.title,
        passingScore: s.ujian.passingScore,
        totalScore,
        categoryScores,
        passed,
        submittedAt: s.submittedAt
          ? new Date(s.submittedAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "-",
      };
    });

    // 🔥 GENERATE HTML
    let html = "";

    if (type === "rekap") {
      // 🔥 PDF REKAP — semua peserta dalam satu tabel
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; padding: 30px; }
            .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #1e40af; padding-bottom: 16px; }
            .header h1 { font-size: 18px; font-weight: bold; color: #1e40af; }
            .header p { color: #6b7280; font-size: 11px; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { background: #1e40af; color: white; padding: 8px 10px; text-align: left; font-size: 11px; }
            td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
            tr:nth-child(even) { background: #f8fafc; }
            .lulus { color: #16a34a; font-weight: bold; }
            .tidak-lulus { color: #dc2626; font-weight: bold; }
            .footer { margin-top: 24px; text-align: right; color: #9ca3af; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>REKAP HASIL UJIAN</h1>
            <p>${data[0]?.ujianTitle || "Semua Ujian"} — Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Peserta</th>
                <th>L Score</th>
                <th>S Score</th>
                <th>R Score</th>
                <th>Total Score</th>
                <th>Passing Score</th>
                <th>Status</th>
                <th>Tgl Selesai</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map((d, i) => {
                  const l =
                    d.categoryScores.find((c) =>
                      c.name.toLowerCase().includes("listening"),
                    )?.score ?? "-";
                  const s =
                    d.categoryScores.find((c) =>
                      c.name.toLowerCase().includes("structure"),
                    )?.score ?? "-";
                  const r =
                    d.categoryScores.find((c) =>
                      c.name.toLowerCase().includes("reading"),
                    )?.score ?? "-";
                  return `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${d.userName}</td>
                    <td>${l}</td>
                    <td>${s}</td>
                    <td>${r}</td>
                    <td><strong>${d.totalScore}</strong></td>
                    <td>${d.passingScore}</td>
                    <td class="${d.passed ? "lulus" : "tidak-lulus"}">${d.passed ? "LULUS" : "TIDAK LULUS"}</td>
                    <td>${d.submittedAt}</td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
          <div class="footer">Total peserta: ${data.length} | Lulus: ${data.filter((d) => d.passed).length} | Tidak Lulus: ${data.filter((d) => !d.passed).length}</div>
        </body>
        </html>
      `;
    } else {
      // 🔥 PDF SERTIFIKAT — satu halaman per peserta
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; }
            .page {
              width: 100%;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              page-break-after: always;
              padding: 40px;
            }
            .card {
              width: 100%;
              max-width: 600px;
              border: 3px solid #1e40af;
              border-radius: 12px;
              padding: 40px;
              text-align: center;
            }
            .title { font-size: 22px; font-weight: bold; color: #1e40af; letter-spacing: 2px; margin-bottom: 4px; }
            .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
            .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
            .name { font-size: 26px; font-weight: bold; color: #111827; margin: 12px 0; }
            .ujian { font-size: 14px; color: #6b7280; margin-bottom: 20px; }
            .scores { display: flex; justify-content: center; gap: 20px; margin: 20px 0; }
            .score-item { text-align: center; }
            .score-item .val { font-size: 28px; font-weight: bold; color: #1e40af; }
            .score-item .label { font-size: 10px; color: #9ca3af; margin-top: 2px; }
            .total { font-size: 36px; font-weight: bold; color: #111827; margin: 16px 0 4px; }
            .total-label { font-size: 12px; color: #6b7280; }
            .status-lulus { display: inline-block; background: #dcfce7; color: #16a34a; font-weight: bold; font-size: 16px; padding: 8px 24px; border-radius: 999px; margin: 16px 0; }
            .status-gagal { display: inline-block; background: #fee2e2; color: #dc2626; font-weight: bold; font-size: 16px; padding: 8px 24px; border-radius: 999px; margin: 16px 0; }
            .date { font-size: 11px; color: #9ca3af; margin-top: 16px; }
          </style>
        </head>
        <body>
          ${data
            .map((d) => {
              const l =
                d.categoryScores.find((c) =>
                  c.name.toLowerCase().includes("listening"),
                )?.score ?? "-";
              const s =
                d.categoryScores.find((c) =>
                  c.name.toLowerCase().includes("structure"),
                )?.score ?? "-";
              const r =
                d.categoryScores.find((c) =>
                  c.name.toLowerCase().includes("reading"),
                )?.score ?? "-";
              return `
              <div class="page">
                <div class="card">
                  <div class="title">HASIL UJIAN</div>
                  <div class="subtitle">${d.ujianTitle}</div>
                  <hr class="divider">
                  <div style="font-size:12px;color:#6b7280;">Peserta</div>
                  <div class="name">${d.userName}</div>
                  <hr class="divider">
                  <div class="scores">
                    <div class="score-item">
                      <div class="val">${l}</div>
                      <div class="label">Listening</div>
                    </div>
                    <div class="score-item">
                      <div class="val">${s}</div>
                      <div class="label">Structure</div>
                    </div>
                    <div class="score-item">
                      <div class="val">${r}</div>
                      <div class="label">Reading</div>
                    </div>
                  </div>
                  <hr class="divider">
                  <div class="total">${d.totalScore}</div>
                  <div class="total-label">Total Score</div>
                  <div class="${d.passed ? "status-lulus" : "status-gagal"}">
                    ${d.passed ? "✓ LULUS" : "✗ TIDAK LULUS"}
                  </div>
                  <div class="date">Diselesaikan pada ${d.submittedAt}</div>
                </div>
              </div>
            `;
            })
            .join("")}
        </body>
        </html>
      `;
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
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
