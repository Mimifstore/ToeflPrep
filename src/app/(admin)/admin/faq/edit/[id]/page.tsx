import FaqForm from "@/components/dashboardAdmin/faq/FaqForm";
export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <FaqForm id={params.id} />
    </div>
  );
}
