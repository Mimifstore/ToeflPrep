import BrandLoader from "@/components/Ui/BrandLoader";

// Tampil selama layout admin masih diproses server (cek login + data akun),
// yaitu jeda antara login dan sidebar/topbar muncul. Sengaja di level route group (admin),
// bukan di folder admin/, karena yang ditunggu adalah layout-nya sendiri.
export default function AdminLoading() {
  return <BrandLoader variant="screen" />;
}
