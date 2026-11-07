import { Skeleton } from "@/components/Ui/Skeleton";

/**
 * Kerangka loading khusus dashboard siswa. Dibangun dari <Skeleton> yang sama dengan panel admin
 * (warna dan animasi seragam), dan ukurannya mengikuti tampilan aslinya supaya tidak ada
 * loncatan layout saat data tiba.
 */

/** Angka di kartu statistik berwarna. Tingginya sama dengan angka aslinya, jadi kartu tidak bergeser. */
export function StatValueSkeleton() {
  return (
    <div aria-hidden="true" className="mt-0.5 flex h-8 items-center">
      <div className="h-6 w-14 animate-pulse rounded bg-white/30 motion-reduce:animate-none" />
    </div>
  );
}

/** Daftar pengumuman di dashboard: titik, judul, cuplikan, tanggal. */
export function AnnouncementListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Memuat pengumuman" className="-mx-2 divide-y divide-gray-100">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} aria-hidden="true" className="flex items-start gap-3 px-2 py-3">
          <Skeleton className="mt-1.5 h-2 w-2 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Kartu kategori di halaman Try Out. */
export function CategoryCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Memuat kategori"
      className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} aria-hidden="true" className="rounded-2xl border border-gray-100 bg-white">
          <div className="p-3">
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-4 h-9 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Kartu ujian di dalam sebuah kategori. */
export function ExamCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Memuat daftar ujian"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="overflow-hidden rounded-md border border-gray-100 bg-white"
        >
          <Skeleton className="h-40 w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mx-auto mt-4 h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Daftar pertanyaan di halaman FAQ. */
export function FaqListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div role="status" aria-label="Memuat FAQ" className="space-y-2">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="rounded-xl border border-gray-100 px-4 py-3"
        >
          <div className="flex h-6 items-center justify-between gap-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Kartu profil: bagian header (avatar + identitas) dan kolom isian. */
export function ProfileSkeleton({ fields = 8 }: { fields?: number }) {
  return (
    <div
      role="status"
      aria-label="Memuat profil"
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
    >
      <div
        aria-hidden="true"
        className="flex items-center justify-between gap-4 border-b border-gray-100 bg-gray-50 p-6"
      >
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-52 max-w-full" />
            <div className="flex gap-2 pt-0.5">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
        <Skeleton className="hidden h-10 w-20 rounded-xl sm:block" />
      </div>

      <div aria-hidden="true" className="p-6">
        <Skeleton className="mb-4 h-4 w-36" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: fields }, (_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ARTICLE_LINES = ["w-full", "w-11/12", "w-full", "w-3/4", "w-full", "w-2/3"];

/** Halaman detail pengumuman: judul + tanggal, lalu isi artikel. */
export function AnnouncementDetailSkeleton() {
  return (
    <div role="status" aria-label="Memuat pengumuman" className="mx-auto max-w-4xl space-y-4">
      <div aria-hidden="true" className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-64 max-w-full" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-5 w-20 shrink-0" />
      </div>

      <div
        aria-hidden="true"
        className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm md:p-6"
      >
        {ARTICLE_LINES.map((width, i) => (
          <Skeleton key={i} className={`h-4 ${width}`} />
        ))}
      </div>
    </div>
  );
}
