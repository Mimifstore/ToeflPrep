"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import Link from "next/link";
import SelectField from "@/components/Ui/SelectField";
import FormField, { fieldA11y, inputClass } from "@/components/Ui/FormField";
import { FormSkeleton } from "@/components/Ui/Skeleton";
import Busy from "@/components/Ui/Busy";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { fieldErrorsFromZod, readApiFailure } from "@/libs/form-errors";
import { faqBodySchema } from "@/libs/content-validation";

const RichTextEditor = dynamic(() => import("@/components/Ui/RichTextEditor"), {
  ssr: false,
});

export default function FaqForm({ id }: { id?: string }) {
  const router = useRouter();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const { errors, show, clear } = useFieldErrors();

  const [form, setForm] = useState<any>({
    question: "",
    answer: "",
    category: "",
    order: "",
    isActive: true,
  });

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
    clear(key);
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
          order: res.order ?? "",
          isActive: res.isActive ?? true,
        });
      })
      .finally(() => setLoadingFetch(false));
  }, [id]);

  const handleSubmit = async () => {
    const parsed = faqBodySchema.safeParse(form);
    if (!parsed.success) {
      show(fieldErrorsFromZod(parsed.error));
      toast.error("Ada isian yang belum benar. Periksa kolom yang ditandai merah.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(isEdit ? `/api/faq/${id}` : "/api/faq", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const failure = await readApiFailure(res, "Terjadi kesalahan");
        if (Object.keys(failure.fieldErrors).length > 0) show(failure.fieldErrors);
        toast.error(failure.message);
        return;
      }

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
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="bg-white p-4 md:p-6 rounded-2xl shadow border space-y-5"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-700">
          {isEdit ? "Edit FAQ" : "Tambah FAQ"}
        </h1>

        <Link href={`/admin/faq`} className="w-full md:w-auto">
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm w-full md:w-auto"
          >
            Kembali
          </button>
        </Link>
      </div>

      <p className="text-xs text-gray-500">
        Kolom bertanda <span className="text-red-500">*</span> wajib diisi.
      </p>

      {/* FORM */}
      <div className="space-y-4">
        <FormField label="Pertanyaan" required error={errors.question} htmlFor="faq-question">
          <input
            {...fieldA11y("faq-question", errors.question)}
            value={form.question}
            maxLength={500}
            onChange={(e) => handleChange("question", e.target.value)}
            placeholder="Masukkan pertanyaan..."
            className={inputClass(errors.question)}
          />
        </FormField>

        <FormField label="Jawaban" required error={errors.answer}>
          <div className="mt-1 editor-pilihan">
            <RichTextEditor
              value={form.answer}
              onChange={(val: any) => handleChange("answer", val)}
              error={!!errors.answer}
            />
          </div>
        </FormField>

        <FormField label="Kategori" error={errors.category} htmlFor="faq-category">
          <input
            {...fieldA11y("faq-category", errors.category)}
            value={form.category}
            maxLength={100}
            onChange={(e) => handleChange("category", e.target.value)}
            placeholder="Contoh: Umum / Pembayaran / Ujian"
            className={inputClass(errors.category)}
          />
        </FormField>

        <FormField
          label="Urutan"
          error={errors.order}
          htmlFor="faq-order"
          hint="Angka kecil tampil lebih dulu. Kosongkan untuk 0."
        >
          <input
            {...fieldA11y("faq-order", errors.order)}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={form.order}
            onChange={(e) => handleChange("order", e.target.value)}
            placeholder="Contoh: 1"
            className={inputClass(errors.order)}
          />
        </FormField>

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

      {/* ACTION */}
      <div className="flex justify-start">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Busy loading={loading} text="Menyimpan...">
            {isEdit ? "Update" : "Simpan"}
          </Busy>
        </button>
      </div>
    </form>
  );
}
