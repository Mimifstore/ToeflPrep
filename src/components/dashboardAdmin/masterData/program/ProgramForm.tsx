"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { uploadImage } from "@/libs/upload-image";
import { ImagePlus, X, ArrowLeft, Home, ChevronRight } from "lucide-react";
import FormField, { fieldA11y, inputClass } from "@/components/Ui/FormField";
import Busy from "@/components/Ui/Busy";
import { Skeleton } from "@/components/Ui/Skeleton";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { readApiFailure } from "@/libs/form-errors";

type ProgramFormProps = {
  mode: "create" | "edit";
  programId?: string;
};

export default function ProgramForm({ mode, programId }: ProgramFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === "edit");
  const [error, setError] = useState("");
  const { errors, show, clear } = useFieldErrors();

  useEffect(() => {
    if (mode !== "edit" || !programId) return;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/program");
        const data = await res.json();
        const program = data.find((p: any) => p.id === programId);

        if (program) {
          setName(program.name);
          setPreview(program.image || null);
        } else {
          setError("Kategori tidak ditemukan.");
        }
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [mode, programId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError("");
    clear("image");

    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return "";

    try {
      return await uploadImage(file);
    } catch (e: any) {
      console.error("UPLOAD ERROR:", e);
      show({ image: e.message || "Upload gambar gagal, coba lagi." });
      return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const found: Record<string, string> = {};
    if (!name.trim()) found.name = "Nama kategori wajib diisi";
    else if (name.trim().length > 100) found.name = "Nama kategori maksimal 100 karakter";
    if (!file && !preview) found.image = "Gambar kategori wajib diunggah";
    if (Object.keys(found).length > 0) {
      show(found);
      return;
    }

    setLoading(true);

    try {
      let image = "";
      if (file) {
        image = await handleUpload();
        if (!image) {
          setLoading(false);
          return;
        }
      }

      const res =
        mode === "create"
          ? await fetch("/api/program", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: name.trim(), image }),
            })
          : await fetch("/api/program", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: programId,
                name: name.trim(),
                ...(image && { image }),
              }),
            });

      if (!res.ok) {
        const failure = await readApiFailure(res, "Gagal menyimpan data");
        if (Object.keys(failure.fieldErrors).length > 0) show(failure.fieldErrors);
        else setError(failure.message);
        setLoading(false);
        return;
      }

      router.push("/admin/master-data/program");
    } catch {
      setError("Gagal menyimpan data, coba lagi.");
      setLoading(false);
    }
  };

  const isEdit = mode === "edit";

  return (
    <div className="p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-5 flex-wrap">
        <span className="text-lg font-semibold text-gray-800">Kategori</span>
        <span className="flex items-center gap-2 text-gray-400">
          <ChevronRight className="w-4 h-4" />
          <Link
            href="/admin"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-700 font-medium">
            {isEdit ? "Edit Kategori" : "Tambah Kategori"}
          </span>
        </span>
      </div>

      <section className="bg-white p-6 rounded-2xl border border-gray-100 max-w-xl">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Kategori" : "Tambah Kategori"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit
              ? "Perbarui informasi kategori peminatan."
              : "Buat kategori peminatan baru untuk program tryout."}
          </p>
        </div>

        {fetching ? (
          <div className="space-y-5">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="space-y-5">
            {error ? (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <FormField
              label="Nama Kategori"
              required
              error={errors.name}
              htmlFor="program-name"
            >
              <input
                {...fieldA11y("program-name", errors.name)}
                placeholder="Contoh: TOEFL ITP"
                maxLength={100}
                className={inputClass(errors.name)}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clear("name");
                }}
              />
            </FormField>

            <FormField label="Gambar Kategori" required error={errors.image}>

              {preview ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-red-600 transition-colors shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
                    errors.image
                      ? "border-red-400 bg-red-50/40 text-red-400"
                      : "border-gray-200 text-gray-400 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-500"
                  }`}
                >
                  <ImagePlus className="w-7 h-7" />
                  <span className="text-sm font-medium">
                    Klik untuk unggah gambar
                  </span>
                  <span className="text-xs text-gray-400">
                    PNG, JPG, hingga 5MB
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {isEdit && preview && (
                <p className="text-xs text-gray-400 mt-1.5">
                  Klik gambar untuk mengganti, atau biarkan untuk tetap
                  menggunakan gambar saat ini.
                </p>
              )}
            </FormField>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/admin/master-data/program"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Link>

              <button
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Busy loading={loading} text="Menyimpan...">
                  {isEdit ? "Update Kategori" : "Tambah Kategori"}
                </Busy>
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
