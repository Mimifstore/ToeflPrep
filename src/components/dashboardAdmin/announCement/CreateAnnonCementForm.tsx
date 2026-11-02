"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/Ui/RichTextEditor";
import FormField, { fieldA11y, inputClass } from "@/components/Ui/FormField";
import Link from "next/link";
import { FormSkeleton } from "@/components/Ui/Skeleton";
import Busy from "@/components/Ui/Busy";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { fieldErrorsFromZod, readApiFailure } from "@/libs/form-errors";
import { announcementBodySchema } from "@/libs/content-validation";

export default function CreateAnnouncementForm({ id }: { id?: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const { errors, show, clear } = useFieldErrors();

  const isEdit = !!id;

  const [form, setForm] = useState({
    title: "",
    content: "",
  });

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    clear(key);
  };

  useEffect(() => {
    if (!id) return;

    setLoadingFetch(true);
    fetch(`/api/announcement/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setForm({
          title: res.title || "",
          content: res.content || "",
        });
      })
      .finally(() => setLoadingFetch(false));
  }, [id]);

  const handleSubmit = async () => {
    const parsed = announcementBodySchema.safeParse(form);
    if (!parsed.success) {
      show(fieldErrorsFromZod(parsed.error));
      toast.error("Ada isian yang belum benar. Periksa kolom yang ditandai merah.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        isEdit ? `/api/announcement/${id}` : "/api/announcement",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );

      if (!res.ok) {
        const failure = await readApiFailure(res, "Terjadi kesalahan");
        if (Object.keys(failure.fieldErrors).length > 0) show(failure.fieldErrors);
        toast.error(failure.message);
        return;
      }

      toast.success(
        isEdit ? "Pengumuman berhasil diupdate" : "Pengumuman berhasil dibuat",
      );

      router.push("/admin/pengumuman");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (loadingFetch) return <FormSkeleton />;

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
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <h1 className="text-base md:text-lg font-semibold text-gray-700">
          {isEdit ? "Edit Pengumuman" : "Tambah Pengumuman"}
        </h1>

        <Link href={`/admin/pengumuman`} className="w-full md:w-auto">
          <button
            type="button"
            className="bg-blue-600 text-white w-full md:w-auto px-4 py-2 rounded-lg text-sm"
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
        <FormField label="Judul" required error={errors.title} htmlFor="announcement-title">
          <input
            {...fieldA11y("announcement-title", errors.title)}
            value={form.title}
            maxLength={200}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Masukkan judul pengumuman"
            className={inputClass(errors.title)}
          />
        </FormField>

        <FormField label="Isi Pengumuman" required error={errors.content}>
          <div className="editor-pembahasan">
            <RichTextEditor
              value={form.content}
              onChange={(val) => handleChange("content", val)}
              error={!!errors.content}
            />
          </div>
        </FormField>
      </div>

      {/* ACTION */}
      <div className="flex flex-col md:flex-row md:justify-start">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full md:w-auto px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Busy loading={loading} text="Menyimpan...">
            {isEdit ? "Update" : "Simpan"}
          </Busy>
        </button>
      </div>
    </form>
  );
}
