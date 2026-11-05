import { prisma } from "@/libs/prisma";
import {
  formatRupiah,
  makeSnippet,
  normalizeQuery,
  stripHtml,
} from "@/libs/admin-search-utils";
import { formatDateWIB } from "@/libs/user-search-utils";
import {
  USER_SEARCH_MIN_LENGTH,
  type UserSearchItem,
  type UserSearchTone,
} from "@/types/user-search";

/** Maksimal hasil per jenis data. */
const PER_TYPE = 5;

const contains = (query: string) => ({
  contains: query,
  mode: "insensitive" as const,
});

type Status = { label: string; tone: UserSearchTone };

// Label disamakan dengan halaman Riwayat Try Out dan Riwayat Transaksi.
const SESSION_STATUS: Record<string, Status> = {
  ONGOING: { label: "Berlangsung", tone: "warning" },
  SUBMITTED: { label: "Selesai", tone: "success" },
  EXPIRED: { label: "Expired", tone: "danger" },
};

const TRANSACTION_STATUS: Record<string, Status> = {
  SUCCESS: { label: "Sukses", tone: "success" },
  PENDING: { label: "Pending", tone: "warning" },
  WAITING: { label: "Menunggu", tone: "neutral" },
  FAILED: { label: "Gagal", tone: "danger" },
};

// Bentuk baris hasil query. Sengaja ditulis eksplisit dan harus sama dengan `select` di bawahnya.
type ProgramRow = { id: string; name: string; description: string | null };
type UjianRow = {
  id: string;
  title: string;
  price: number;
  programId: string;
  program: { name: string };
};
type SessionRow = {
  id: string;
  status: string;
  startedAt: Date;
  ujian: { title: string; program: { name: string } };
  result: { id: string; score: number } | null;
};
type TransactionRow = {
  id: string;
  invoice: string;
  status: string;
  total: number;
  ujian: { title: string };
};
type AnnouncementRow = { id: string; title: string; content: string | null };
type FaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
};

async function searchPrograms(q: string): Promise<UserSearchItem[]> {
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
    href: `/user/tryout/${p.id}`,
  }));
}

async function searchUjian(q: string, userId: string): Promise<UserSearchItem[]> {
  const rows: UjianRow[] = await prisma.ujian.findMany({
    where: { OR: [{ title: contains(q) }, { description: contains(q) }] },
    select: {
      id: true,
      title: true,
      price: true,
      programId: true,
      program: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: PER_TYPE,
  });
  if (rows.length === 0) return [];

  // Aturan akses sama dengan hasExamAccess: member punya akses ke semua ujian,
  // selain itu harus ada UserExamAccess. Dicek sekaligus biar nggak 1 query per hasil.
  const [siswa, accesses] = await Promise.all([
    prisma.siswa.findUnique({ where: { userId }, select: { isMember: true } }),
    prisma.userExamAccess.findMany({
      where: { userId, ujianId: { in: rows.map((u: UjianRow) => u.id) } },
      select: { ujianId: true },
    }),
  ]);
  const grantedIds = new Set(accesses.map((a: { ujianId: string }) => a.ujianId));

  return rows.map((u: UjianRow) => {
    const hasAccess = Boolean(siswa?.isMember) || grantedIds.has(u.id);
    return {
      type: "ujian",
      id: u.id,
      title: u.title,
      subtitle: `${u.program.name} • ${u.price === 0 ? "Gratis" : formatRupiah(u.price)}`,
      // Halaman detail ujian menolak peserta tanpa akses, jadi yang belum punya akses diarahkan ke daftar ujian kategorinya.
      href: hasAccess ? `/user/tryout/ujian/${u.id}` : `/user/tryout/${u.programId}`,
      badge: hasAccess ? "Punya akses" : undefined,
      tone: hasAccess ? "success" : undefined,
    };
  });
}

async function searchHistory(q: string, userId: string): Promise<UserSearchItem[]> {
  const rows: SessionRow[] = await prisma.examSession.findMany({
    where: {
      userId,
      ujian: {
        is: { OR: [{ title: contains(q) }, { program: { is: { name: contains(q) } } }] },
      },
    },
    select: {
      id: true,
      status: true,
      startedAt: true,
      ujian: { select: { title: true, program: { select: { name: true } } } },
      result: { select: { id: true, score: true } },
    },
    orderBy: { createdAt: "desc" },
    take: PER_TYPE,
  });

  return rows.map((s: SessionRow) => {
    const status = SESSION_STATUS[s.status];
    const finished = s.status === "SUBMITTED" && s.result !== null;

    return {
      type: "riwayat" as const,
      id: s.id,
      title: s.ujian.title,
      subtitle: `${s.ujian.program.name} • ${formatDateWIB(s.startedAt)}`,
      // Sama dengan tombol di halaman Riwayat Try Out: hasil kalau sudah selesai, lanjutkan kalau masih berjalan.
      href: finished
        ? `/user/tryout/result/${s.result?.id}`
        : s.status === "ONGOING"
          ? `/user/tryout/session/${s.id}`
          : "/user/riwayat",
      badge: finished ? `Skor ${s.result?.score}` : (status?.label ?? s.status),
      tone: finished ? "success" : (status?.tone ?? "neutral"),
    };
  });
}

async function searchTransactions(q: string, userId: string): Promise<UserSearchItem[]> {
  // Sengaja tidak mengambil snapToken / redirectUrl / paymentResponse.
  const rows: TransactionRow[] = await prisma.transaction.findMany({
    where: {
      userId,
      OR: [{ invoice: contains(q) }, { ujian: { is: { title: contains(q) } } }],
    },
    select: {
      id: true,
      invoice: true,
      status: true,
      total: true,
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
      subtitle: `${t.ujian.title} • ${formatRupiah(t.total)}`,
      href: "/user/riwayatTransaksi",
      badge: status?.label ?? t.status,
      tone: status?.tone ?? "neutral",
    };
  });
}

async function searchAnnouncements(q: string): Promise<UserSearchItem[]> {
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
    href: `/user/pengumuman/${a.id}`,
  }));
}

