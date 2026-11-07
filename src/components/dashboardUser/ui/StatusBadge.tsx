import type { StatusMeta, StatusTone } from "@/constants/user-status";

const TONE_CLASS: Record<StatusTone, string> = {
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-600",
  info: "bg-blue-100 text-blue-700",
  neutral: "bg-gray-100 text-gray-600",
};

/** Badge status berwarna. Isinya dari `resolveStatus` (constants/user-status). */
export default function StatusBadge({ status }: { status: StatusMeta }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${TONE_CLASS[status.tone]}`}
    >
      {status.label}
    </span>
  );
}
