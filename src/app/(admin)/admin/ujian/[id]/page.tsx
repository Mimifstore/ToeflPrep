import DetailUjian from "@/components/dashboardAdmin/ujian/DetailUjian";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <DetailUjian id={params.id} />
    </div>
  );
}