import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ReviewScreen from "@/components/dashboardUser/tryout/ReviewScreen";
import { getReviewService, ReviewError } from "@/service/exam/get-review.service";
import { auth } from "../../../../../../../../../auth";

type Props = {
  params: Promise<{ resultId: string }>;
};

export default async function ReviewPage({ params }: Props) {
  const { resultId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    const data = await getReviewService({ resultId, userId: session.user.id });
    return <ReviewScreen data={data} />;
  } catch (error) {
    // Pembahasan dimatikan admin / hasil bukan milik user ini → seperti halaman tidak ada.
    if (error instanceof ReviewError && error.code === "LOCKED") {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center">
            <h1 className="mb-2 text-xl font-bold text-gray-900">Pembahasan belum terbuka</h1>
            <p className="mb-6 text-sm text-gray-500">
              Pembahasan ujian ini tersedia untuk peserta dengan skor minimal{" "}
              <span className="font-semibold text-gray-800">{error.minScore}</span>.
            </p>
            <Link
              href={`/user/tryout/result/${resultId}`}
              className="inline-block rounded-2xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Kembali ke hasil
            </Link>
          </div>
        </div>
      );
    }
    return notFound();
  }
}
