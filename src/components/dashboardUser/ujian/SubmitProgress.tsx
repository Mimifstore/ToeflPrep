"use client";

import { Check } from "lucide-react";

type Props = {
  done: boolean;
};

// Spinner yang berubah jadi lingkaran hijau dengan centang saat selesai
export default function SubmitProgress({ done }: Props) {
  return (
    <div className="relative w-16 h-16" aria-hidden="true">
      {/* spinner */}
      <div
        className={`absolute inset-0 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin transition-opacity duration-200 ${
          done ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* centang hijau */}
      <div
        className={`absolute inset-0 rounded-full bg-emerald-500 flex items-center justify-center transition-all duration-300 ${
          done ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        <Check className="w-8 h-8 text-white" strokeWidth={3} />
      </div>
    </div>
  );
}
