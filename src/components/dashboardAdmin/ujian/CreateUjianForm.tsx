"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import SelectField from "@/components/Ui/SelectField";
import RichTextEditor from "@/components/Ui/RichTextEditor";
import FormField, { fieldA11y, inputClass } from "@/components/Ui/FormField";
import Busy from "@/components/Ui/Busy";
import Spinner from "@/components/Ui/Spinner";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { fieldErrorsFromZod, readApiFailure, type FieldErrors } from "@/libs/form-errors";
import { sectionTimeField, type SectionTimeField } from "@/libs/exam/section-minutes";
import { evaluateReadiness, type BankInfo } from "@/libs/ujian-readiness";
import {
  ujianBodySchema,
  ujianFormFromInitial,
  ujianInputFromForm,
  type UjianFormState,
} from "@/libs/ujian-validation";

const BOOL_OPTIONS = [
  { label: "Ya", value: "true" },
  { label: "Tidak", value: "false" },
];

const SETTINGS: Array<[label: string, key: keyof UjianFormState, hint?: string]> = [
  ["Soal Acak", "shuffleQuestions", "Urutan soal diacak di dalam tiap bagian, berbeda untuk tiap peserta"],
  ["Jawaban Acak", "shuffleAnswers", "Urutan pilihan A–D diacak untuk tiap peserta. Hindari soal yang merujuk huruf pilihan (mis. 'A dan B benar')."],
  ["Tampilkan Jawaban", "showAnswer", "Peserta bisa melihat jawaban benar dan pembahasan setelah ujian selesai"],
  ["Tampilkan Navigasi Nomor Soal", "showNavigation"],
  ["Tampilkan Nomor Soal", "showQuestionNumber"],
  ["Pertanyaan Selanjutnya Secara Otomatis", "autoNextQuestion"],
  ["Tampilkan Button Sebelum dan Selanjutnya", "showPrevNextButton"],
];

const TIME_LABEL: Record<SectionTimeField, string> = {
  listeningTime: "Listening",
  structureTime: "Structure",
  readingTime: "Reading",
};
const TIME_FIELDS = Object.keys(TIME_LABEL) as SectionTimeField[];

