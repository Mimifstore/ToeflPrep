import SiswaTable from "@/components/dashboardAdmin/masterData/siswa/SiswaTable";

export default function Page() {
  return (
    <section className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-700">
        Data Siswa
      </h1>
      <SiswaTable />
    </section>
  );
}