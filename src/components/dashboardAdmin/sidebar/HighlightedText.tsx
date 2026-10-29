import { getHighlightRanges } from "@/libs/admin-nav";

/** Teks label dengan bagian yang cocok sama query dibikin tebal. */
export default function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const ranges = query ? getHighlightRanges(text, query) : [];
  if (ranges.length === 0) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(([start, end], index) => {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark key={index} className="bg-transparent font-bold text-blue-700">
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <>{parts}</>;
}
