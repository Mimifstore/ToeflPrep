import { BookOpen } from "lucide-react";
import InfoCard from "@/components/dashboardUser/ui/InfoCard";
import { EXAM_INFORMATION } from "@/constants/exam-information";

/** Petunjuk umum pengerjaan ujian (teksnya sama untuk semua ujian). */
export default function ExamInformation() {
  return (
    <InfoCard icon={BookOpen} title="Petunjuk Pengerjaan">
      <ol className="space-y-3">
        {EXAM_INFORMATION.map((item, index) => (
          <li key={index} className="flex gap-3 text-sm leading-relaxed text-gray-600">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
              {index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </InfoCard>
  );
}
