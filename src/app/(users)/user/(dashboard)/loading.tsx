import { PageSkeleton } from "@/components/Ui/Skeleton";

// Tampil di dalam shell (sidebar & topbar tetap ada) saat pindah antar halaman dashboard siswa.
export default function Loading() {
  return <PageSkeleton />;
}
