"use client";

import { Clock } from "lucide-react";

type Props = {
  value: string;
};

export default function Timer({ value }: Props) {
  // "∞" (tanpa batas waktu) atau format tak dikenal: tampilkan apa adanya
  const parts = value.split(":").map((n) => parseInt(n, 10));
  const hasTime = parts.length === 3 && parts.every((n) => !Number.isNaN(n));

  const totalSeconds = hasTime ? parts[0] * 3600 + parts[1] * 60 + parts[2] : null;

  const isDanger = totalSeconds !== null && totalSeconds <= 5 * 60;
  const isWarning =
    totalSeconds !== null && !isDanger && totalSeconds <= 10 * 60;

  const color = isDanger
    ? "text-red-600"
    : isWarning
      ? "text-amber-600"
      : "text-gray-800";

  return (
    <div
      role="timer"
      aria-label="Sisa waktu"
      className={`flex items-center gap-2 transition-colors ${color}`}
    >
      <p className={`w-5 h-5 ${isDanger ? "animate-pulse" : ""}`} />

      <span className="text-xl lg:text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </span>
    </div>
  );
}