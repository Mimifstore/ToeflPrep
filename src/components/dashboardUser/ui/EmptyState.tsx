import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Ajakan tindakan, biasanya <ActionLink>. */
  action?: ReactNode;
};

/** Tampilan "belum ada data". */
export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
      <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Icon className="h-6 w-6" />
      </span>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {description && <p className="max-w-xs text-xs text-gray-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
