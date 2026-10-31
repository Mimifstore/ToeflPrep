"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { DetailSkeleton } from "@/components/Ui/Skeleton";
import Busy from "@/components/Ui/Busy";

export default function DetailUjian({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/exam/${id}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (!data) return <div>Data tidak ditemukan</div>;

  return (
    <div className="bg-white rounded-2xl shadow border p-4 md:p-6 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <h1 className="text-base md:text-lg font-semibold text-gray-700">
          Data Ujian
        </h1>

        <div className="flex flex-col gap-2 md:flex-row">
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center justify-center gap-1 bg-red-500 text-white w-full md:w-auto px-3 py-2 rounded-lg text-sm"
          >
            <Trash2 size={14} /> Hapus
          </button>

          <Link href={`/admin/ujian`} className="w-full md:w-auto">
            <button className="bg-blue-600 text-white w-full md:w-auto px-4 py-2 rounded-lg text-sm">
              Kembali
            </button>
          </Link>
        </div>
      </div>

      {/* DATA */}
      <div className="mt-4 space-y-3 text-sm text-gray-600">
        {[
          {
            label: "Peminatan",
            value: (
              <span className="bg-blue-400 text-white px-2 py-1 rounded text-xs">
                {data.program?.name || "-"}
              </span>
            ),
          },
          {
            label: "Judul Soal",
            value: data.questionBank?.title || "-",
          },
          {
            label: "Judul Ujian",
            value: data.title || "-",
          },
          {
            label: "Harga",
            value: `Rp ${data.price?.toLocaleString("id-ID") || 0}`,
          },
          {
            label: "Durasi",
            value:
              data.timeType === "SINGLE"
                ? `${data.totalTime || 0} Menit`
                : "Per Section",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="flex flex-col md:flex-row border-b pb-2"
          >
            <span className="md:w-72 font-semibold">{item.label}</span>
            <span className="hidden md:block mr-2">:</span>
            <span className="font-medium mt-1 md:mt-0">{item.value}</span>
          </div>
        ))}

        {data.timeType === "PER_SECTION" && (
          <>
            {[
              { label: "Listening", value: `${data.listeningTime || 0} Menit` },
              { label: "Structure", value: `${data.structureTime || 0} Menit` },
              { label: "Reading", value: `${data.readingTime || 0} Menit` },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row border-b pb-2"
              >
                <span className="md:w-72 font-semibold">{item.label}</span>
                <span className="hidden md:block mr-2">:</span>
                <span className="font-medium mt-1 md:mt-0">
                  {item.value}
                </span>
              </div>
            ))}
          </>
        )}

        {[
          { label: "Soal Acak", value: bool(data.shuffleQuestions) },
          { label: "Jawaban Acak", value: bool(data.shuffleAnswers) },
          { label: "Tampilkan Jawaban", value: bool(data.showAnswer) },
          { label: "Navigasi Soal", value: bool(data.showNavigation) },
          { label: "Nomor Soal", value: bool(data.showQuestionNumber) },
          { label: "Auto Next", value: bool(data.autoNextQuestion) },
          { label: "Button Prev/Next", value: bool(data.showPrevNextButton) },
          {
            label: "Tipe Soal",
            value:
              data.questionDisplayType === "OPTION"
                ? "Pilihan"
                : "Menyatu",
          },
          { label: "Max Keluar", value: `${data.maxExitAttempts || 0}x` },
        ].map((item, i) => (
          <div
            key={i}
            className="flex flex-col md:flex-row border-b pb-2"
          >
            <span className="md:w-72 font-semibold">{item.label}</span>
            <span className="hidden md:block mr-2">:</span>
            <span className="font-medium mt-1 md:mt-0">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* DESKRIPSI */}
      {data.description && (
        <div className="border rounded-xl p-4">
          <div className="font-medium mb-2">Deskripsi</div>
          <div
            className="text-sm text-gray-600"
            dangerouslySetInnerHTML={{ __html: data.description }}
          />
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Hapus Ujian</h2>
            <p className="text-sm text-gray-500 mb-4">
              Yakin mau hapus ujian ini?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteOpen(false)}
                className="px-3 py-2 text-sm bg-gray-100 rounded-lg"
              >
                Batal
              </button>

              <button
                disabled={loadingDelete}
                onClick={async () => {
                  try {
                    setLoadingDelete(true);

                    const res = await fetch(`/api/ujian/${id}`, {
                      method: "DELETE",
                    });

                    if (!res.ok) throw new Error();

                    toast.success("Ujian berhasil dihapus");
                    router.push("/admin/ujian");
                  } catch (err) {
                    toast.error("Gagal menghapus ujian");
                  } finally {
                    setLoadingDelete(false);
                  }
                }}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg"
              >
                <Busy loading={loadingDelete} text="Menghapus...">Hapus</Busy>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function bool(val: boolean) {
  if (val === true) return "Ya";
  if (val === false) return "Tidak";
  return "-";
}