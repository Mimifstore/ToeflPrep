import CreateAnnouncementForm from "@/components/dashboardAdmin/announCement/CreateAnnonCementForm";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <CreateAnnouncementForm id={params.id} />
    </div>
  );
}
