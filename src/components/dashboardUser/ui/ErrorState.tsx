"use client";

import { TriangleAlert } from "lucide-react";
import { ActionButton } from "./ActionButton";

type ErrorStateProps = {
  message?: string;
  onRetry: () => void;
};

/** Data gagal dimuat, lengkap dengan tombol "Coba lagi". */
export default function ErrorState({
  message = "Data belum bisa dimuat.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <TriangleAlert className="h-7 w-7 text-gray-300" />
      <p className="text-sm text-gray-600">{message}</p>
      <ActionButton variant="secondary" onClick={onRetry}>
        Coba lagi
      </ActionButton>
    </div>
  );
}