const toMinutes = (v: string | number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export default function CreateUjianForm({ initialData, isEdit }: any) {
  const router = useRouter();

  const [programs, setPrograms] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<UjianFormState>(() => ujianFormFromInitial(initialData));
  const { errors, show, clear } = useFieldErrors();

  // Isi bank soal yang dipilih (section + jumlah soal): menentukan section mana yang wajib diberi waktu.
  const [bank, setBank] = useState<BankInfo | null>(null);
  const [bankLoading, setBankLoading] = useState(false);

  useEffect(() => {
    fetch("/api/program")
      .then((res) => res.json())
      .then(setPrograms);
    fetch("/api/soal")
      .then((res) => res.json())
      .then(setBanks);
  }, []);

  useEffect(() => {
    if (!form.questionBankId) {
      setBank(null);
      return;
    }
    const controller = new AbortController();
    setBankLoading(true);
    fetch(`/api/soal/${form.questionBankId}/sections`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setBank(data))
      .catch(() => setBank(null))
      .finally(() => {
        if (!controller.signal.aborted) setBankLoading(false);
      });
    return () => controller.abort();
  }, [form.questionBankId]);

  const handleChange = (key: keyof UjianFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    clear(key);
    if (key === "timeType") ["totalTime", ...TIME_FIELDS].forEach(clear);
    if (key === "questionBankId") TIME_FIELDS.forEach(clear);
  };

  // Section yang ada isinya di bank soal terpilih → kolom waktu yang ditampilkan & wajib.
  const sectionInputs = useMemo(() => {
    if (!bank) return null;
    const active = bank.sections
      .filter((s) => s.questionCount > 0)
      .sort((a, b) => a.order - b.order);
    const seen = new Set<SectionTimeField>();
    const fields: Array<{ field: SectionTimeField; label: string }> = [];
    active.forEach((s, i) => {
      const field = sectionTimeField(s.title, i);
      if (field && !seen.has(field)) {
        seen.add(field);
        fields.push({ field, label: s.title });
      }
    });
    return fields;
  }, [bank]);

  const bankSummary = useMemo(() => {
    if (!bank) return null;
    const active = bank.sections.filter((s) => s.questionCount > 0);
    const total = active.reduce((n, s) => n + s.realQuestionCount, 0);
    return { sections: active.length, total };
  }, [bank]);

  const validate = (): FieldErrors => {
    const parsed = ujianBodySchema.safeParse(ujianInputFromForm(form));
    const next: FieldErrors = parsed.success ? {} : fieldErrorsFromZod(parsed.error);

    // Cek kesiapan terhadap isi bank soal (sama dengan yang dicek server).
    if (bank && form.programId && form.questionBankId) {
      const readiness = evaluateReadiness(
        {
          timeType: form.timeType,
          totalTime: toMinutes(form.totalTime),
          listeningTime: toMinutes(form.listeningTime),
          structureTime: toMinutes(form.structureTime),
          readingTime: toMinutes(form.readingTime),
        },
        bank,
      );
      for (const p of readiness.problems) if (!(p.field in next)) next[p.field] = p.message;
    }

    // Error di kolom waktu yang tidak ditampilkan (section-nya tidak ada) dipindah ke "Jenis Waktu Ujian".
    if (form.timeType === "PER_SECTION" && sectionInputs) {
      const visible = new Set(sectionInputs.map((s) => s.field));
      for (const f of TIME_FIELDS) {
        if (next[f] && !visible.has(f)) {
          next.timeType ??= next[f];
          delete next[f];
        }
      }
    }
    return next;
  };

  const handleSubmit = async () => {
    const found = validate();
    if (Object.keys(found).length > 0) {
      show(found);
      toast.error("Ada isian yang belum benar. Periksa kolom yang ditandai merah.");
      return;
    }

    try {
      setLoading(true);
      const parsed = ujianBodySchema.parse(ujianInputFromForm(form));
      const url = isEdit ? `/api/exam/${initialData.id}` : `/api/exam`;

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      if (!res.ok) {
        const failure = await readApiFailure(
          res,
          isEdit ? "Gagal update ujian" : "Gagal membuat ujian",
        );
        if (Object.keys(failure.fieldErrors).length > 0) show(failure.fieldErrors);
        toast.error(failure.message);
        return;
      }

      toast.success(isEdit ? "Ujian berhasil diupdate" : "Ujian berhasil dibuat");
      router.push("/admin/ujian");
      router.refresh();
    } catch {
      toast.error(isEdit ? "Gagal update ujian" : "Gagal membuat ujian");
    } finally {
      setLoading(false);
    }
  };

  const numberInput = (key: keyof UjianFormState, placeholder: string, min = 0) => (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      step={1}
      {...fieldA11y(`ujian-${key}`, errors[key])}
      className={inputClass(errors[key])}
      placeholder={placeholder}
      value={form[key]}
      onChange={(e) => handleChange(key, e.target.value)}
    />
  );

  return (
    <form
      noValidate
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

      <p className="text-xs text-gray-500">
        Kolom bertanda <span className="text-red-500">*</span> wajib diisi.
      </p>

      <SelectField
        label="Kategori Peminatan"
        required
        error={errors.programId}
        value={form.programId}
        onChange={(val) => handleChange("programId", val)}
        options={programs.map((p) => ({ value: p.id, label: p.name }))}
      />

      <div className="space-y-2">
        <SelectField
          label="Judul Soal"
          required
          error={errors.questionBankId}
          value={form.questionBankId}
          onChange={(val) => handleChange("questionBankId", val)}
          options={banks.map((b) => ({ value: b.id, label: b.title }))}
        />
        {form.questionBankId && bankLoading && (
          <p className="flex items-center gap-2 text-xs text-gray-400">
            <Spinner className="h-3.5 w-3.5" /> Membaca isi bank soal
          </p>
        )}
        {bank && bankSummary && !errors.questionBankId && (
          <p className="text-xs text-gray-500">
            Berisi {bankSummary.sections} section dan {bankSummary.total} soal.
          </p>
        )}
        {bank && bank.unassignedQuestions > 0 && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {bank.unassignedQuestions} soal di bank ini belum masuk section, sehingga tidak
            akan tampil ke peserta.
          </p>
        )}
      </div>

      <SelectField
        label="Jenis Waktu Ujian"
        required
        error={errors.timeType}
        value={form.timeType}
        onChange={(val) => handleChange("timeType", val)}
        options={[
          { value: "SINGLE", label: "Satu Waktu" },
          { value: "PER_SECTION", label: "Per Section" },
        ]}
      />

      {form.timeType === "SINGLE" && (
        <FormField
          label="Durasi Ujian (Menit)"
          required
          error={errors.totalTime}
          htmlFor="ujian-totalTime"
        >
          {numberInput("totalTime", "Contoh: 120", 1)}
        </FormField>
      )}

      {form.timeType === "PER_SECTION" && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Durasi Per Section (Menit)</p>

          {!sectionInputs && (
            <p className="text-xs text-gray-400">
              Pilih Judul Soal terlebih dahulu. Kolom waktu mengikuti section yang ada di bank
              soal tersebut.
            </p>
          )}

          {sectionInputs?.length === 0 && (
            <p className="text-xs text-gray-400">
              Bank soal ini belum punya soal di dalam section.
            </p>
          )}

          {sectionInputs?.map(({ field, label }) => (
            <FormField
              key={field}
              label={`${label} (menit)`}
              required
              error={errors[field]}
              htmlFor={`ujian-${field}`}
            >
              {numberInput(field, `Waktu ${label} dalam menit`, 1)}
            </FormField>
          ))}
        </div>
      )}

      <FormField label="Judul Ujian" required error={errors.title} htmlFor="ujian-title">
        <input
          {...fieldA11y("ujian-title", errors.title)}
          value={form.title}
          maxLength={200}
          className={inputClass(errors.title)}
          placeholder="Judul ujian"
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </FormField>

      <FormField
        label="Harga"
        required
        error={errors.price}
        htmlFor="ujian-price"
        hint="Isi 0 untuk ujian gratis"
      >
        {numberInput("price", "Harga dalam rupiah")}
      </FormField>

      <FormField label="Deskripsi Ujian" error={errors.description}>
        <div className="editor-pembahasan">
          <RichTextEditor
            value={form.description}
            onChange={(val) => handleChange("description", val)}
            placeholder="Masukkan deskripsi ujian..."
            error={!!errors.description}
          />
        </div>
      </FormField>

      {/* Settings */}
      <div className="space-y-3">
        {SETTINGS.map(([label, key, hint]) => (
          <SelectField
            key={key}
            label={label}
            hint={hint}
            value={String(form[key])}
            onChange={(val) => handleChange(key, val)}
            options={BOOL_OPTIONS}
          />
        ))}
      </div>

      <FormField
        label="Maksimal Toleransi Keluar Tes"
        error={errors.maxExitAttempts}
        htmlFor="ujian-maxExitAttempts"
        hint="Berapa kali peserta boleh keluar dari layar penuh atau pindah tab sebelum ujian otomatis dikumpulkan. Isi 0 untuk tanpa batas."
      >
        {numberInput("maxExitAttempts", "Maksimal toleransi")}
      </FormField>

      <FormField
        label="Nilai Kelulusan (Passing Score)"
        required
        error={errors.passingScore}
        htmlFor="ujian-passingScore"
        hint="Peserta dengan skor sama dengan atau di atas nilai ini dinyatakan lulus. Isi 0 jika ujian tidak memakai nilai kelulusan."
      >
        {numberInput("passingScore", "Contoh: 450")}
      </FormField>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white w-full md:w-auto px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Busy loading={loading} text="Menyimpan...">
          {isEdit ? "Update Ujian" : "Buat Ujian"}
        </Busy>
      </button>
    </form>
  );
}
