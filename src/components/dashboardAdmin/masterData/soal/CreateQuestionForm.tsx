"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RichTextEditor from "@/components/Ui/RichTextEditor";
import toast from "react-hot-toast";
import { uploadAudio as uploadAudioFile } from "@/libs/upload-audio";

import SelectField from "@/components/Ui/SelectField";
import FormField, { fieldA11y, inputClass } from "@/components/Ui/FormField";
import { typeOptions } from "@/constants/options";
import Busy from "@/components/Ui/Busy";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { readApiFailure } from "@/libs/form-errors";
import { OPTION_LABELS, validateQuestionForm } from "@/libs/question-form-validation";

// Validasi file audio
const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/x-m4a",
  "audio/mp4",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const INITIAL_FORM = {
  type: "QUESTION",
  categoryId: "",
  sectionId: "",
  useAudio: "no",
  audio: null,
  audioUrl: "",
  audioLimit: "",
  timeLimit: "",
  question: "",
  direction: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "",
  explanation: "",
};

export default function CreateQuestionForm({
  examId,
  defaultValues,
  isEdit = false,
  questionId,
}: any) {
  const [sections, setSections] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [localAudioPreview, setLocalAudioPreview] = useState<string | null>(
    null,
  );
  const { errors, show, clear, reset } = useFieldErrors();

  const [form, setForm] = useState<any>(INITIAL_FORM);

  useEffect(() => {
    fetch("/api/section")
      .then((res) => res.json())
      .then(setSections);
  }, []);

  useEffect(() => {
    fetch("/api/category-score")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    if (questionId) {
      fetch(`/api/question/${questionId}`)
        .then((res) => res.json())
        .then((res) => {
          setForm({
            type: res.type || "QUESTION",
            sectionId: String(res.sectionId || ""),
            categoryId: res.categoryPenilaianId || "",
            useAudio: res.audioUrl ? "yes" : "no",
            audio: null,
            audioUrl: res.audioUrl || "",
            audioLimit: res.audioPlayLimit || "",
            timeLimit: res.timeLimit || "",
            question: res.questionText || "",
            direction: res.directionText || "",
            optionA: res.options?.find((o: any) => o.label === "A")?.text || "",
            optionB: res.options?.find((o: any) => o.label === "B")?.text || "",
            optionC: res.options?.find((o: any) => o.label === "C")?.text || "",
            optionD: res.options?.find((o: any) => o.label === "D")?.text || "",
            correctAnswer: res.correctAnswer || "",
            explanation: res.explanation || "",
          });
        });
    } else if (defaultValues) {
      setForm(defaultValues);
    }
  }, [questionId, defaultValues]);

  const handleChange = (key: string, value: any) => {
    // mengubah isian → penanda merah di kolom itu langsung hilang
    clear(key);

    setForm((prev: any) => {
      if (key === "type") {
        return {
          ...prev,
          type: value,
          question: "",
          direction: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "",
          explanation: "",
          useAudio: "no",
          audio: null,
          audioUrl: "",
          audioLimit: "",
          timeLimit: "",
        };
      }

      if (key === "sectionId") {
        return { ...prev, sectionId: value, categoryId: "" };
      }

      if (key === "useAudio" && value === "no") {
        return {
          ...prev,
          useAudio: value,
          audio: null,
          audioUrl: "",
          audioLimit: "",
          timeLimit: "",
        };
      }

      return { ...prev, [key]: value };
    });

    if (key === "type") reset();
    if (key === "useAudio") {
      clear("audio");
      clear("audioLimit");
    }
  };

  // Validasi file sebelum disimpan ke state
  const handleAudioChange = (file: File | undefined) => {
    if (localAudioPreview) {
      URL.revokeObjectURL(localAudioPreview);
      setLocalAudioPreview(null);
    }

    if (!file) {
      handleChange("audio", null);
      return;
    }

    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      show({
        audio: "Format file tidak didukung. Gunakan MP3, WAV, OGG, atau M4A",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      show({ audio: "Ukuran file maksimal 10MB" });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalAudioPreview(previewUrl);

    handleChange("audio", file);
  };

  useEffect(() => {
    return () => {
      if (localAudioPreview) URL.revokeObjectURL(localAudioPreview);
    };
  }, [localAudioPreview]);

  const sectionOptions = sections.map((s: any) => ({
    value: s.id,
    label: `Section ${s.order} - ${s.title}`,
  }));

  const filteredCategories = categories.filter(
    (c: any) => c.sectionId === form.sectionId,
  );

  // Upload audio: validasi, minta izin ke server, dan upload ada di uploadAudioFile
  const uploadAudio = async (): Promise<string> => {
    if (!form.audio) return "";

    try {
      return await uploadAudioFile(form.audio);
    } catch (e: any) {
      console.error("UPLOAD AUDIO ERROR:", e);
      throw new Error(e.message || "Gagal upload audio, silakan coba lagi");
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Semua kolom yang bermasalah ditandai sekaligus (server tetap memvalidasi ulang).
    const found = validateQuestionForm(form);
    const count = Object.keys(found).length;
    if (count > 0) {
      show(found);
      toast.error(
        count === 1
          ? "Ada 1 isian yang belum benar. Periksa kolom yang ditandai merah."
          : `Ada ${count} isian yang belum benar. Periksa kolom yang ditandai merah.`,
      );
      return;
    }

    setLoading(true);

    try {
      let audioUrl = form.audioUrl || "";

      // Upload: kalau gagal, hentikan submit
      if (form.type === "QUESTION" && form.useAudio === "yes" && form.audio) {
        try {
          audioUrl = await uploadAudio();
        } catch (err: any) {
          show({ audio: err.message });
          toast.error(err.message);
          return;
        }
      }

      const { audio: _audio, useAudio: _useAudio, ...payload } = form;
      const url = isEdit ? `/api/question/${questionId}` : "/api/question";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          ...payload,
          audioUrl: form.useAudio === "yes" ? audioUrl : "",
        }),
      });

      if (!res.ok) {
        const failure = await readApiFailure(
          res,
          isEdit ? "Gagal update soal" : "Gagal menyimpan soal",
        );
        const { audioUrl: audioError, ...others } = failure.fieldErrors;
        const fieldErrors = audioError ? { ...others, audio: audioError } : others;
        if (Object.keys(fieldErrors).length > 0) show(fieldErrors);
        toast.error(failure.message);
        return;
      }

      toast.success(
        isEdit ? "Soal berhasil diupdate" : "Soal berhasil ditambahkan",
      );

      setTimeout(() => {
        window.location.href = `/admin/master-data/soal/${examId}`;
      }, 1000);
    } catch (err: any) {
      toast.error(
        err.message || (isEdit ? "Gagal update soal" : "Gagal menyimpan soal"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow border space-y-5"
    >
      <div className="flex justify-end">
        <Link href={`/admin/master-data/soal/${examId}`}>
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Kembali
          </button>
        </Link>
      </div>

      <p className="text-xs text-gray-500">
        Kolom bertanda <span className="text-red-500">*</span> wajib diisi.
      </p>

      <SelectField
        label="Section"
        required
        error={errors.sectionId}
        value={form.sectionId}
        onChange={(val) => handleChange("sectionId", val)}
        options={sectionOptions}
      />

      <SelectField
        label="Tipe"
        value={form.type}
        onChange={(val) => handleChange("type", val)}
        options={typeOptions}
      />

      {form.type === "QUESTION" && (
        <SelectField
          label="Kategori Penilaian"
          required
          error={errors.categoryId}
          value={form.categoryId}
          disabled={!form.sectionId || filteredCategories.length === 0}
          onChange={(val) => handleChange("categoryId", val)}
          options={filteredCategories.map((c: any) => ({
            value: c.id,
            label: c.name,
          }))}
          placeholder={
            !form.sectionId
              ? "Pilih section"
              : filteredCategories.length === 0
                ? "Tidak ada kategori"
                : "[ Pilih ]"
          }
        />
      )}

      {form.type === "QUESTION" && (
        <>
          <SelectField
            label="Tambah Audio"
            value={form.useAudio}
            onChange={(val) => handleChange("useAudio", val)}
            options={[
              { value: "yes", label: "Ya" },
              { value: "no", label: "Tidak" },
            ]}
          />

          {form.useAudio === "yes" && (
            <>
              <FormField label="Audio" required error={errors.audio} htmlFor="question-audio">
                {form.audioUrl && !form.audio && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 space-y-2">
                    <p className="text-xs text-blue-700 font-medium">
                      Audio saat ini masih tersimpan :
                    </p>
                    <audio controls className="w-full h-9">
                      <source src={form.audioUrl} />
                      Browser anda tidak support audio player.
                    </audio>
                    <p className="text-[11px] text-blue-500 break-all">
                      {form.audioUrl}
                    </p>
                  </div>
                )}

                {form.audio && localAudioPreview && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                    <p className="text-xs text-emerald-700 font-medium">
                      File baru dipilih silahkan dengarkan dulu untuk mastiin
                      bener sebelum simpan:
                    </p>
                    <audio
                      controls
                      className="w-full h-9"
                      src={localAudioPreview}
                    >
                      Browser anda tidak support audio player.
                    </audio>
                    <p className="text-[11px] text-emerald-600">
                      {form.audio.name}
                    </p>
                  </div>
                )}

                <input
                  {...fieldA11y("question-audio", errors.audio)}
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/x-m4a,audio/mp4"
                  onChange={(e) => handleAudioChange(e.target.files?.[0])}
                  className={`w-full border px-3 py-2 rounded-lg file:mr-3 file:px-3 file:py-1 file:border-0 file:bg-blue-50 file:text-blue-600 file:rounded-md ${
                    errors.audio ? "border-red-500 bg-red-50/40" : ""
                  }`}
                />
                {!errors.audio && (
                  <p className="text-xs text-gray-400">
                    {form.audioUrl
                      ? "Kosongkan/jangan pilih file kalau mau tetap pakai audio yang sekarang. Pilih file baru cuma kalau mau GANTI audio."
                      : "Format: MP3, WAV, OGG, M4A. Maksimal 10MB"}
                  </p>
                )}
              </FormField>

              <FormField
                label="Batasan Audio Bisa Di Putar"
                error={errors.audioLimit}
                htmlFor="question-audioLimit"
              >
                <input
                  {...fieldA11y("question-audioLimit", errors.audioLimit)}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Batas putar"
                  value={form.audioLimit}
                  onChange={(e) => handleChange("audioLimit", e.target.value)}
                  className={inputClass(errors.audioLimit)}
                />
              </FormField>
            </>
          )}

          <FormField label="Soal" required error={errors.question}>
            <div className="editor-soal">
              <RichTextEditor
                value={form.question}
                onChange={(val) => handleChange("question", val)}
                error={!!errors.question}
              />
            </div>
          </FormField>

          {OPTION_LABELS.map((opt) => (
            <FormField
              key={opt}
              label={`Pilihan ${opt}`}
              required
              error={errors[`option${opt}`]}
            >
              <div className="editor-pilihan">
                <RichTextEditor
                  value={form[`option${opt}`]}
                  onChange={(val) => handleChange(`option${opt}`, val)}
                  error={!!errors[`option${opt}`]}
                />
              </div>
            </FormField>
          ))}

          <SelectField
            label="Jawaban"
            required
            error={errors.correctAnswer}
            value={form.correctAnswer}
            onChange={(val) => handleChange("correctAnswer", val)}
            options={OPTION_LABELS.map((opt) => ({ value: opt, label: opt }))}
          />

          <FormField
            label="Pembahasan"
            error={errors.explanation}
            hint="Opsional. Tampil ke peserta di halaman pembahasan jika 'Tampilkan Jawaban' diaktifkan pada ujian."
          >
            <div className="editor-pembahasan">
              <RichTextEditor
                value={form.explanation}
                onChange={(val) => handleChange("explanation", val)}
                error={!!errors.explanation}
              />
            </div>
          </FormField>
        </>
      )}

      {form.type === "DIRECTION" && (
        <FormField label="Direction" required error={errors.direction}>
          <div className="editor-direction">
            <RichTextEditor
              value={form.direction}
              onChange={(val) => handleChange("direction", val)}
              error={!!errors.direction}
            />
          </div>
        </FormField>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        <Busy loading={loading} text="Menyimpan...">
          Submit
        </Busy>
      </button>
    </form>
  );
}
