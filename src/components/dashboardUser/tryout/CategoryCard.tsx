import { ArrowRight } from "lucide-react";
import ProgramCover from "@/components/dashboardUser/shared/ProgramCover";
import { ActionLink } from "@/components/dashboardUser/ui/ActionButton";
import type { ProgramItem } from "@/types/user-tryout";

const DEFAULT_DESCRIPTION =
  "Pelajari materi dan kerjakan try out untuk meningkatkan kemampuan serta hasil ujianmu.";

/** Kartu kategori di halaman Try Out: sampul, jumlah paket, deskripsi, dan tombol masuk. */
export default function CategoryCard({ program }: { program: ProgramItem }) {
  const count = program._count?.ujians;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative p-3 pb-0">
        <ProgramCover name={program.name} image={program.image} className="h-40 w-full rounded-xl" />
        {count !== undefined && (
          <span className="absolute left-6 top-6 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur">
            {count === 0 ? "Belum ada ujian" : `${count} paket ujian`}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 pt-4">
        <h2 className="text-base font-semibold text-gray-900">{program.name}</h2>
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-gray-500">
          {program.description || DEFAULT_DESCRIPTION}
        </p>

        <div className="mt-auto pt-5">
          <ActionLink
            href={`/user/tryout/${program.id}`}
            variant="secondary"
            size="md"
            icon={ArrowRight}
            iconPosition="end"
            fullWidth
          >
            Lihat Paket Ujian
          </ActionLink>
        </div>
      </div>
    </article>
  );
}
