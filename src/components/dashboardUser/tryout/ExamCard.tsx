"use client";

import { Clock, Crown, FileText, Play } from "lucide-react";
import { ActionButton, ActionLink } from "@/components/dashboardUser/ui/ActionButton";
import { formatExamDuration } from "@/libs/exam-format";
import { resolveExamAction, type ExamAction } from "@/libs/exam-offer";
import { formatRupiah } from "@/libs/admin-search-utils";
import type { UjianItem } from "@/types/user-tryout";
import BuyButton from "./BuyButton";
import FreeAccessButton from "./FreeAccessButton";

const DEFAULT_DESCRIPTION = "Kerjakan soal sesuai petunjuk yang tersedia di halaman ujian.";

type ExamCardProps = {
  exam: UjianItem;
  hasAccess: boolean;
  isMember: boolean;
};

/** Penanda kecil di pojok kanan atas kartu. */
function StateChip({ action, exam, isMember }: { action: ExamAction; exam: UjianItem; isMember: boolean }) {
  const base = "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium";

  if (action === "unavailable") return <span className={`${base} bg-gray-100 text-gray-500`}>Segera hadir</span>;
  if (action === "start" && isMember) {
    return (
      <span className={`${base} bg-amber-50 text-amber-700`}>
        <Crown className="h-3 w-3" />
        Member
      </span>
    );
  }
  if (action === "start") return <span className={`${base} bg-green-50 text-green-700`}>Dimiliki</span>;
  if (exam.price === 0) return <span className={`${base} bg-green-50 text-green-700`}>Gratis</span>;
  return null;
}

/** Harga (atau status akses) di kiri bawah kartu. */
function PriceBlock({ exam, hasAccess }: { exam: UjianItem; hasAccess: boolean }) {
  if (hasAccess) {
    return (
      <div>
        <p className="text-[11px] text-gray-400">Akses</p>
        <p className="text-base font-bold text-green-600">Aktif</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] text-gray-400">Harga</p>
      {exam.price === 0 ? (
        <p className="text-base font-bold text-green-600">Gratis</p>
      ) : (
        <p className="text-base font-bold text-gray-900">{formatRupiah(exam.price)}</p>
      )}
    </div>
  );
}

function CardAction({ action, examId }: { action: ExamAction; examId: string }) {
  switch (action) {
    case "unavailable":
      return (
        <ActionButton variant="secondary" size="md" icon={Clock} disabled>
          Belum tersedia
        </ActionButton>
      );
    case "start":
      return (
        <ActionLink href={`/user/tryout/ujian/${examId}`} icon={Play} size="md">
          Kerjakan
        </ActionLink>
      );
    case "claim-free":
      return <FreeAccessButton ujianId={examId}>Ambil Akses</FreeAccessButton>;
    case "buy":
      return <BuyButton ujianId={examId}>Beli Paket</BuyButton>;
  }
}

export default function ExamCard({ exam, hasAccess, isMember }: ExamCardProps) {
  const action = resolveExamAction({ ready: exam.ready, price: exam.price, hasAccess });

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <FileText className="h-5 w-5" />
        </span>
        <StateChip action={action} exam={exam} isMember={isMember} />
      </div>

      <h2 className="mt-4 line-clamp-2 text-base font-semibold leading-snug text-gray-900">{exam.title}</h2>
      {/* min-h = tepat 2 baris (2 x 1.625 x 0.875rem), supaya baris durasi sejajar di semua kartu */}
      <p className="mt-1.5 line-clamp-2 min-h-[2.85rem] text-sm leading-relaxed text-gray-500">
        {exam.description || DEFAULT_DESCRIPTION}
      </p>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
        <Clock className="h-3.5 w-3.5 text-gray-400" />
        {formatExamDuration(exam)}
      </div>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <PriceBlock exam={exam} hasAccess={hasAccess} />
          <CardAction action={action} examId={exam.id} />
        </div>
      </div>
    </article>
  );
}
