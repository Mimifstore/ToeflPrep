import ProgramTable from "@/components/dashboardAdmin/masterData/program/ProgramTable";

export default function ProgramPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-700">
        Kategori Peminatan
      </h1>

      <ProgramTable />
    </section>
  );
}