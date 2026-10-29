import { prisma } from "@/libs/prisma";
import {
  formatRupiah,
  makeSnippet,
  normalizeQuery,
  stripHtml,
} from "@/libs/admin-search-utils";
import {
  ADMIN_SEARCH_MIN_LENGTH,
  type AdminSearchItem,
  type AdminSearchTone,
} from "@/types/admin-search";

/** Maksimal hasil per jenis data. */
const PER_TYPE = 5;
/** Butir soal berisi teks panjang, jadi baru dicari kalau kata kuncinya cukup spesifik. */
const QUESTION_MIN_LENGTH = 3;

const contains = (query: string) => ({
  contains: query,
  mode: "insensitive" as const,
});

const TRANSACTION_STATUS: Record<string, { label: string; tone: AdminSearchTone }> = {
  SUCCESS: { label: "Berhasil", tone: "success" },
  PENDING: { label: "Menunggu", tone: "warning" },
  WAITING: { label: "Menunggu", tone: "warning" },
  FAILED: { label: "Gagal", tone: "danger" },
  EXPIRED: { label: "Kedaluwarsa", tone: "neutral" },
};

// Bentuk baris hasil query. Sengaja ditulis eksplisit dan harus sama dengan `select` di bawahnya.
type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  isActive: boolean;
  siswa: { id: string } | null;
};
type ProgramRow = { id: string; name: string; description: string | null };
type ScoreRow = { id: string; name: string; program: string; section: { title: string } };
type ExamRow = {
  id: string;
  title: string;
  category: { name: string };
  _count: { questions: number };
};
type QuestionRow = {
  id: string;
  examId: string;
  order: number;
  questionText: string | null;
  explanation: string | null;
  exam: { title: string };
};
type UjianRow = {
  id: string;
  title: string;
  price: number;
  program: { name: string };
};
type AnnouncementRow = { id: string; title: string; content: string | null };
type FaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  isActive: boolean;
};
type TransactionRow = {
  id: string;
  invoice: string;
  status: string;
  user: { name: string | null; email: string | null };
  ujian: { title: string };
};

