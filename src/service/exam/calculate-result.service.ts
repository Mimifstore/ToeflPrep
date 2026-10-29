import { prisma } from "@/libs/prisma";

type Props = {
  sessionId: string;
};

export async function calculateResult({ sessionId }: Props) {
  // 🔥 GET SEMUA JAWABAN (exclude DIRECTION)
  const answers = await prisma.examAnswer.findMany({
    where: {
      sessionId,
      question: {
        type: { not: "DIRECTION" },
      },
    },
    include: {
      question: {
        include: {
          categoryPenilaian: {
            include: {
              mappings: { orderBy: { minScore: "asc" } },
              section: true,
            },
          },
        },
      },
    },
  });

  // 🔥 GROUP PER KATEGORI
  const categoryMap = new Map<
    string,
    {
      categoryId: string;
      name: string;
      program: string;
      correct: number;
      total: number;
      mappings: { minScore: number; maxScore: number; finalScore: number }[];
    }
  >();

  for (const item of answers) {
    const category = item.question.categoryPenilaian;
    if (!category) continue;

    if (!categoryMap.has(category.id)) {
      categoryMap.set(category.id, {
        categoryId: category.id,
        name: category.name,
        program: category.program, // "TOEFL" | "TOEIC" | "CUSTOM"
        correct: 0,
        total: 0,
        mappings: category.mappings,
      });
    }

    const cat = categoryMap.get(category.id)!;
    cat.total++;

    if (item.answer && item.answer === item.question.correctAnswer) {
      cat.correct++;
    }
  }

  // 🔥 HITUNG FINAL SCORE PER KATEGORI VIA SCOREMAPPING DB
  const categoryResults = [];
  let totalFinalScore = 0;
  let totalMaxFinalScore = 0;

  for (const cat of categoryMap.values()) {
    // mappings sudah diurutkan minScore ASC dari query di atas
    const exactMapping = cat.mappings.find(
      (m) => cat.correct >= m.minScore && cat.correct <= m.maxScore,
    );

    // 🔥 FIX: kalau jumlah jawaban benar melebihi rentang tertinggi yang
    // di-mapping admin (misal admin cuma isi 0-50 tapi soal ada 60),
    // jangan diam-diam kasih finalScore 0 — pakai skor tertinggi yang tersedia.
    const highestMapping = cat.mappings[cat.mappings.length - 1];
    const mapping =
      exactMapping ??
      (highestMapping && cat.correct > highestMapping.maxScore
        ? highestMapping
        : undefined);

    const finalScore = mapping?.finalScore ?? 0;
    const maxFinalScore = highestMapping?.finalScore ?? 0;

    totalFinalScore += finalScore;
    totalMaxFinalScore += maxFinalScore;

    categoryResults.push({
      categoryId: cat.categoryId,
      name: cat.name,
      program: cat.program,
      correct: cat.correct,
      total: cat.total,
      score: finalScore,
    });
  }

  // 🔥 DETEKSI PROGRAM DARI KATEGORI
  const program = categoryResults[0]?.program ?? "CUSTOM";
  const totalCategories = categoryResults.length;

  // 🔥 STANDAR RESMI TOEFL ITP: selalu 3 section (Listening, Structure, Reading).
  // FIX: sebelumnya pakai `totalCategories` (dinamis, ikut jumlah kategori yang
  // kebetulan kejawab), padahal formula resmi pembaginya tetap 3 — kalau exam
  // dikonfigurasi kurang dari 3 section, skor jadi salah tanpa peringatan.
  const TOEFL_SECTION_COUNT = 3;

  // 🔥 HITUNG TOTAL SCORE SESUAI STANDAR
  let score = 0;
  let maxScore = 0;

  if (program === "TOEFL") {
    // Standar TOEFL ITP: ((L + S + R) × 10) / 3
    score = Math.round((totalFinalScore * 10) / TOEFL_SECTION_COUNT);
    maxScore = Math.round((totalMaxFinalScore * 10) / TOEFL_SECTION_COUNT);
  } else if (program === "TOEIC") {
    // Standar TOEIC: L + R langsung dijumlah
    score = totalFinalScore;
    maxScore = totalMaxFinalScore;
  } else {
    // CUSTOM
    score = totalFinalScore;
    maxScore = totalMaxFinalScore;
  }

  const totalCorrect = Array.from(categoryMap.values()).reduce(
    (a, b) => a + b.correct,
    0,
  );
  const totalWrong = answers.filter(
    (a) => a.answer && a.answer !== a.question.correctAnswer,
  ).length;
  const totalQuestion = answers.length;

  return {
    totalCorrect,
    totalWrong,
    totalQuestion,
    score,
    maxScore, // 🔥 BARU — dipakai buat hitung persentase ring skor di frontend
    program, // 🔥 BARU — dipakai buat label di frontend
    categoryResults,
  };
}
