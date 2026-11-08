"use client";

import { GraduationCap } from "lucide-react";
import { CategoryCardsSkeleton } from "@/components/dashboardUser/skeletons";
import EmptyState from "@/components/dashboardUser/ui/EmptyState";
import ErrorState from "@/components/dashboardUser/ui/ErrorState";
import PageHeader from "@/components/dashboardUser/ui/PageHeader";
import { useApiData } from "@/hooks/useApiData";
import type { ProgramItem } from "@/types/user-tryout";
import CategoryCard from "./CategoryCard";

export default function TryoutTable() {
  const { data, status, reload } = useApiData<ProgramItem[]>("/api/program");
  const programs = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Try Out"
        description="Pilih kategori ujian yang ingin kamu latih, lalu kerjakan paket try out di dalamnya."
      />

      {status === "loading" ? (
        <CategoryCardsSkeleton />
      ) : status === "error" ? (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <ErrorState message="Kategori belum bisa dimuat." onRetry={reload} />
        </div>
      ) : programs.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <EmptyState
            icon={GraduationCap}
            title="Belum ada kategori"
            description="Kategori try out akan tampil di sini setelah ditambahkan admin."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <CategoryCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </div>
  );
}