async function searchUsers(q: string): Promise<AdminSearchItem[]> {
  const rows: UserRow[] = await prisma.user.findMany({
    where: {
      OR: [
        { name: contains(q) },
        { email: contains(q) },
        { phone: contains(q) },
        { siswa: { is: { name: contains(q) } } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isActive: true,
      siswa: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: PER_TYPE,
  });

  return rows.map((u: UserRow) => ({
    type: "user",
    id: u.id,
    title: u.name || u.email || "Tanpa nama",
    subtitle: u.name ? (u.email ?? undefined) : undefined,
    // Peserta punya halaman detail (lewat profil siswa), akun admin cuma ada di daftar user.
    href: u.siswa
      ? `/admin/master-data/siswa/${u.siswa.id}`
      : "/admin/master-data/users",
    badge: u.role === "ADMIN" ? "Admin" : u.isActive ? "Peserta" : "Nonaktif",
    tone: u.isActive ? "neutral" : "danger",
    imageUrl: u.image,
  }));
}

async function searchPrograms(q: string): Promise<AdminSearchItem[]> {
  const rows: ProgramRow[] = await prisma.program.findMany({
    where: { OR: [{ name: contains(q) }, { description: contains(q) }] },
    select: { id: true, name: true, description: true },
    orderBy: { createdAt: "desc" },
    take: PER_TYPE,
  });

  return rows.map((p: ProgramRow) => ({
    type: "program",
    id: p.id,
    title: p.name,
    subtitle: p.description ? makeSnippet(stripHtml(p.description), q, 40) : undefined,
    href: `/admin/master-data/program/${p.id}/edit`,
  }));
}

async function searchScores(q: string): Promise<AdminSearchItem[]> {
  const rows: ScoreRow[] = await prisma.categoryScore.findMany({
    where: { OR: [{ name: contains(q) }, { program: contains(q) }] },
    select: {
      id: true,
      name: true,
      program: true,
      section: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: PER_TYPE,
  });

  return rows.map((c: ScoreRow) => ({
    type: "penilaian",
    id: c.id,
    title: c.name,
    subtitle: `${c.program} • ${c.section.title}`,
    href: `/admin/master-data/kategori-penilaian/${c.id}`,
  }));
}

async function searchExams(q: string): Promise<AdminSearchItem[]> {
  const rows: ExamRow[] = await prisma.exam.findMany({
    where: { title: contains(q) },
    select: {
      id: true,
      title: true,
      category: { select: { name: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: "desc" },
    take: PER_TYPE,
  });

  return rows.map((e: ExamRow) => ({
    type: "bank-soal",
    id: e.id,
    title: e.title,
    subtitle: `${e.category.name} • ${e._count.questions} butir`,
    href: `/admin/master-data/soal/${e.id}`,
  }));
}

async function searchQuestions(q: string): Promise<AdminSearchItem[]> {
  if (q.length < QUESTION_MIN_LENGTH) return [];

  const rows: QuestionRow[] = await prisma.question.findMany({
    where: {
      type: "QUESTION", // blok "DIRECTION" (petunjuk) bukan butir soal
      OR: [{ questionText: contains(q) }, { explanation: contains(q) }],
    },
    select: {
      id: true,
      examId: true,
      order: true,
      questionText: true,
      explanation: true,
      exam: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: PER_TYPE,
  });

  return rows.map((row: QuestionRow) => {
    const text = stripHtml(row.questionText ?? "");
    const inQuestion = text.toLowerCase().includes(q.toLowerCase());
    // Kalau kata kuncinya cuma ada di pembahasan, tampilkan cuplikan pembahasan.
    const source = inQuestion ? text : stripHtml(row.explanation ?? "");

    return {
      type: "soal" as const,
      id: row.id,
      title: makeSnippet(source, q, 45) || `Soal nomor ${row.order}`,
      subtitle: `${row.exam.title} • No. ${row.order}${inQuestion ? "" : " • pembahasan"}`,
      href: `/admin/master-data/soal/${row.examId}/edit/${row.id}`,
    };
  });
}

async function searchUjian(q: string): Promise<AdminSearchItem[]> {
  const rows: UjianRow[] = await prisma.ujian.findMany({
    where: { OR: [{ title: contains(q) }, { description: contains(q) }] },
    select: {
      id: true,
      title: true,
      price: true,
      program: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: PER_TYPE,
  });

  return rows.map((u: UjianRow) => ({
    type: "ujian",
    id: u.id,
    title: u.title,
    subtitle: `${u.program.name} • ${u.price === 0 ? "Gratis" : formatRupiah(u.price)}`,
    href: `/admin/ujian/${u.id}`,
  }));
}

async function searchAnnouncements(q: string): Promise<AdminSearchItem[]> {
  const rows: AnnouncementRow[] = await prisma.announcement.findMany({
    where: { OR: [{ title: contains(q) }, { content: contains(q) }] },
    select: { id: true, title: true, content: true },
    orderBy: { createdAt: "desc" },
    take: PER_TYPE,
  });

  return rows.map((a: AnnouncementRow) => ({
    type: "pengumuman",
    id: a.id,
    title: a.title,
    subtitle: a.content ? makeSnippet(stripHtml(a.content), q, 45) : undefined,
    href: `/admin/pengumuman/edit/${a.id}`,
  }));
}

async function searchFaqs(q: string): Promise<AdminSearchItem[]> {
  const rows: FaqRow[] = await prisma.faq.findMany({
    where: {
      OR: [{ question: contains(q) }, { answer: contains(q) }, { category: contains(q) }],
    },
    select: { id: true, question: true, answer: true, category: true, isActive: true },
    orderBy: { createdAt: "desc" },
    take: PER_TYPE,
  });

  return rows.map((f: FaqRow) => ({
    type: "faq",
    id: f.id,
    title: f.question,
    subtitle: f.category ?? makeSnippet(stripHtml(f.answer), q, 45),
    href: `/admin/faq/edit/${f.id}`,
    badge: f.isActive ? undefined : "Nonaktif",
    tone: "neutral",
  }));
}

async function searchTransactions(q: string): Promise<AdminSearchItem[]> {
  // Sengaja tidak mengambil snapToken / paymentResponse / redirectUrl.
  const rows: TransactionRow[] = await prisma.transaction.findMany({
    where: {
      OR: [
        { invoice: contains(q) },
        { midtransOrderId: contains(q) },
        { user: { is: { name: contains(q) } } },
        { user: { is: { email: contains(q) } } },
        { ujian: { is: { title: contains(q) } } },
      ],
    },
    select: {
      id: true,
      invoice: true,
      status: true,
      user: { select: { name: true, email: true } },
      ujian: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: PER_TYPE,
  });

  return rows.map((t: TransactionRow) => {
    const status = TRANSACTION_STATUS[t.status];
    return {
      type: "transaksi" as const,
      id: t.id,
      title: t.invoice,
      subtitle: `${t.user.name || t.user.email || "Tanpa nama"} • ${t.ujian.title}`,
      href: `/admin/transaksi/${t.id}`,
      badge: status?.label ?? t.status,
      tone: status?.tone ?? "neutral",
    };
  });
}

/**
 * Cari ke semua data yang dikelola di panel admin.
 * Tiap jenis data dicari terpisah: kalau satu gagal, yang lain tetap kembali.
 */
export async function searchAdminData(rawQuery: string): Promise<AdminSearchItem[]> {
  const q = normalizeQuery(rawQuery);
  if (q.length < ADMIN_SEARCH_MIN_LENGTH) return [];

  // Urutan di sini = urutan grup di hasil (lihat ADMIN_SEARCH_TYPES).
  const searchers: Array<[string, () => Promise<AdminSearchItem[]>]> = [
    ["user", () => searchUsers(q)],
    ["program", () => searchPrograms(q)],
    ["penilaian", () => searchScores(q)],
    ["bank-soal", () => searchExams(q)],
    ["soal", () => searchQuestions(q)],
    ["ujian", () => searchUjian(q)],
    ["pengumuman", () => searchAnnouncements(q)],
    ["faq", () => searchFaqs(q)],
    ["transaksi", () => searchTransactions(q)],
  ];

  const settled = await Promise.allSettled(searchers.map(([, run]) => run()));

  return settled.flatMap((result, index) => {
    if (result.status === "fulfilled") return result.value;
    console.error(`ADMIN SEARCH ERROR (${searchers[index][0]}):`, result.reason);
    return [];
  });
}
