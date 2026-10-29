import { AnnountCementDetail } from "@/components/dashboardUser/announCement/AnnounCementDetail";

export default function Page({ params }: any) {
  return (
    <div className="p-6">
      <AnnountCementDetail id={params.id} />
    </div>
  );
}
