/** Nama kategori (TOEFL, TOEIC, dst) dengan gaya yang sama seperti tabel admin. */
export default function CategoryBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded bg-blue-500 px-2 py-0.5 text-[11px] font-medium text-white">
      {name}
    </span>
  );
}
