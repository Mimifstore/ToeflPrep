"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SelectField from "@/components/Ui/SelectField";
import FormField, { fieldA11y, inputClass } from "@/components/Ui/FormField";
import Busy from "@/components/Ui/Busy";
import { FormSkeleton } from "@/components/Ui/Skeleton";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { fieldErrorsFromZod, readApiFailure } from "@/libs/form-errors";
import { SISWA_GENDERS, siswaUpdateSchema } from "@/libs/siswa-validation";

type TextKey = "name" | "phone" | "province" | "city" | "district" | "village";

export default function EditSiswaPage() {
  const { id } = useParams();
  const router = useRouter();

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const { errors, show, clear } = useFieldErrors();

  const [form, setForm] = useState<any>({
    name: "",
    phone: "",
    address: "",
    gender: "",
    province: "",
    city: "",
    district: "",
    village: "",
    isMember: false,
  });

  // GET DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/siswa/${id}`);
        const data = await res.json();

        setForm({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          gender: data.gender || "",
          province: data.province || "",
          city: data.city || "",
          district: data.district || "",
          village: data.village || "",
          isMember: data.isMember || false,
        });
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
    clear(key);
  };

  const textField = (key: TextKey, label: string, placeholder: string, required = false) => (
    <FormField label={label} required={required} error={errors[key]} htmlFor={`siswa-${key}`}>
      <input
        {...fieldA11y(`siswa-${key}`, errors[key])}
        value={form[key]}
        onChange={(e) => handleChange(key, e.target.value)}
        placeholder={placeholder}
        className={inputClass(errors[key])}
      />
    </FormField>
  );

  // SUBMIT: pindah halaman hanya kalau benar-benar tersimpan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = siswaUpdateSchema.safeParse({ id, ...form });
    if (!parsed.success) {
      show(fieldErrorsFromZod(parsed.error));
      toast.error("Ada isian yang belum benar. Periksa kolom yang ditandai merah.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/siswa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const failure = await readApiFailure(res, "Gagal menyimpan data siswa");
        if (Object.keys(failure.fieldErrors).length > 0) show(failure.fieldErrors);
        toast.error(failure.message);
        return;
      }

      toast.success("Data siswa berhasil disimpan");
      router.push("/admin/master-data/siswa");
    } catch {
      toast.error("Gagal menyimpan data siswa");
    } finally {
      setSaving(false);
    }
  };

  if (fetching) return <FormSkeleton fields={6} />;

  return (
    <div className="bg-white p-6 rounded-2xl shadow border space-y-6">
      <h1 className="text-xl font-bold text-gray-700">Edit Data Siswa</h1>

      <p className="text-xs text-gray-500">
        Kolom bertanda <span className="text-red-500">*</span> wajib diisi.
      </p>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
      >
        {textField("name", "Nama", "Nama lengkap", true)}
        {textField("phone", "No HP", "Contoh: 081234567890")}
        {textField("province", "Provinsi", "Provinsi")}
        {textField("city", "Kota", "Kota")}
        {textField("district", "Kecamatan", "Kecamatan")}
        {textField("village", "Desa", "Desa")}

        <div className="md:col-span-2">
          <SelectField
            label="Gender"
            error={errors.gender}
            value={form.gender}
            onChange={(val) => handleChange("gender", val)}
            options={SISWA_GENDERS.map((g) => ({ value: g, label: g }))}
          />
        </div>

        <div className="md:col-span-2">
          <FormField label="Alamat" error={errors.address} htmlFor="siswa-address">
            <textarea
              {...fieldA11y("siswa-address", errors.address)}
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Alamat"
              rows={3}
              className={inputClass(errors.address)}
            />
          </FormField>
        </div>

        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            checked={form.isMember}
            onChange={(e) => handleChange("isMember", e.target.checked)}
          />
          Member
        </label>

        <div className="md:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Busy loading={saving} text="Menyimpan...">
              Simpan
            </Busy>
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
