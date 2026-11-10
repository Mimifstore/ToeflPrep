import { htmlToSingleLine } from "@/libs/rich-text";

export type ExamFilter = "all" | "free" | "paid" | "owned";

type Filterable = {
  title: string;
  description: string | null;
  price: number;
};

type FilterOptions<T> = {
  query: string;
  filter: ExamFilter;
  /** Siswa sudah punya akses ke ujian ini (member atau sudah membeli/mengambil). */
  hasAccess: (item: T) => boolean;
};

function matchesFilter<T extends Filterable>(item: T, filter: ExamFilter, hasAccess: (item: T) => boolean) {
  switch (filter) {
    case "free":
      return item.price === 0;
    case "paid":
      return item.price > 0;
    case "owned":
      return hasAccess(item);
    default:
      return true;
  }
}

/** Kata kunci dipecah per kata; semuanya harus ada di judul atau deskripsi (tanpa peduli huruf besar-kecil). */
function matchesQuery(item: Filterable, query: string) {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const haystack = `${item.title} ${htmlToSingleLine(item.description)}`.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

export function filterExams<T extends Filterable>(items: T[], { query, filter, hasAccess }: FilterOptions<T>): T[] {
  return items.filter((item) => matchesFilter(item, filter, hasAccess) && matchesQuery(item, query));
}

/** Jumlah ujian untuk tiap filter (ditampilkan di tab filter). */
export function countExams<T extends Filterable>(
  items: T[],
  hasAccess: (item: T) => boolean,
): Record<ExamFilter, number> {
  const count = (filter: ExamFilter) =>
    items.filter((item) => matchesFilter(item, filter, hasAccess)).length;

  return { all: items.length, free: count("free"), paid: count("paid"), owned: count("owned") };
}
