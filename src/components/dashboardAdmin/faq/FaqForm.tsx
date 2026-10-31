"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import Link from "next/link";
import SelectField from "@/components/Ui/SelectField";
import { FormSkeleton } from "@/components/Ui/Skeleton";
import Busy from "@/components/Ui/Busy";

const RichTextEditor = dynamic(() => import("@/components/Ui/RichTextEditor"), {
  ssr: false,
});

export default function FaqForm({ id }: { id?: string }) {
  const router = useRouter();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);

  const [form, setForm] = useState<any>({
    question: "",
    answer: "",
    category: "",
    order: "",
    isActive: true,
  });

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!id) return;

    setLoadingFetch(true);
    fetch(`/api/faq/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setForm({
          question: res.question || "",
          answer: res.answer || "",
          category: res.category || "",
          order: res.order || "",
          isActive: res.isActive ?? true,
        });
      })
      .finally(() => setLoadingFetch(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!form.question) {
      toast.error("Pertanyaan wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(isEdit ? `/api/faq/${id}` : "/api/faq", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      toast.success(isEdit ? "FAQ berhasil diupdate" : "FAQ berhasil dibuat");
      router.push("/admin/faq");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (loadingFetch) {
    return <FormSkeleton />;
  }

  return (
    <form className="bg-white p-4 md:p-6 rounded-2xl shadow border space-y-5">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-700">
          {isEdit ? "Edit FAQ" : "Tambah FAQ"}
        </h1>

        <Link href={`/admin/faq`} className="w-full md:w-auto">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm w-full md:w-auto">
            Kembali
          </button>
        </Link>
      </div>

      {/* FORM */}
      <div className="space-y-4">
        {/* PERTANYAAN */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Pertanyaan
          </label>
          <input
            value={form.question}
            onChange={(e) => handleChange("question", e.target.value)}
            placeholder="Masukkan pertanyaan..."
            className="w-full border px-3 py-2 rounded-lg text-sm 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* JAWABAN */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Jawaban
          </label>
          <div className="mt-1 editor-pilihan">
            <RichTextEditor
              value={form.answer}
              onChange={(val: any) => handleChange("answer", val)}
            />
          </div>
        </div>

        {/* KATEGORI */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Kategori
          </label>
          <input
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            placeholder="Contoh: Umum / Pembayaran / Ujian"
            className="w-full border px-3 py-2 rounded-lg text-sm 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* URUTAN */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Urutan
          </label>
          <input
            type="number"
            value={form.order}
            onChange={(e) => handleChange("order", e.target.value)}
            placeholder="Contoh: 1"
            className="w-full border px-3 py-2 rounded-lg text-sm 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* STATUS */}
        <div>
          <SelectField
            label="Status"
            value={form.isActive ? "yes" : "no"}
            onChange={(val) => handleChange("isActive", val === "yes")}
            options={[
              { value: "yes", label: "Aktif" },
              { value: "no", label: "Nonaktif" },
            ]}
          />
        </div>
      </div>

      {/* ACTION */}
      <div className="flex justify-start">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm w-full md:w-auto"
        >
          <Busy loading={loading} text="Menyimpan...">{isEdit ? "Update" : "Simpan"}</Busy>
        </button>
      </div>
    </form>
  );
}