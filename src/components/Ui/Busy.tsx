import type { ReactNode } from "react";
import Spinner from "./Spinner";

/**
 * Isi tombol yang punya state proses:
 *   <button disabled={saving}><Busy loading={saving} text="Menyimpan...">Simpan</Busy></button>
 * Saat loading: spinner + teks proses. Selain itu: isi biasa.
 */
export default function Busy({
  loading,
  text,
  children,
}: {
  loading: boolean;
  text: string;
  children: ReactNode;
}) {
  if (!loading) return <>{children}</>;

  return (
    <span className="inline-flex items-center justify-center gap-2">
      <Spinner />
      {text}
    </span>
  );
}
