"use client";

import { useState } from "react";

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
};

export default function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "[ Pilih ]",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="space-y-1 relative">
      {/* LABEL */}
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      {/* SELECT BOX */}
      <div
        onClick={() => setOpen(!open)}
        className={`w-full border px-3 py-2 rounded-lg bg-white cursor-pointer flex justify-between items-center transition
        ${
          disabled
            ? "bg-gray-100 cursor-not-allowed text-gray-400"
            : "bg-white cursor-pointer"
        }
  ${open ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300"}`}
      >
        <span className={selected ? "text-gray-800" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>

        <span
          className={`transition ${
            open ? "text-blue-500 rotate-180" : "text-gray-400"
          }`}
        >
          ▾
        </span>
      </div>

      {/* OPTIONS */}
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {options.map((opt) => {
            const isActive = value === opt.value;

            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
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
  );
}
