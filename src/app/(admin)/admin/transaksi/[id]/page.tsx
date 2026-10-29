import { TransactionDetail } from "@/components/dashboardAdmin/transaksi/TransactionDetail";

export default function Page({ params }: any) {
  return (
    <div className="space-y-4">
      <TransactionDetail id={params.id} />
    </div>
  );
}
