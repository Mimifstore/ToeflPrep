"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import SelectField from "@/components/Ui/SelectField";
import FormField, { fieldA11y, inputClass } from "@/components/Ui/FormField";
import Busy from "@/components/Ui/Busy";
import { FormSkeleton } from "@/components/Ui/Skeleton";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { fieldErrorsFromZod, readApiFailure } from "@/libs/form-errors";
import { bankSoalBodySchema } from "@/libs/bank-soal-validation";

type FormState = {
  title: string;
  categoryId: string;
  totalOption: string | number;
  totalSession: string | number;
  minScoreToShow: string | number;
  // Tidak tampil di form, nilai lama dipertahankan saat menyimpan.
  useCategoryScore: boolean;
  scoringType: string;
  showCorrection: boolean;
};

const EMPTY: FormState = {
  title: "",
  categoryId: "",
  totalOption: "",
  totalSession: "",
  minScoreToShow: "",
  useCategoryScore: true,
  scoringType: "PER_KATEGORI",
  showCorrection: false,
};

export default function CreateSoalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const { errors, show, clear } = useFieldErrors();

  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    fetch("/api/program")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/soal/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          title: data.title || "",
          categoryId: data.categoryId || "",
          totalOption: data.totalOption ?? "",
          totalSession: data.totalSession ?? "",
          minScoreToShow: data.minScoreToShow ?? "",
          useCategoryScore: data.useCategoryScore ?? true,
          scoringType: data.scoringType || "PER_KATEGORI",
          showCorrection: data.showCorrection ?? false,
        });
      })
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    clear(key);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = bankSoalBodySchema.safeParse(form);
    if (!parsed.success) {
      show(fieldErrorsFromZod(parsed.error));
      toast.error("Ada isian yang belum benar. Periksa kolom yang ditandai merah.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(id ? `/api/soal/${id}` : "/api/soal", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const failure = await readApiFailure(res, "Gagal menyimpan soal");
        if (Object.keys(failure.fieldErrors).length > 0) show(failure.fieldErrors);
        toast.error(failure.message);
        return;
      }

      toast.success(id ? "Soal berhasil diupdate" : "Soal berhasil dibuat");

      router.push("/admin/master-data/soal");
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan soal");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <FormSkeleton fields={5} />;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="bg-white p-4 md:p-6 rounded-2xl shadow border space-y-5"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-base md:text-lg font-semibold text-gray-700">
          {id ? "Edit Soal" : "Tambah Soal"}
        </h1>

        <Link href="/admin/master-data/soal">
          <button
            type="button"
            className="bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm"
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
        <SelectField
          label="Kategori"
          required
          error={errors.categoryId}
          value={form.categoryId}
          onChange={(val) => handleChange("categoryId", val)}
          options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
        />

        <FormField label="Judul Soal" required error={errors.title} htmlFor="soal-title">
          <input
            {...fieldA11y("soal-title", errors.title)}
            value={form.title}
            maxLength={200}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Masukkan judul soal"
            className={inputClass(errors.title)}
          />
        </FormField>

        <FormField
          label="Jumlah Pilihan"
          error={errors.totalOption}
          htmlFor="soal-totalOption"
          hint="Hanya informasi yang tampil di daftar soal"
        >
          <input
            {...fieldA11y("soal-totalOption", errors.totalOption)}
            type="number"
            inputMode="numeric"
            min={0}
            max={10}
            value={form.totalOption}
            onChange={(e) => handleChange("totalOption", e.target.value)}
            placeholder="Contoh: 4"
            className={inputClass(errors.totalOption)}
          />
        </FormField>

        <FormField
          label="Jumlah Sesi"
          error={errors.totalSession}
          htmlFor="soal-totalSession"
          hint="Hanya informasi yang tampil di daftar soal"
        >
          <input
            {...fieldA11y("soal-totalSession", errors.totalSession)}
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={form.totalSession}
            onChange={(e) => handleChange("totalSession", e.target.value)}
            placeholder="Contoh: 3"
            className={inputClass(errors.totalSession)}
          />
        </FormField>

        <FormField
          label="Skor Minimal untuk Melihat Pembahasan"
          error={errors.minScoreToShow}
          htmlFor="soal-minScoreToShow"
          hint="Kosongkan agar semua peserta bisa melihat. Pembahasan hanya tampil jika 'Tampilkan Jawaban' diaktifkan di pengaturan ujian."
        >
          <input
            {...fieldA11y("soal-minScoreToShow", errors.minScoreToShow)}
            type="number"
            inputMode="numeric"
            min={0}
            value={form.minScoreToShow}
            onChange={(e) => handleChange("minScoreToShow", e.target.value)}
            placeholder="Contoh: 400"
            className={inputClass(errors.minScoreToShow)}
          />
        </FormField>
      </div>

      {/* ACTION */}
      <div className="flex flex-col md:flex-row gap-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
        >
          <Busy loading={loading} text="Menyimpan...">
            {id ? "Update" : "Simpan"}
          </Busy>
        </button>
      </div>
    </form>
  );
}
