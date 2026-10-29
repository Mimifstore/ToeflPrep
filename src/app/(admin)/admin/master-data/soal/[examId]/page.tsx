import DetailSoal from "@/components/dashboardAdmin/masterData/soal/DetailSoal";

export default function Page({ params }: { params: { examId: string } }) {
  return (
    <section className="space-y-2 md:space-y-4">
      <h1 className="text-base md:text-lg font-semibold text-gray-700">
        Data Soal
      </h1>

      <DetailSoal examId={params.examId} />
    </section>
  );
}