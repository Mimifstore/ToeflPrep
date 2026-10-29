import { TransactionTable } from "@/components/dashboardAdmin/transaksi/TransactionTable";

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold mb-4 text-gray-700">Data Transaksi</h1>
      <TransactionTable />
    </div>
  );
}
