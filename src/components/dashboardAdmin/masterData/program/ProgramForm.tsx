"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { uploadImage } from "@/libs/upload-image";
import { ImagePlus, X, ArrowLeft, Home, ChevronRight } from "lucide-react";

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
      setError(e.message || "Upload gambar gagal, coba lagi.");
      return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nama kategori wajib diisi.");
      return;
    }
    if (mode === "create" && !file) {
      setError("Gambar kategori wajib diunggah.");
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
              body: JSON.stringify({ name, image }),
            })
          : await fetch("/api/program", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: programId,
                name,
                ...(image && { image }),
              }),
            });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error || "Gagal menyimpan data");
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
          <div className="space-y-5 animate-pulse">
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-48 bg-gray-100 rounded-xl" />
            <div className="h-10 bg-gray-100 rounded-lg w-32" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Nama Kategori
              </label>
              <input
                id="name"
                placeholder="Contoh: TOEFL ITP"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Gambar Kategori
              </label>

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
                  className="w-full h-48 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-500 transition-colors"
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
            </div>

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
                {loading
                  ? "Menyimpan..."
                  : isEdit
                    ? "Update Kategori"
                    : "Tambah Kategori"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
