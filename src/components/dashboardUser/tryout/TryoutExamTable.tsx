"use client";

import { useCallback, useMemo, useState } from "react";
import { Crown, FileSearch, FileText } from "lucide-react";
import { ExamCardsSkeleton } from "@/components/dashboardUser/skeletons";
import { ActionButton, ActionLink } from "@/components/dashboardUser/ui/ActionButton";
import EmptyState from "@/components/dashboardUser/ui/EmptyState";
import ErrorState from "@/components/dashboardUser/ui/ErrorState";
import PageHeader from "@/components/dashboardUser/ui/PageHeader";
import Pagination from "@/components/dashboardUser/ui/Pagination";
import SearchInput from "@/components/dashboardUser/ui/SearchInput";
import SegmentedControl from "@/components/dashboardUser/ui/SegmentedControl";
import { useApiData } from "@/hooks/useApiData";
import { countExams, filterExams, type ExamFilter } from "@/libs/exam-filter";
import type { UjianItem } from "@/types/user-tryout";
import ExamCard from "./ExamCard";

const PER_PAGE = 6;

const DEFAULT_DESCRIPTION = "Pilih paket ujian yang ingin kamu kerjakan. Pastikan kamu sudah siap sebelum memulai.";

type TryoutExamTableProps = {
  program: { id: string; name: string; description: string | null };
  /** ID ujian yang sudah bisa dikerjakan siswa (dibeli, gratis yang sudah diambil, dst). */
  accessIds: string[];
  isMember?: boolean;
};

export default function TryoutExamTable({ program, accessIds, isMember = false }: TryoutExamTableProps) {
  const { data, status, reload } = useApiData<UjianItem[]>(
    `/api/exam?programId=${encodeURIComponent(program.id)}`,
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ExamFilter>("all");
  const [page, setPage] = useState(1);

  const items = useMemo(() => data ?? [], [data]);
  const accessSet = useMemo(() => new Set(accessIds), [accessIds]);
  // Member otomatis punya akses ke semua ujian.
  const hasAccess = useCallback((item: UjianItem) => isMember || accessSet.has(item.id), [isMember, accessSet]);

  const counts = useMemo(() => countExams(items, hasAccess), [items, hasAccess]);
  const filtered = useMemo(
    () => filterExams(items, { query, filter, hasAccess }),
    [items, query, filter, hasAccess],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const changeQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };
  const changeFilter = (value: ExamFilter) => {
    setFilter(value);
    setPage(1);
  };
  const resetFilters = () => {
    setQuery("");
    setFilter("all");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/user/tryout"
        backLabel="Semua kategori"
        title={program.name}
        description={program.description || DEFAULT_DESCRIPTION}
        meta={
          status === "ready" && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
              {items.length} paket ujian
            </span>
          )
        }
      />

      {isMember && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Crown className="h-[18px] w-[18px]" />
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-900">Kamu member</p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
              Semua paket ujian di kategori ini bisa kamu kerjakan tanpa biaya tambahan.
            </p>
          </div>
        </div>
      )}

      {status === "ready" && items.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SegmentedControl<ExamFilter>
            label="Filter ujian"
            value={filter}
            onChange={changeFilter}
            options={[
              { value: "all", label: "Semua", count: counts.all },
              { value: "owned", label: "Akses saya", count: counts.owned },
              { value: "free", label: "Gratis", count: counts.free },
              { value: "paid", label: "Berbayar", count: counts.paid },
            ]}
          />
          <SearchInput
            value={query}
            onChange={changeQuery}
            placeholder="Cari paket ujian..."
            label="Cari paket ujian"
          />
        </div>
      )}

      {status === "loading" ? (
        <ExamCardsSkeleton />
      ) : status === "error" ? (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <ErrorState message="Daftar ujian belum bisa dimuat." onRetry={reload} />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <EmptyState
            icon={FileText}
            title="Belum ada ujian di kategori ini"
            description="Paket ujian akan tampil di sini setelah ditambahkan admin."
            action={
              <ActionLink href="/user/tryout" variant="secondary" size="md">
                Lihat kategori lain
              </ActionLink>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <EmptyState
            icon={FileSearch}
            title="Tidak ada ujian yang cocok"
            description="Coba kata kunci lain atau ganti filternya."
            action={
              <ActionButton variant="secondary" size="md" onClick={resetFilters}>
                Reset filter
              </ActionButton>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((exam) => (
              <ExamCard key={exam.id} exam={exam} hasAccess={hasAccess(exam)} isMember={isMember} />
            ))}
          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            total={filtered.length}
            perPage={PER_PAGE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
