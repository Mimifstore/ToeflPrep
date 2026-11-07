import { CreditCard } from "lucide-react";
import { ActionLink } from "@/components/dashboardUser/ui/ActionButton";
import type { TransactionItem } from "@/types/user-dashboard";

/** Hanya transaksi yang belum dibayar dan punya tautan pembayaran yang bisa ditindaklanjuti. */
export function hasTransactionAction(transaction: TransactionItem): boolean {
  return transaction.status === "PENDING" && Boolean(transaction.redirectUrl);
}

type TransactionActionProps = {
  transaction: TransactionItem;
  size?: "sm" | "md";
  fullWidth?: boolean;
};

/** Tombol "Bayar" (membuka halaman pembayaran di tab baru). Kosong (null) kalau tidak ada tindakan. */
export default function TransactionAction({ transaction, size, fullWidth }: TransactionActionProps) {
  if (!hasTransactionAction(transaction) || !transaction.redirectUrl) return null;

  return (
    <ActionLink
      href={transaction.redirectUrl}
      external
      icon={CreditCard}
      size={size}
      fullWidth={fullWidth}
    >
      Bayar
    </ActionLink>
  );
}
