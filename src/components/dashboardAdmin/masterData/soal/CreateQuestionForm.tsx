"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RichTextEditor from "@/components/Ui/RichTextEditor";
import toast from "react-hot-toast";
import { uploadAudio as uploadAudioFile } from "@/libs/upload-audio";

import SelectField from "@/components/Ui/SelectField";
import { typeOptions } from "@/constants/options";

// 🔥 KONSTANTA VALIDASI FILE
const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/x-m4a",
  "audio/mp4",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

  const [form, setForm] = useState<any>({
    type: "QUESTION",
    categoryId: "",
    sectionId: "",
    useAudio: "",
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
  });

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
          useAudio: "",
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
  };

  // 🔥 VALIDASI FILE SEBELUM DISIMPAN KE STATE
  const handleAudioChange = (file: File | undefined) => {
    if (localAudioPreview) {
      URL.revokeObjectURL(localAudioPreview);
      setLocalAudioPreview(null);
    }

    if (!file) {
      handleChange("audio", null);
      return;
    }

    // 🔥 VALIDASI TIPE FILE
    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      toast.error(
        "Format file tidak didukung. Gunakan MP3, WAV, OGG, atau M4A",
      );
      return;
    }

    // 🔥 VALIDASI UKURAN FILE
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ukuran file maksimal 10MB");
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

  // useEffect(() => {
  //   setForm((prev: any) => ({ ...prev, categoryId: "" }));
  // }, [form.sectionId]);

  // 🔥 UPLOAD AUDIO — sanitasi nama file + handle error dengan benar
  const uploadAudio = async (): Promise<string> => {
    if (!form.audio) return "";

    try {
      // validasi, minta izin ke server, dan upload ada di uploadAudioFile
      return await uploadAudioFile(form.audio);
    } catch (e: any) {
      console.error("UPLOAD AUDIO ERROR:", e);
      throw new Error(e.message || "Gagal upload audio, silakan coba lagi");
    }
  };

  // 🔥 EDITOR KOSONG = "<p><br></p>", jadi cek isi teksnya, bukan string-nya
  const isBlankHtml = (html: string) =>
    !/<img\b/i.test(html || "") &&
    (html || "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim() === "";

  // 🔥 VALIDASI SEBELUM KIRIM (server tetap memvalidasi ulang)
  const validateForm = (): string | null => {
    if (!form.sectionId) return "Section wajib dipilih";

    if (form.type === "DIRECTION") {
      return isBlankHtml(form.direction) ? "Direction wajib diisi" : null;
    }

    if (!form.categoryId) return "Kategori Penilaian wajib dipilih";
    if (isBlankHtml(form.question)) return "Soal wajib diisi";
    for (const opt of ["A", "B", "C", "D"]) {
      if (isBlankHtml(form[`option${opt}`]))
        return `Pilihan ${opt} wajib diisi`;
    }
    if (!form.correctAnswer) return "Jawaban wajib dipilih";
    if (form.useAudio === "yes" && !form.audio && !form.audioUrl) {
      return 'Pilih file audio, atau ubah "Tambah Audio" menjadi Tidak';
    }
    return null;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const problem = validateForm();
      if (problem) {
        toast.error(problem);
        setLoading(false);
        return;
      }

      let audioUrl = form.audioUrl || "";

      // 🔥 UPLOAD — kalau gagal, throw error dan hentikan submit
      if (form.type === "QUESTION" && form.useAudio === "yes" && form.audio) {
        audioUrl = await uploadAudio();
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
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan soal");
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

      <SelectField
        label="Section"
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

      <SelectField
        label="Kategori Penilaian"
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
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Audio
                </label>

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
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/x-m4a,audio/mp4"
                  onChange={(e) => handleAudioChange(e.target.files?.[0])}
                  className="w-full border px-3 py-2 rounded-lg file:mr-3 file:px-3 file:py-1 file:border-0 file:bg-blue-50 file:text-blue-600 file:rounded-md"
                />
                <p className="text-xs text-gray-400">
                  {form.audioUrl
                    ? "Kosongkan/jangan pilih file kalau mau tetap pakai audio yang sekarang. Pilih file baru cuma kalau mau GANTI audio."
                    : "Format: MP3, WAV, OGG, M4A. Maksimal 10MB"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Batasan Audio Bisa Di Putar
                </label>
                <input
                  type="number"
                  placeholder="Batas putar"
                  value={form.audioLimit}
                  onChange={(e) => handleChange("audioLimit", e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Batas Waktu Menjawab(Detik), Input 0 Jika Tidak Ada Batasan
                </label>
                <input
                  type="number"
                  placeholder="Waktu (detik)"
                  value={form.timeLimit}
                  onChange={(e) => handleChange("timeLimit", e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Soal</label>
            <div className="editor-soal">
              <RichTextEditor
                value={form.question}
                onChange={(val) => handleChange("question", val)}
              />
            </div>
          </div>

          {["A", "B", "C", "D"].map((opt) => (
            <div key={opt} className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Pilihan {opt}
              </label>
              <div className="editor-pilihan">
                <RichTextEditor
                  value={form[`option${opt}`]}
                  onChange={(val) => handleChange(`option${opt}`, val)}
                />
              </div>
            </div>
          ))}

          <SelectField
            label="Jawaban"
            value={form.correctAnswer}
            onChange={(val) => handleChange("correctAnswer", val)}
            options={[
              { value: "A", label: "A" },
              { value: "B", label: "B" },
              { value: "C", label: "C" },
              { value: "D", label: "D" },
            ]}
          />

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Pembahasan
            </label>
            <div className="editor-pembahasan">
              <RichTextEditor
                value={form.explanation}
                onChange={(val) => handleChange("explanation", val)}
              />
            </div>
          </div>
        </>
      )}

      {form.type === "DIRECTION" && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Direction</label>
          <div className="editor-direction">
            <RichTextEditor
              value={form.direction}
              onChange={(val) => handleChange("direction", val)}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? "Menyimpan..." : "Submit"}
      </button>
    </form>
  );
}
