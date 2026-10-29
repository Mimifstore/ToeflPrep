"use client";

import Timer from "./Timer";

type Props = {
  title: string;
  timer: string;
  sectionTitle: string;
  sectionNumber: number;
  totalSections: number;
};

export default function ExamHeader({
  title,
  timer,
  sectionTitle,
  sectionNumber,
  totalSections,
}: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-[78px] flex items-center justify-between gap-4">
        {/* LEFT */}
        <div className="min-w-0">
          <h1 className="text-lg lg:text-xl font-bold text-gray-900 truncate">
            {title}
          </h1>

          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              Section {sectionNumber}/{totalSections}
            </span>

            <span className="text-xs lg:text-sm text-gray-500">
              {sectionTitle}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="shrink-0">
          <Timer value={timer} />
        </div>
      </div>
    </header>
  );
}
