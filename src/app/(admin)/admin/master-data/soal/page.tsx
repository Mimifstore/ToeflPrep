import SoalTable from "@/components/dashboardAdmin/masterData/soal/SoalTable";
export default function SoalPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-lg font-semibold text-gray-700">Judul Soal</h1>

      <SoalTable />
    </section>
  );
}
