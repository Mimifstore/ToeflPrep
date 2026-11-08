type Option<T extends string> = {
  value: T;
  label: string;
  /** Jumlah item, tampil kecil di samping label. */
  count?: number;
};

type SegmentedControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
};

/** Pilihan filter berbentuk tab pil (hanya satu yang aktif). */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium sm:gap-1.5 sm:px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`text-[11px] ${active ? "text-blue-600" : "text-gray-400"}`}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