async function searchFaqs(q: string): Promise<UserSearchItem[]> {
  // Hanya FAQ aktif, sama seperti yang tampil di halaman FAQ.
  const rows: FaqRow[] = await prisma.faq.findMany({
    where: {
      isActive: true,
      OR: [{ question: contains(q) }, { answer: contains(q) }, { category: contains(q) }],
    },
    select: { id: true, question: true, answer: true, category: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take: PER_TYPE,
  });

  return rows.map((f: FaqRow) => {
    const answer = stripHtml(f.answer);
    const inAnswer = answer.toLowerCase().includes(q.toLowerCase());

    return {
      type: "faq" as const,
      id: f.id,
      title: f.question,
      subtitle: inAnswer ? makeSnippet(answer, q, 45) : (f.category ?? undefined),
      href: `/user/faq?faq=${f.id}`,
    };
  });
}

/**
 * Cari ke semua data yang tampil di dashboard siswa. Riwayat try out dan transaksi
 * selalu dibatasi ke `userId` yang sedang login, siswa tidak pernah melihat data siswa lain.
 * Tiap jenis data dicari terpisah: kalau satu gagal, yang lain tetap kembali.
 */
export async function searchUserData(
  userId: string,
  rawQuery: string,
): Promise<UserSearchItem[]> {
  const q = normalizeQuery(rawQuery);
  if (q.length < USER_SEARCH_MIN_LENGTH) return [];

  // Urutan di sini = urutan grup di hasil (lihat USER_SEARCH_TYPES).
  const searchers: Array<[string, () => Promise<UserSearchItem[]>]> = [
    ["ujian", () => searchUjian(q, userId)],
    ["program", () => searchPrograms(q)],
    ["riwayat", () => searchHistory(q, userId)],
    ["transaksi", () => searchTransactions(q, userId)],
    ["pengumuman", () => searchAnnouncements(q)],
    ["faq", () => searchFaqs(q)],
  ];

  const settled = await Promise.allSettled(searchers.map(([, run]) => run()));

  return settled.flatMap((result, index) => {
    if (result.status === "fulfilled") return result.value;
    console.error(`USER SEARCH ERROR (${searchers[index][0]}):`, result.reason);
    return [];
  });
}
