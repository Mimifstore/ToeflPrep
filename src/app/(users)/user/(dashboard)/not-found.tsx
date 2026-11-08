import { SearchX } from "lucide-react";
import { ActionLink } from "@/components/dashboardUser/ui/ActionButton";
import EmptyState from "@/components/dashboardUser/ui/EmptyState";

// Tampil di dalam shell dashboard (sidebar & topbar tetap ada) untuk notFound() dari halaman siswa.
export default function DashboardNotFound() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <EmptyState
        icon={SearchX}
        title="Halaman tidak ditemukan"
        description="Data yang kamu cari tidak ada atau sudah dipindahkan."
        action={
          <ActionLink href="/user/tryout" size="md">
            Ke halaman Try Out
          </ActionLink>
        }
      />
    </div>
  );
}
