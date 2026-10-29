"use client";
import { useEffect, useState } from "react";
import { User, Edit3, Save, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfileCard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          gender: data.gender || "",
          address: data.address || "",
          province: data.province || "",
          city: data.city || "",
          district: data.district || "",
          village: data.village || "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      const updated = await res.json();
      setProfile((prev: any) => ({ ...prev, ...updated }));
      setEditing(false);
      toast.success("Profile berhasil diupdate");
    } catch {
      toast.error("Gagal update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: profile.name || "",
      phone: profile.phone || "",
      gender: profile.gender || "",
      address: profile.address || "",
      province: profile.province || "",
      city: profile.city || "",
      district: profile.district || "",
      village: profile.village || "",
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center text-gray-400 text-sm">
        Profile tidak ditemukan
      </div>
    );
  }

  const fields = [
    { label: "Nama Lengkap", key: "name", type: "text" },
    { label: "Nomor HP (WA)", key: "phone", type: "text" },
    {
      label: "Jenis Kelamin",
      key: "gender",
      type: "select",
      options: [
        { value: "Laki-laki", label: "Laki-laki" },
        { value: "Perempuan", label: "Perempuan" },
      ],
    },
    { label: "Alamat", key: "address", type: "text" },
    { label: "Provinsi", key: "province", type: "text" },
    { label: "Kota/Kab", key: "city", type: "text" },
    { label: "Kecamatan", key: "district", type: "text" },
    { label: "Desa/Kelurahan", key: "village", type: "text" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* HEADER */}
      <div className="bg-gray-500 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {profile.name || "Belum diisi"}
              </h2>
              <p className="text-blue-100 text-sm">{profile.email}</p>
              <div className="flex gap-2 mt-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${profile.isActive ? "bg-green-400/20 text-green-100" : "bg-red-400/20 text-red-100"}`}
                >
                  {profile.isActive ? "Aktif" : "Nonaktif"}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${profile.isMember ? "bg-yellow-400/20 text-yellow-100" : "bg-white/10 text-white/70"}`}
                >
                  {profile.isMember ? "Member" : "Non-member"}
                </span>
              </div>
            </div>
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-sm transition"
              >
                <X className="w-4 h-4" />
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FORM */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Informasi Pribadi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-xs font-medium text-gray-500">
                {field.label}
              </label>
              {editing ? (
                field.type === "select" ? (
                  <select
                    value={form[field.key] || ""}
                    onChange={(e) =>
                      setForm((prev: any) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={form[field.key] || ""}
                    onChange={(e) =>
                      setForm((prev: any) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )
              ) : (
                <div className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700">
                  {profile[field.key] || (
                    <span className="text-gray-400 italic">Belum diisi</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* EMAIL — read only */}
        <div className="mt-4 space-y-1">
          <label className="text-xs font-medium text-gray-500">Email</label>
          <div className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-500 flex items-center gap-2">
            {profile.email}
            <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
              Tidak dapat diubah
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
