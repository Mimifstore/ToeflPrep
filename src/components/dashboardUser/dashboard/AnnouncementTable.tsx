"use client";

import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";
import { AnnouncementListSkeleton } from "@/components/dashboardUser/skeletons";
import DashboardCard, { CardLink } from "@/components/dashboardUser/ui/DashboardCard";
import EmptyState from "@/components/dashboardUser/ui/EmptyState";
import ErrorState from "@/components/dashboardUser/ui/ErrorState";
import { useApiData } from "@/hooks/useApiData";
import { makeSnippet, stripHtml } from "@/libs/admin-search-utils";
import { formatDate, isWithinLastDay } from "@/libs/user-format";
import type { AnnouncementItem } from "@/types/user-dashboard";

const LIMIT = 5;
const SNIPPET_RADIUS = 45;

export default function AnnouncementTable() {
  const { data, status, reload } = useApiData<{ data: AnnouncementItem[] }>(
    `/api/announcement?limit=${LIMIT}`,
  );
  const items = data?.data ?? [];

  return (
    <DashboardCard
      title="Pengumuman"
      subtitle="Info terbaru dari admin"
      action={<CardLink href="/user/pengumuman">Lihat semua</CardLink>}
    >
      {status === "loading" ? (
        <AnnouncementListSkeleton count={LIMIT} />
      ) : status === "error" ? (
        <ErrorState onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Belum ada pengumuman"
          description="Info dan kabar terbaru akan muncul di sini."
        />
      ) : (
        <ul className="-mx-2 divide-y divide-gray-100">
          {items.map((item) => {
            const isNew = isWithinLastDay(item.createdAt);
            const snippet = item.content
              ? makeSnippet(stripHtml(item.content), "", SNIPPET_RADIUS)
              : "";

            return (
              <li key={item.id}>
                <Link
                  href={`/user/pengumuman/${item.id}`}
                  className="group flex items-start gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      isNew ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-gray-800">
                        {item.title}
                      </span>
                      {isNew && (
                        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          Baru
                        </span>
                      )}
                    </span>
                    {snippet && (
                      <span className="mt-0.5 line-clamp-2 block text-xs text-gray-500">
                        {snippet}
                      </span>
                    )}
                    <span className="mt-1 block text-[11px] text-gray-400">
                      {formatDate(item.createdAt)}
                    </span>
                  </span>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-gray-500" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}
