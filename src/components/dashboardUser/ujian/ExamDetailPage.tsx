"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import toast from "react-hot-toast";
import { ActionButton, ActionLink } from "@/components/dashboardUser/ui/ActionButton";
import CategoryBadge from "@/components/dashboardUser/ui/CategoryBadge";
import PageHeader from "@/components/dashboardUser/ui/PageHeader";
import { formatExamDuration, getSectionTimes } from "@/libs/exam-format";
import type { ExamDetail, ExamParticipant } from "@/types/user-tryout";
import ExamInformation from "./ExamInformation";
import ExamRules from "./ExamRules";

const DEFAULT_DESCRIPTION = "Baca aturan dan petunjuk dengan teliti sebelum memulai ujian.";

/** Kalau halaman ujian tak kunjung terbuka (jaringan putus), tombol dikembalikan supaya bisa dicoba lagi. */
const START_TIMEOUT_MS = 15_000;

type ExamDetailPageProps = {
  exam: ExamDetail;
  user: ExamParticipant;
  /** Sesi ujian ini yang masih berjalan, kalau ada. */
  ongoingSessionId: string | null;
};

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-gray-800">{children}</dd>
    </div>
  );
}

export default function ExamDetailPage({ exam, user, ongoingSessionId }: ExamDetailPageProps) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const sections = exam.timeType === "SINGLE" ? [] : getSectionTimes(exam);

  useEffect(() => {
    if (!starting) return;
    const timer = setTimeout(() => setStarting(false), START_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [starting]);

  const handleStart = async () => {
    setStarting(true);

    try {
      const res = await fetch("/api/tryout/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ujianId: exam.id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.sessionId) throw new Error(data?.message || "Gagal memulai ujian");

      // Spinner dibiarkan sampai halaman ujian terbuka, jadi tombol tidak bisa diklik dua kali.
      router.push(`/user/tryout/session/${data.sessionId}`);
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : "Gagal memulai ujian");
      setStarting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/user/tryout/${exam.programId}`}
        backLabel={`Kembali ke ${exam.program.name}`}
        title={exam.title}
        description={exam.description || DEFAULT_DESCRIPTION}
        meta={<CategoryBadge name={exam.program.name} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* RINGKASAN + TOMBOL MULAI (di HP tampil paling atas) */}
        <aside className="lg:order-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="font-semibold text-gray-900">Ringkasan Ujian</h2>

            <dl className="mt-4 space-y-4 text-sm">
              <SummaryRow label="Kategori">{exam.program.name}</SummaryRow>

              <SummaryRow label="Durasi">
                {formatExamDuration(exam)}
                {sections.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {sections.map((section) => (
                      <li
                        key={section.label}
                        className="rounded-md bg-gray-100 px-2 py-1 text-xs font-normal text-gray-600"
                      >
                        {section.label} · {section.minutes} mnt
                      </li>
                    ))}
                  </ul>
                )}
              </SummaryRow>

              <SummaryRow label="Peserta">
                {user.name || "–"}
                {user.email && <span className="block text-xs font-normal text-gray-500">{user.email}</span>}
              </SummaryRow>
            </dl>

            {ongoingSessionId && (
              <p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                Kamu punya sesi ujian ini yang masih berjalan. Waktu tetap berjalan selama kamu keluar.
              </p>
            )}

            <div className="mt-5">
              {ongoingSessionId ? (
                <ActionLink
                  href={`/user/tryout/session/${ongoingSessionId}`}
                  variant="warning"
                  size="md"
                  icon={Play}
                  fullWidth
                >
                  Lanjutkan Ujian
                </ActionLink>
              ) : (
                <ActionButton onClick={handleStart} loading={starting} size="md" icon={Play} fullWidth>
                  Mulai Kerjakan
                </ActionButton>
              )}
            </div>
          </div>
        </aside>

        {/* ATURAN + PETUNJUK */}
        <div className="space-y-6 lg:order-1 lg:col-span-2">
          <ExamRules exam={exam} />
          <ExamInformation />
        </div>
      </div>
    </div>
  );
}
