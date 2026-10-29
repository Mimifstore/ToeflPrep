"use client";

import StatCards from "@/components/dashboardAdmin/dashboard/StatCards";
// import AnnouncementTable from "@/components/dashboardUser/dashboard/AnnouncementTable";
// import ExerciseTable from "@/components/dashboardUser/dashboard/ExerciseTable";
import { TransactionTable } from "@/components/dashboardAdmin/transaksi/TransactionTable";

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <StatCards />
      {/* <AnnouncementTable /> */}
      {/* <ExerciseTable /> */}
      <TransactionTable />
    </section>
  );
}