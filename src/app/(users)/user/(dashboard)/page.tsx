import AnnouncementTable from "@/components/dashboardUser/dashboard/AnnouncementTable";
import ExerciseTable from "@/components/dashboardUser/dashboard/ExerciseTable";
import StatCards from "@/components/dashboardUser/dashboard/StatCards";
import TransactionTable from "@/components/dashboardUser/dashboard/TransactionTable";

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <h1 className="sr-only">Dashboard</h1>

      <StatCards />

      {/* Layar lebar: latihan + transaksi di kiri, pengumuman di kanan. Layar kecil: satu kolom. */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExerciseTable />
        </div>
        <div className="lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:self-start">
          <AnnouncementTable />
        </div>
        <div className="lg:col-span-2">
          <TransactionTable />
        </div>
      </div>
    </section>
  );
}
