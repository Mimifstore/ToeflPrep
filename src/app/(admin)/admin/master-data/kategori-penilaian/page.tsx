import KategoriPenilaianTable from "@/components/dashboardAdmin/masterData/kategori-penilaian/KategoriPenilaianTable";

export default function Page() {
  return (
    <section className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-700">Kategori Penilaian</h1>

      <KategoriPenilaianTable />
    </section>
  );
}
