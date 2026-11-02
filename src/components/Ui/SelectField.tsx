"use client";

import { useEffect, useId, useRef, useState } from "react";
import FormField from "./FormField";

type Option = {
  value: string;
  label: string;
};

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  /** Bintang merah di label. */
  required?: boolean;
  /** Pesan error: kotak jadi merah dan pesannya tampil di bawah. */
  error?: string;
  hint?: string;
};

export default function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "[ Pilih ]",
  disabled = false,
  required,
  error,
  hint,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  // Klik di luar menutup daftar pilihan.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <div ref={rootRef} className="relative">
        {/* SELECT BOX */}
        <div
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          data-select-trigger
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={error ? true : undefined}
          aria-disabled={disabled || undefined}
          onClick={() => !disabled && setOpen(!open)}
          onKeyDown={onKeyDown}
          className={`w-full border px-3 py-2 rounded-lg flex justify-between items-center transition focus:outline-none
        ${
          disabled
            ? "bg-gray-100 cursor-not-allowed text-gray-400"
            : "bg-white cursor-pointer"
        }
  ${
    error
      ? "border-red-500 bg-red-50/40 focus:ring-2 focus:ring-red-200"
      : open
        ? "border-blue-500 ring-2 ring-blue-200"
        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
  }`}
        >
          <span className={selected ? "text-gray-800" : "text-gray-400"}>
            {selected ? selected.label : placeholder}
          </span>

          <span
            aria-hidden="true"
            className={`transition ${
              open ? "text-blue-500 rotate-180" : "text-gray-400"
            }`}
          >
            ▾
          </span>
        </div>

        {/* OPTIONS */}
        {open && (
          <div
            id={listId}
            role="listbox"
            className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            {options.map((opt) => {
              const isActive = value === opt.value;

              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => choose(opt.value)}
                  className={`
                  px-3 py-2 text-sm cursor-pointer transition
                  ${
                    isActive
                      ? "bg-blue-400 text-white"
                      : "text-gray-700 hover:bg-blue-100"
                  }
                `}
                >
                  {opt.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FormField>
  );
}
