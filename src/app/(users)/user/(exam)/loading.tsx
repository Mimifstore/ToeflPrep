import BrandLoader from "@/components/Ui/BrandLoader";

// Halaman ujian berjalan di luar shell dashboard, jadi saat dibuka (mis. klik "Mulai Kerjakan"
// atau "Lanjutkan") yang tampil layar logo penuh sampai soal siap, bukan halaman lama yang diam.
export default function ExamLoading() {
  return <BrandLoader variant="screen" />;
}
