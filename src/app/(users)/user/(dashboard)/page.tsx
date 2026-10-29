"use client";

import StatCards from "@/components/dashboardUser/dashboard/StatCards";
import AnnouncementTable from "@/components/dashboardUser/dashboard/AnnouncementTable";
import ExerciseTable from "@/components/dashboardUser/dashboard/ExerciseTable";
import TransactionTable from "@/components/dashboardUser/dashboard/TransactionTable";

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <StatCards />
      <AnnouncementTable />
      <ExerciseTable />
      <TransactionTable />
    </section>
  );
}