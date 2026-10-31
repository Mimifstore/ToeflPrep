"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SelectField from "@/components/Ui/SelectField";
import RichTextEditor from "@/components/Ui/RichTextEditor";
import toast from "react-hot-toast";
import Busy from "@/components/Ui/Busy";

export default function CreateUjianForm({ initialData, isEdit }: any) {
  const router = useRouter();

  const [programs, setPrograms] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<any>({
    programId: initialData?.programId ?? "",
    questionBankId: initialData?.questionBankId ?? "",

    timeType: initialData?.timeType ?? "",
    totalTime: initialData?.totalTime ?? "",
    listeningTime: initialData?.listeningTime ?? "",
    structureTime: initialData?.structureTime ?? "",
    readingTime: initialData?.readingTime ?? "",

    title: initialData?.title ?? "",
    price: initialData?.price ?? "",
    description: initialData?.description ?? "",

    shuffleQuestions: initialData?.shuffleQuestions?.toString() ?? "",
    shuffleAnswers: initialData?.shuffleAnswers?.toString() ?? "",
    showAnswer: initialData?.showAnswer?.toString() ?? "",
    showNavigation: initialData?.showNavigation?.toString() ?? "",
    showQuestionNumber: initialData?.showQuestionNumber?.toString() ?? "",
    autoNextQuestion: initialData?.autoNextQuestion?.toString() ?? "",
    showPrevNextButton: initialData?.showPrevNextButton?.toString() ?? "",
    passingScore: initialData?.passingScore ?? 450,

    questionDisplayType: initialData?.questionDisplayType ?? "",
    maxExitAttempts: initialData?.maxExitAttempts ?? "",
  });

  useEffect(() => {
    fetch("/api/program")
      .then((res) => res.json())
      .then(setPrograms);
    fetch("/api/soal")
      .then((res) => res.json())
      .then(setBanks);
  }, []);

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const parseBool = (val: any) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return undefined;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const url = isEdit ? `/api/exam/${initialData.id}` : `/api/exam`;

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,

          price: Number(form.price || 0),
          totalTime: form.totalTime ? Number(form.totalTime) : null,
          listeningTime: Number(form.listeningTime || 0),
          structureTime: Number(form.structureTime || 0),
          readingTime: Number(form.readingTime || 0),
          maxExitAttempts: Number(form.maxExitAttempts || 0),
          passingScore: Number(form.passingScore || 450),

          shuffleQuestions: parseBool(form.shuffleQuestions),
          shuffleAnswers: parseBool(form.shuffleAnswers),
          showAnswer: parseBool(form.showAnswer),
          showNavigation: parseBool(form.showNavigation),
          showQuestionNumber: parseBool(form.showQuestionNumber),
          autoNextQuestion: parseBool(form.autoNextQuestion),
          showPrevNextButton: parseBool(form.showPrevNextButton),
        }),
      });

      if (!res.ok) throw new Error();
      toast.success(
        isEdit ? "Ujian berhasil diupdate" : "Ujian berhasil dibuat",
      );

      router.push("/admin/ujian");
      router.refresh();
    } catch (err) {
      toast.error(isEdit ? "Gagal update ujian" : "Gagal membuat ujian");
    } finally {
      setLoading(false);
    }
  };

  const boolOptions = [
    { label: "Ya", value: "true" },
    { label: "Tidak", value: "false" },
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="bg-white p-6 rounded-2xl shadow border space-y-5"
    >
      <div className="flex flex-col gap-2 md:flex-row md:justify-end">
        <Link href={`/admin/ujian`} className="w-full md:w-auto">
          <button
            type="button"
            className="bg-blue-500 text-white w-full md:w-auto px-4 py-2 rounded-lg text-sm"
          >
            Kembali
          </button>
        </Link>
      </div>

      <SelectField
        label="Kategori Peminatan"
        value={form.programId}
        onChange={(val) => handleChange("programId", val)}
        options={[
          ...programs.map((p) => ({
            value: p.id,
            label: p.name,
          })),
        ]}
      />

      <SelectField
        label="Judul Soal"
        value={form.questionBankId}
        onChange={(val) => handleChange("questionBankId", val)}
        options={[
          ...banks.map((b) => ({
            value: b.id,
            label: b.title,
          })),
        ]}
      />

      {/* Time Type */}
      <SelectField
        label="Jenis Waktu Ujian"
        value={form.timeType}
        onChange={(val) => handleChange("timeType", val)}
        options={[
          { value: "SINGLE", label: "Satu Waktu" },
          { value: "PER_SECTION", label: "Per Section" },
        ]}
      />

      {form.timeType === "SINGLE" && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Durasi Ujian (Menit)
          </label>

          <input
            type="number"
            className="w-full border px-3 py-2 rounded-lg 
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Contoh: 120"
            value={form.totalTime}
            onChange={(e) => handleChange("totalTime", e.target.value)}
          />
        </div>
      )}

      {form.timeType === "PER_SECTION" && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Durasi Per Section (Menit)
          </label>

          <div className="space-y-2">
            <input
              type="number"
              placeholder="Listening (menit)"
              value={form.listeningTime}
              className="w-full border px-3 py-2 rounded-lg 
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => handleChange("listeningTime", e.target.value)}
            />

            <input
              type="number"
              placeholder="Structure (menit)"
              value={form.structureTime}
              className="w-full border px-3 py-2 rounded-lg 
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => handleChange("structureTime", e.target.value)}
            />

            <input
              type="number"
              placeholder="Reading (menit)"
              value={form.readingTime}
              className="w-full border px-3 py-2 rounded-lg 
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => handleChange("readingTime", e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Judul Ujian</label>
        <input
          value={form.title}
          className="w-full border px-3 py-2 rounded-lg 
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Judul ujian"
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Harga</label>
        <input
          type="number"
          value={form.price}
          className="w-full border px-3 py-2 rounded-lg 
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Harga"
          onChange={(e) => handleChange("price", e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Deskripsi Ujian
        </label>

        <div className="editor-pembahasan">
          <RichTextEditor
            value={form.description}
            onChange={(val) => handleChange("description", val)}
            placeholder="Masukkan deskripsi ujian..."
          />
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-3">
        {[
          ["Soal Acak", "shuffleQuestions"],
          ["Jawaban Acak", "shuffleAnswers"],
          ["Tampilkan Jawaban", "showAnswer"],
          ["Tampilkan Navigasi Nomor Soal", "showNavigation"],
          ["Tampilkan Nomor Soal", "showQuestionNumber"],
          ["Pertanyaan Selanjutnya Secara Otomatis", "autoNextQuestion"],
          ["Tampilkan Button Sebelum dan Selanjutnya", "showPrevNextButton"],
        ].map(([label, key]: any) => (
          <SelectField
            key={key}
            label={label}
            value={form[key] || ""}
            onChange={(val) => handleChange(key, val)}
            options={boolOptions}
          />
        ))}
      </div>

      {/* Display */}
      <SelectField
        label="Tipe Pilihan Ganda"
        value={form.questionDisplayType}
        onChange={(val) => handleChange("questionDisplayType", val)}
        options={[
          { value: "OPTION", label: "Option" },
          { value: "INLINE", label: "Menyatu" },
        ]}
        placeholder="[ Pilih ]"
      />

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Maksimal Toleransi Keluar Tes
        </label>

        <input
          type="number"
          value={form.maxExitAttempts}
          className="w-full border px-3 py-2 rounded-lg 
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Maksimal Toleransi"
          onChange={(e) => handleChange("maxExitAttempts", e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Nilai Kelulusan (Passing Score)
        </label>
        <input
          type="number"
          value={form.passingScore}
          onChange={(e) => handleChange("passingScore", e.target.value)}
          className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          placeholder="Contoh: 450"
        />
        <p className="text-xs text-gray-400">
          Peserta dengan score di atas nilai ini dinyatakan lulus
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white w-full md:w-auto px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Busy loading={loading} text="Menyimpan...">{isEdit ? "Update Ujian" : "Buat Ujian"}</Busy>
      </button>
    </form>
  );
}
