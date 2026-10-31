import { Loader2 } from "lucide-react";

/** Spinner kecil buat di dalam tombol / baris. Satu-satunya spinner yang dipakai di panel admin. */
export default function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <Loader2
      aria-hidden="true"
      className={`animate-spin motion-reduce:animate-none ${className}`}
    />
  );
}
