import CreateQuestionForm from "@/components/dashboardAdmin/masterData/soal/CreateQuestionForm";

export default function Page({ params }: { params: { examId: string } }) {
  return (
    <section className="space-y-4">
      {" "}
      <h1 className="text-lg font-semibold text-gray-700">Tambah Soal</h1>{" "}
      <CreateQuestionForm examId={params.examId} />{" "}
    </section>
  );
}
