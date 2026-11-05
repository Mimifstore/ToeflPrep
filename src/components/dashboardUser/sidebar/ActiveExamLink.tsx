import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import SidebarTooltip from "@/components/dashboardAdmin/sidebar/SidebarTooltip";
import {
  HIDE_WHEN_COLLAPSED,
  SHOW_WHEN_COLLAPSED,
} from "@/components/dashboardAdmin/sidebar/styles";
import type { ActiveExam } from "@/hooks/useActiveExam";

type ActiveExamLinkProps = {
  exam: ActiveExam | null;
  /** Sidebar lagi mode icon (desktop). */
  collapsed: boolean;
};

/** Pintasan ke sesi ujian yang masih berjalan. Tidak tampil kalau tidak ada. */
export default function ActiveExamLink({ exam, collapsed }: ActiveExamLinkProps) {
  if (!exam) return null;

  const href = `/user/tryout/session/${exam.id}`;

  return (
    <div className="mb-2 shrink-0">
      {/* Mode lebar: kartu */}
      <Link
        href={href}
        prefetch={false}
        aria-label={`Lanjutkan ujian ${exam.title}`}
        className={`block rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 transition-colors hover:bg-amber-100 ${HIDE_WHEN_COLLAPSED}`}
      >
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          Ujian berlangsung
        </span>
        <span className="mt-1 block truncate text-sm font-semibold text-gray-900">
          {exam.title}
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-amber-700">
          Lanjutkan
          <ArrowRight className="h-3 w-3" />
        </span>
      </Link>

      {/* Mode icon */}
      <div className={SHOW_WHEN_COLLAPSED}>
        <SidebarTooltip label={`Lanjutkan ujian: ${exam.title}`} enabled={collapsed}>
          <Link
            href={href}
            prefetch={false}
            aria-label={`Lanjutkan ujian ${exam.title}`}
            className="relative flex h-10 w-full items-center justify-center rounded-lg bg-amber-50 text-amber-700 transition-colors hover:bg-amber-100"
          >
            <PlayCircle className="h-5 w-5" />
            <span
              aria-hidden="true"
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-50"
            />
          </Link>
        </SidebarTooltip>
      </div>
    </div>
  );
}
