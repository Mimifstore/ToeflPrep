import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { FIELD_ERROR_ATTR } from "@/libs/form-errors";

type FormFieldProps = {
  label?: string;
  /** Tampilkan bintang merah (field wajib diisi). */
  required?: boolean;
  /** Pesan error. Ada isinya = field ditandai merah. */
  error?: string;
  hint?: string;
  /** id input di dalamnya, supaya label bisa diklik dan error terbaca screen reader. */
  htmlFor?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Pembungkus satu field form: label + bintang wajib + pesan error di bawahnya.
 * Wrapper-nya diberi penanda `data-field-error` saat error, dipakai untuk scroll & fokus ke field pertama yang salah.
 */
export default function FormField({
  label,
  required,
  error,
  hint,
  htmlFor,
  className = "",
  children,
}: FormFieldProps) {
  return (
    <div
      className={`space-y-1 ${className}`}
      {...(error ? { [FIELD_ERROR_ATTR]: "true" } : {})}
    >
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
          {label}
          {required && (
            <span className="ml-0.5 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children}

      {error ? (
        <FieldError id={htmlFor ? `${htmlFor}-error` : undefined} message={error} />
      ) : (
        hint && <p className="text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}

/** Pesan error merah di bawah field (untuk layout yang tidak memakai <FormField>). */
export function FieldError({ message, id }: { message: string; id?: string }) {
  return (
    <p id={id} role="alert" className="flex items-start gap-1 text-xs text-red-600">
      <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

/** Class input standar. Dengan error: border dan latar kemerahan. */
export function inputClass(error?: string | boolean) {
  return `w-full border px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
    error
      ? "border-red-500 bg-red-50/40 focus:ring-red-200 focus:border-red-500"
      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
  }`;
}

/** Atribut aksesibilitas untuk input di dalam FormField. */
export function fieldA11y(id: string, error?: string) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  } as const;
}
