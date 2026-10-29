"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

// 🔥 TABEL KONVERSI TOEFL ITP STANDAR
const TOEFL_TABLES: Record<string, Record<number, number>> = {
  listening: {
    0: 24,
    1: 24,
    2: 24,
    3: 25,
    4: 26,
    5: 27,
    6: 28,
    7: 29,
    8: 30,
    9: 31,
    10: 32,
    11: 33,
    12: 34,
    13: 35,
    14: 36,
    15: 38,
    16: 39,
    17: 40,
    18: 41,
    19: 42,
    20: 43,
    21: 44,
    22: 45,
    23: 46,
    24: 47,
    25: 48,
    26: 49,
    27: 51,
    28: 52,
    29: 53,
    30: 54,
    31: 55,
    32: 56,
    33: 57,
    34: 58,
    35: 59,
    36: 60,
    37: 61,
    38: 62,
    39: 63,
    40: 64,
    41: 65,
    42: 66,
    43: 67,
    44: 68,
    45: 68,
    46: 68,
    47: 68,
    48: 68,
    49: 68,
    50: 68,
  },
  structure: {
    0: 31,
    1: 31,
    2: 31,
    3: 31,
    4: 32,
    5: 33,
    6: 34,
    7: 35,
    8: 36,
    9: 37,
    10: 38,
    11: 39,
    12: 40,
    13: 41,
    14: 42,
    15: 43,
    16: 44,
    17: 45,
    18: 46,
    19: 47,
    20: 48,
    21: 49,
    22: 50,
    23: 51,
    24: 52,
    25: 53,
    26: 54,
    27: 55,
    28: 56,
    29: 57,
    30: 58,
    31: 59,
    32: 60,
    33: 61,
    34: 62,
    35: 63,
    36: 64,
    37: 65,
    38: 66,
    39: 67,
    40: 68,
  },
  reading: {
    0: 31,
    1: 31,
    2: 31,
    3: 31,
    4: 32,
    5: 33,
    6: 34,
    7: 35,
    8: 36,
    9: 37,
    10: 38,
    11: 39,
    12: 40,
    13: 41,
    14: 42,
    15: 43,
    16: 44,
    17: 45,
    18: 46,
    19: 47,
    20: 48,
    21: 49,
    22: 50,
    23: 51,
    24: 52,
    25: 53,
    26: 54,
    27: 55,
    28: 56,
    29: 57,
    30: 58,
    31: 59,
    32: 60,
    33: 61,
    34: 62,
    35: 63,
    36: 64,
    37: 65,
    38: 66,
    39: 67,
    40: 68,
    41: 69,
    42: 70,
    43: 71,
    44: 72,
    45: 73,
    46: 74,
    47: 75,
    48: 76,
    49: 77,
    50: 67,
  },
};

// 🔥 TABEL KONVERSI TOEIC STANDAR
const TOEIC_TABLES: Record<string, Record<number, number>> = {
  listening: {
    0: 5,
    1: 5,
    2: 5,
    3: 10,
    4: 15,
    5: 20,
    6: 25,
    7: 30,
    8: 35,
    9: 40,
    10: 45,
    11: 50,
    12: 55,
    13: 60,
    14: 65,
    15: 70,
    16: 75,
    17: 80,
    18: 85,
    19: 90,
    20: 95,
    21: 100,
    22: 105,
    23: 110,
    24: 115,
    25: 120,
    26: 125,
    27: 130,
    28: 135,
    29: 140,
    30: 145,
    31: 150,
    32: 155,
    33: 160,
    34: 165,
    35: 170,
    36: 175,
    37: 180,
    38: 185,
    39: 190,
    40: 195,
    41: 200,
    42: 210,
    43: 220,
    44: 230,
    45: 240,
    46: 260,
    47: 280,
    48: 300,
    49: 380,
    50: 495,
  },
  reading: {
    0: 5,
    1: 5,
    2: 5,
    3: 10,
    4: 15,
    5: 20,
    6: 25,
    7: 30,
    8: 35,
    9: 40,
    10: 45,
    11: 50,
    12: 55,
    13: 60,
    14: 65,
    15: 70,
    16: 75,
    17: 80,
    18: 85,
    19: 90,
    20: 95,
    21: 100,
    22: 105,
    23: 110,
    24: 115,
    25: 120,
    26: 125,
    27: 130,
    28: 135,
    29: 140,
    30: 145,
    31: 150,
    32: 155,
    33: 160,
    34: 165,
    35: 170,
    36: 175,
    37: 180,
    38: 185,
    39: 190,
    40: 195,
    41: 200,
    42: 210,
    43: 220,
    44: 230,
    45: 240,
    46: 260,
    47: 280,
    48: 300,
    49: 380,
    50: 495,
  },
};

