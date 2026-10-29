import {
  isNavGroup,
  type AdminNavLink,
  type AdminNavSection,
} from "@/constants/admin-navigation";

type Searchable = { label: string; keywords?: string[] };

/** Huruf kecil, tanpa aksen, spasi dirapihin. */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const tokenize = (query: string): string[] =>
  normalizeText(query).split(" ").filter(Boolean);

const haystack = (item: Searchable): string =>
  normalizeText([item.label, ...(item.keywords ?? [])].join(" "));

const matchesAll = (tokens: string[], text: string): boolean =>
  tokens.every((token) => text.includes(token));

export type FilteredAdminNav = {
  sections: AdminNavSection[];
  /** Semua link hasil filter, urut dari atas. Link pertama dipakai buat tombol Enter. */
  links: AdminNavLink[];
};

/**
 * Filter menu sidebar berdasarkan query.
 * - Semua kata di query harus ketemu (label atau keywords).
 * - Kalau group-nya cocok, semua child ikut tampil; kalau cuma child yang cocok, child itu aja.
 * - Section tanpa hasil dibuang.
 */
export function filterAdminNav(
  sections: AdminNavSection[],
  query: string,
): FilteredAdminNav {
  const tokens = tokenize(query);
  const result: AdminNavSection[] = [];
  const links: AdminNavLink[] = [];

  for (const section of sections) {
    const items: AdminNavSection["items"] = [];

    for (const item of section.items) {
      if (!isNavGroup(item)) {
        if (tokens.length === 0 || matchesAll(tokens, haystack(item))) {
          items.push(item);
          links.push(item);
        }
        continue;
      }

      const groupText = haystack(item);
      const groupMatches = tokens.length === 0 || matchesAll(tokens, groupText);
      // Child dicocokkan bareng nama group-nya, jadi "master soal" tetap ketemu "Soal".
      const children = groupMatches
        ? item.children
        : item.children.filter((child) =>
            matchesAll(tokens, `${haystack(child)} ${groupText}`),
          );

      if (children.length > 0) {
        items.push({ ...item, children });
        links.push(...children);
      }
    }

    if (items.length > 0) result.push({ ...section, items });
  }

  return { sections: result, links };
}

/** Rentang [start, end) di label yang cocok sama query, buat di-highlight. */
export function getHighlightRanges(
  label: string,
  query: string,
): Array<[number, number]> {
  const normalizedLabel = normalizeText(label);
  // Kalau normalisasi ngubah panjang teks, posisinya nggak bisa dipetakan balik.
  if (normalizedLabel.length !== label.length) return [];

  const ranges: Array<[number, number]> = [];
  for (const token of tokenize(query)) {
    const index = normalizedLabel.indexOf(token);
    if (index !== -1) ranges.push([index, index + token.length]);
  }
  ranges.sort((a, b) => a[0] - b[0]);

  const merged: Array<[number, number]> = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([range[0], range[1]]);
  }
  return merged;
}

/** Path aktif kalau sama persis, atau berada di bawahnya (/admin/ujian/123 → /admin/ujian). */
export function isPathActive(
  pathname: string,
  href: string,
  exact = false,
): boolean {
  if (pathname === href) return true;
  return !exact && pathname.startsWith(`${href}/`);
}
