import BrandLoader from "@/components/Ui/BrandLoader";

// Tampil selama layout siswa masih diproses server (cek login + data akun),
// yaitu jeda antara login dan sidebar/topbar muncul. Sengaja di level route group (users),
// bukan di folder user/, karena yang ditunggu adalah layout-nya sendiri.
export default function UsersLoading() {
  return <BrandLoader variant="screen" />;
}
