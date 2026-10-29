"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditSiswaPage() {
  const { id } = useParams();
  const router = useRouter();

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

  // 🔥 GET DATA
  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, [id]);

  // 🔥 HANDLE CHANGE
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🔥 SUBMIT
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await fetch("/api/siswa", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        ...form,
      }),
    });

    router.push("/admin/master-data/siswa");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow border space-y-6">
      <h1 className="text-xl font-bold text-gray-700">Edit Data Siswa</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 text-sm">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nama"
          className="border p-2 rounded"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="No HP"
          className="border p-2 rounded"
        />

        <input
          name="province"
          value={form.province}
          onChange={handleChange}
          placeholder="Provinsi"
          className="border p-2 rounded"
        />
        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="Kota"
          className="border p-2 rounded"
        />

        <input
          name="district"
          value={form.district}
          onChange={handleChange}
          placeholder="Kecamatan"
          className="border p-2 rounded"
        />
        <input
          name="village"
          value={form.village}
          onChange={handleChange}
          placeholder="Desa"
          className="border p-2 rounded"
        />

        <input
          name="gender"
          value={form.gender}
          onChange={handleChange}
          placeholder="Gender"
          className="border p-2 rounded col-span-2"
        />

        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Alamat"
          className="border p-2 rounded col-span-2"
        />

        <label className="flex items-center gap-2 col-span-2">
          <input
            type="checkbox"
            name="isMember"
            checked={form.isMember}
            onChange={handleChange}
          />
          Member
        </label>

        <div className="col-span-2 flex gap-3">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Simpan
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
