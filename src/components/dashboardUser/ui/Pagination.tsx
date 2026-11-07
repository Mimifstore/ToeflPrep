"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPageItems } from "@/libs/pagination";

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  /** true = semua tombol dikunci (mis. selama halaman baru dimuat). */
  disabled?: boolean;
};

const BUTTON =
  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50";
const IDLE = "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100";

/** Paginasi ringkas: Prev, nomor halaman (dengan "…" kalau banyak), Next. Di HP cukup "2 / 8". */
export default function Pagination({
  page,
  totalPages,
  total,
  perPage,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <nav
      aria-label="Navigasi halaman"
      className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row"
    >
      <p className="text-xs text-gray-400">
        Menampilkan {from}–{to} dari {total}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page === 1}
          className={`${BUTTON} ${IDLE} inline-flex items-center gap-1`}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>

        <div className="hidden items-center gap-1.5 sm:flex">
          {getPageItems(page, totalPages).map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                onClick={() => item !== page && onPageChange(item)}
                disabled={disabled}
                aria-label={`Halaman ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={`${BUTTON} ${
                  item === page ? "bg-blue-600 text-white" : IDLE
                }`}
              >
                {item}
              </button>
            ) : (
              <span key={item} aria-hidden="true" className="px-1 text-xs text-gray-400">
                …
              </span>
            ),
          )}
        </div>
        <span className="px-2 text-xs font-medium text-gray-600 sm:hidden">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page === totalPages}
          className={`${BUTTON} ${IDLE} inline-flex items-center gap-1`}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </nav>
  );
}
