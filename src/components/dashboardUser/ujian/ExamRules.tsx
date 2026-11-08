import { CircleCheck, ShieldAlert } from "lucide-react";
import InfoCard from "@/components/dashboardUser/ui/InfoCard";
import { buildExamRules } from "@/libs/exam-rules";
import type { ExamDetail } from "@/types/user-tryout";

/** Aturan yang berlaku untuk ujian ini (batas waktu dan konsekuensi keluar halaman). */
export default function ExamRules({ exam }: { exam: ExamDetail }) {
  return (
    <InfoCard icon={ShieldAlert} title="Aturan Ujian">
      <ul className="space-y-2.5">
        {buildExamRules(exam).map((rule) => (
          <li key={rule} className="flex gap-3 text-sm leading-relaxed text-gray-700">
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </InfoCard>
  );
}