const LIST_URL = "/admin/master-data/kategori-penilaian";

function KategoriPenilaianForm({ categoryId }: { categoryId?: string }) {
  const router = useRouter();
  const isEdit = !!categoryId;

  const [program, setProgram] = useState("TOEFL");
  const [name, setName] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [sections, setSections] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newSection, setNewSection] = useState("");
  const [creatingSection, setCreatingSection] = useState(false);
  const [mappings, setMappings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  const fetchSections = async () => {
    try {
      const res = await fetch("/api/section");
      const data = await res.json();
      setSections(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // 🔥 MODE EDIT: ambil data kategori yang mau diedit
  useEffect(() => {
    if (!categoryId) return;

    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/category-score/${categoryId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        setProgram(data.program);
        setName(data.name);
        setSectionId(data.sectionId);
        setMappings(
          [...data.mappings]
            .sort((a: any, b: any) => a.minScore - b.minScore)
            .map((m: any) => ({
              minScore: m.minScore,
              maxScore: m.maxScore,
              finalScore: m.finalScore,
            })),
        );
      } catch (error) {
        console.error(error);
        toast.error("Kategori tidak ditemukan");
        router.push(LIST_URL);
      } finally {
        setLoadingData(false);
      }
    };

    fetchCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const handleCreateSection = async () => {
    try {
      if (!newSection) {
        toast.error("Nama section wajib diisi");
        return;
      }

      setCreatingSection(true);

      const res = await fetch("/api/section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSection }),
      });

      if (!res.ok) throw new Error();

      const created = await res.json();
      await fetchSections();
      setSectionId(created.id);
      setNewSection("");
      setShowModal(false);
      toast.success("Section berhasil dibuat");
    } catch (error) {
      console.error(error);
      toast.error("Gagal membuat section");
    } finally {
      setCreatingSection(false);
    }
  };

  // 🔥 GENERATE MAPPING BERDASARKAN PROGRAM DAN NAMA
  const generateMapping = () => {
    if (
      mappings.length > 0 &&
      !window.confirm(
        "Mapping yang ada akan diganti hasil generate. Lanjutkan?",
      )
    ) {
      return;
    }

    const nameLower = name.toLowerCase();
    let table: Record<number, number> | null = null;

    if (program === "TOEFL") {
      if (nameLower.includes("listening")) table = TOEFL_TABLES.listening;
      else if (nameLower.includes("structure")) table = TOEFL_TABLES.structure;
      else if (nameLower.includes("reading")) table = TOEFL_TABLES.reading;
    } else if (program === "TOEIC") {
      if (nameLower.includes("listening")) table = TOEIC_TABLES.listening;
      else if (nameLower.includes("reading")) table = TOEIC_TABLES.reading;
    }

    if (!table) {
      // CUSTOM — generate kosong, admin isi sendiri
      const data = [];
      for (let i = 0; i <= 50; i++) {
        data.push({ minScore: i, maxScore: i, finalScore: 0 });
      }
      setMappings(data);
      toast.error(
        program === "CUSTOM"
          ? "Silakan isi finalScore secara manual"
          : "Nama kategori tidak dikenali, isi finalScore manual. Pastikan nama mengandung kata 'Listening', 'Structure', atau 'Reading'",
      );
      return;
    }

    const data = Object.entries(table).map(([rawScore, finalScore]) => ({
      minScore: Number(rawScore),
      maxScore: Number(rawScore),
      finalScore,
    }));

    setMappings(data);
    toast.success("Mapping berhasil digenerate sesuai standar");
  };

  const handleSubmit = async () => {
    try {
      if (!name) {
        toast.error("Nama wajib diisi");
        return;
      }
      if (!sectionId) {
        toast.error("Section wajib dipilih");
        return;
      }
      if (mappings.length === 0) {
        toast.error("Generate mapping dulu");
        return;
      }

      setLoading(true);

      const res = await fetch(
        isEdit ? `/api/category-score/${categoryId}` : "/api/category-score",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ program, name, sectionId, mappings }),
        },
      );

      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.error || "");
      }

      toast.success(
        isEdit ? "Kategori berhasil diperbarui" : "Kategori berhasil dibuat",
      );
      router.push(LIST_URL);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.message ||
          (isEdit ? "Gagal memperbarui kategori" : "Gagal membuat kategori"),
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔥 LOADING DATA (mode edit)
  if (loadingData) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4 animate-pulse">
        <div className="h-6 w-56 bg-gray-100 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
        </div>
        <div className="h-48 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Kategori Penilaian" : "Tambah Kategori Penilaian"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola kategori penilaian dan mapping score.
          </p>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* PROGRAM */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Program
            </label>
            <select
              value={program}
              onChange={(e) => {
                setProgram(e.target.value);
                setMappings([]); // reset mapping kalau ganti program
              }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TOEFL">TOEFL ITP</option>
              <option value="TOEIC">TOEIC</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          {/* NAME */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Nama Penilaian
            </label>
            <input
              placeholder={
                program === "TOEFL"
                  ? "Contoh: Listening Score"
                  : program === "TOEIC"
                    ? "Contoh: Listening Score"
                    : "Contoh: Nilai Akhir"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* HINT */}
            {(program === "TOEFL" || program === "TOEIC") && (
              <p className="text-xs text-gray-400">
                Nama harus mengandung kata{" "}
                <span className="font-semibold text-blue-500">
                  {program === "TOEFL"
                    ? "'Listening', 'Structure', atau 'Reading'"
                    : "'Listening' atau 'Reading'"}
                </span>{" "}
                agar mapping otomatis terisi.
              </p>
            )}
          </div>

          {/* SECTION */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">
              Section
            </label>
            <div className="flex flex-col md:flex-row gap-3">
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm font-semibold"
              >
                <Plus size={16} />
                Tambah Section
              </button>
            </div>
          </div>
        </div>

        {/* GENERATE */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-gray-800">Mapping Score</h2>
            <p className="text-sm text-gray-500">
              {program === "CUSTOM"
                ? "Generate template kosong, isi finalScore manual."
                : "Generate otomatis sesuai standar " + program + "."}
            </p>
          </div>
          <button
            type="button"
            onClick={generateMapping}
            className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
          >
            Generate Mapping
          </button>
        </div>

        {/* TABLE */}
        {mappings.length > 0 && (
          <div className="overflow-auto border border-gray-100 rounded-2xl">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">No</th>
                  <th className="p-3 text-left">Min Score</th>
                  <th className="p-3 text-left">Max Score</th>
                  <th className="p-3 text-left">Final Score</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((m, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3">{m.minScore}</td>
                    <td className="p-3">{m.maxScore}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={m.finalScore}
                        onChange={(e) => {
                          const newData = [...mappings];
                          newData[i].finalScore = Number(e.target.value);
                          setMappings(newData);
                        }}
                        className="w-24 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ACTION */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            onClick={() => router.push(LIST_URL)}
            className="bg-gray-100 hover:bg-gray-200 transition px-5 py-3 rounded-xl text-sm font-semibold text-gray-700"
          >
            Batal
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Tambah Section
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Buat section baru untuk kategori penilaian.
              </p>
            </div>
            <input
              placeholder="Contoh: Listening"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleCreateSection}
                disabled={creatingSection}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {creatingSection ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 🔥 Halaman ini dipakai untuk TAMBAH dan EDIT:
//   /kategori-penilaian/create           -> tambah
//   /kategori-penilaian/create?id=<id>   -> edit
function FormLoader() {
  const id = useSearchParams()?.get("id") || undefined;

  // key: supaya form ter-reset kalau pindah dari edit ke tambah (atau antar kategori)
  return <KategoriPenilaianForm key={id ?? "new"} categoryId={id} />;
}

export default function CreateKategoriPenilaian() {
  return (
    <Suspense fallback={null}>
      <FormLoader />
    </Suspense>
  );
}
