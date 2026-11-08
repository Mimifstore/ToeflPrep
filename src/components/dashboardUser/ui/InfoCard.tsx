import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type InfoCardProps = {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
};

/** Kartu bagian informasi dengan judul berikon (aturan ujian, petunjuk, dst). */
export default function InfoCard({ icon: Icon, title, children }: InfoCardProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}
