"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/Ui/RichTextEditor";
import Link from "next/link";
import { FormSkeleton } from "@/components/Ui/Skeleton";
import Busy from "@/components/Ui/Busy";

export default function CreateAnnouncementForm({ id }: { id?: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);

  const isEdit = !!id;

  const [form, setForm] = useState({
    title: "",
    content: "",
  });

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
    if (!form.title) {
      toast.error("Judul wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        isEdit ? `/api/announcement/${id}` : "/api/announcement",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );

      if (!res.ok) throw new Error();

      toast.success(
        isEdit ? "Pengumuman berhasil diupdate" : "Pengumuman berhasil dibuat",
      );

      router.push("/admin/pengumuman");
    } catch (err) {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (loadingFetch) return <FormSkeleton />;

  return (
    <form className="bg-white p-4 md:p-6 rounded-2xl shadow border space-y-5">
      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <h1 className="text-base md:text-lg font-semibold text-gray-700">
          {isEdit ? "Edit Pengumuman" : "Tambah Pengumuman"}
        </h1>

        <Link href={`/admin/pengumuman`} className="w-full md:w-auto">
          <button className="bg-blue-600 text-white w-full md:w-auto px-4 py-2 rounded-lg text-sm">
            Kembali
          </button>
        </Link>
      </div>

      {/* FORM */}
      <div className="space-y-4">
        {/* JUDUL */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Judul</label>

          <input
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Masukkan judul pengumuman"
            className="w-full border px-3 py-2 rounded-lg text-sm 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* ISI */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Isi Pengumuman
          </label>

          <div className="editor-pembahasan">
            <RichTextEditor
              value={form.content}
              onChange={(val) => handleChange("content", val)}
            />
          </div>
        </div>
      </div>

      {/* ACTION */}
      <div className="flex flex-col md:flex-row md:justify-start">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white w-full md:w-auto px-4 py-2 rounded-lg text-sm"
        >
          <Busy loading={loading} text="Menyimpan...">{isEdit ? "Update" : "Simpan"}</Busy>
        </button>
      </div>
    </form>
  );
}