"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import SelectField from "@/components/Ui/SelectField";
import Busy from "@/components/Ui/Busy";

export default function CreateSoalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    categoryId: "",
    totalOption: "",
    totalSession: "",
    useCategoryScore: "",
    scoringType: "",
    showCorrection: "",
    minScoreToShow: "",
  });

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
          totalOption: data.totalOption || "",
          totalSession: data.totalSession || "",
          useCategoryScore: String(data.useCategoryScore),
          scoringType: data.scoringType || "",
          showCorrection: String(data.showCorrection),
          minScoreToShow: data.minScoreToShow || "",
        });
      });
  }, [id]);

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);

      const url = id ? `/api/soal/${id}` : "/api/soal";
      const method = id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          useCategoryScore: form.useCategoryScore === "true",
          showCorrection: form.showCorrection === "true",
          minScoreToShow: form.minScoreToShow
            ? Number(form.minScoreToShow)
            : null,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success(id ? "Soal berhasil diupdate" : "Soal berhasil dibuat");

      router.push("/admin/master-data/soal");
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan soal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
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

      {/* FORM */}
      <div className="space-y-4">
        {/* KATEGORI */}
        <SelectField
          label="Kategori"
          value={form.categoryId}
          onChange={(val) => handleChange("categoryId", val)}
          options={[
            { value: "", label: "[ Pilih ]" },
            ...categories.map((c: any) => ({
              value: c.id,
              label: c.name,
            })),
          ]}
        />

        {/* JUDUL */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Judul Soal
          </label>
          <input
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Masukkan judul soal"
            className="w-full border px-3 py-2 rounded-lg text-sm 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* JUMLAH PILIHAN */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Jumlah Pilihan
          </label>
          <input
            type="number"
            value={form.totalOption}
            onChange={(e) => handleChange("totalOption", e.target.value)}
            placeholder="Masukkan jumlah pilihan"
            className="w-full border px-3 py-2 rounded-lg text-sm 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* JUMLAH SESI */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Jumlah Sesi
          </label>
          <input
            type="number"
            value={form.totalSession}
            onChange={(e) => handleChange("totalSession", e.target.value)}
            placeholder="Masukkan jumlah sesi"
            disabled={form.useCategoryScore === "true"}
            className="w-full border px-3 py-2 rounded-lg text-sm 
            disabled:bg-gray-100
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* KATEGORI PENILAIAN */}
        <SelectField
          label="Tambahkan Kategori Penilaian"
          value={form.useCategoryScore}
          onChange={(val) => handleChange("useCategoryScore", val)}
          options={[
            { value: "", label: "[ Pilih ]" },
            { value: "true", label: "Ya" },
            { value: "false", label: "Tidak" },
          ]}
        />

        {/* JENIS PENILAIAN */}
        <SelectField
          label="Jenis Penilaian"
          value={form.scoringType}
          onChange={(val) => handleChange("scoringType", val)}
          options={[
            { value: "", label: "[ Pilih ]" },
            {
              value: "PER_KATEGORI",
              label: "Dihitung Per Kategori Penilaian",
            },
          ]}
        />

        {/* KOREKSI */}
        <SelectField
          label="Tampilkan Koreksi Jawaban"
          value={form.showCorrection}
          onChange={(val) => handleChange("showCorrection", val)}
          options={[
            { value: "", label: "[ Pilih ]" },
            { value: "true", label: "Ya" },
            { value: "false", label: "Tidak" },
          ]}
        />

        {/* CONDITIONAL */}
        {form.showCorrection === "true" && (
          <div>
            <label className="text-sm font-medium text-gray-700">
              Minimal Nilai untuk Melihat Jawaban
            </label>
            <input
              type="number"
              value={form.minScoreToShow}
              onChange={(e) =>
                handleChange("minScoreToShow", e.target.value)
              }
              placeholder="Masukkan minimal nilai"
              className="w-full border px-3 py-2 rounded-lg text-sm 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* ACTION */}
      <div className="flex flex-col md:flex-row gap-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
        >
          <Busy loading={loading} text="Menyimpan...">{id ? "Update" : "Simpan"}</Busy>
        </button>
      </div>
    </form>
  );
}