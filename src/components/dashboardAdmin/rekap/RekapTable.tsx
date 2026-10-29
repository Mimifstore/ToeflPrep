"use client";
import { useEffect, useState } from "react";
import { Download, FileText, Trophy } from "lucide-react";

export default function RekapTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ujianList, setUjianList] = useState<any[]>([]);
  const [selectedUjian, setSelectedUjian] = useState("");
  const [detailData, setDetailData] = useState<any>(null);

  useEffect(() => {
    // 🔥 Fetch list ujian untuk filter
    fetch("/api/exam")
      .then((res) => res.json())
      .then(setUjianList);
  }, []);

  useEffect(() => {
    fetchRekap();
  }, [selectedUjian]);

  const fetchRekap = async () => {
    try {
      setLoading(true);
      const url = `/api/rekap${selectedUjian ? `?ujianId=${selectedUjian}` : ""}`;
      const res = await fetch(url);
      const result = await res.json();
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const url = `/api/rekap/export${selectedUjian ? `?ujianId=${selectedUjian}` : ""}`;
    window.open(url, "_blank");
  };

  const handleExportPDF = (type: "rekap" | "sertifikat") => {
    const url = `/api/rekap/pdf?type=${type}${selectedUjian ? `&ujianId=${selectedUjian}` : ""}`;
    window.open(url, "_blank");
  };

  const passed = data.filter((d) => d.passed).length;
  const failed = data.filter((d) => !d.passed).length;
  const avgScore =
    data.length > 0
      ? Math.round(data.reduce((a, b) => a + b.totalScore, 0) / data.length)
      : 0;

  return (
    <div className="space-y-4">
      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Peserta",
            value: data.length,
            color: "border-blue-500",
          },
          { label: "Lulus", value: passed, color: "border-green-500" },
          { label: "Tidak Lulus", value: failed, color: "border-red-500" },
          {
            label: "Rata-rata Score",
            value: avgScore,
            color: "border-yellow-500",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${s.color}`}
          >
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-800">Rekap Nilai</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* FILTER */}
            <select
              value={selectedUjian}
              onChange={(e) => setSelectedUjian(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Ujian</option>
              {ujianList.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.title}
                </option>
              ))}
            </select>

            {/* EXPORT EXCEL */}
            <button
              onClick={handleExportExcel}
              disabled={data.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-sm transition"
            >
              <Download size={14} />
              Excel
            </button>

            {/* EXPORT PDF REKAP */}
            <button
              onClick={() => handleExportPDF("rekap")}
              disabled={data.length === 0}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-sm transition"
            >
              <FileText size={14} />
              PDF Rekap
            </button>

            {/* EXPORT SERTIFIKAT */}
            <button
              onClick={() => handleExportPDF("sertifikat")}
              disabled={data.length === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-sm transition"
            >
              <FileText size={14} />
              Sertifikat
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b bg-gray-50">
                <th className="px-3 py-3">No</th>
                <th className="px-3 py-3">Nama</th>
                <th className="px-3 py-3">Ujian</th>
                <th className="px-3 py-3">L Score</th>
                <th className="px-3 py-3">S Score</th>
                <th className="px-3 py-3">R Score</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Passing</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Selesai</th>
                <th className="px-3 py-3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b">
                    {[...Array(11)].map((_, j) => (
                      <td key={j} className="px-3 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="text-center py-10 text-gray-400 text-sm"
                  >
                    Belum ada data hasil ujian
                  </td>
                </tr>
              ) : (
                data.map((d, i) => {
                  const l =
                    d.categoryScores.find((c: any) =>
                      c.name.toLowerCase().includes("listening"),
                    )?.score ?? "-";
                  const s =
                    d.categoryScores.find((c: any) =>
                      c.name.toLowerCase().includes("structure"),
                    )?.score ?? "-";
                  const r =
                    d.categoryScores.find((c: any) =>
                      c.name.toLowerCase().includes("reading"),
                    )?.score ?? "-";

                  return (
                    <tr
                      key={d.id}
                      className="border-b last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="px-3 py-3 text-xs text-gray-500">
                        {i + 1}
                      </td>
                      <td className="px-3 py-3 text-xs font-medium text-gray-800">
                        {d.userName}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600">
                        {d.ujianTitle}
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold text-blue-600">
                        {l}
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold text-blue-600">
                        {s}
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold text-blue-600">
                        {r}
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-sm font-bold text-gray-800">
                          {d.totalScore}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500">
                        {d.passingScore}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${d.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                        >
                          {d.passed ? "Lulus" : "Tidak Lulus"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-400">
                        {d.submittedAt
                          ? new Date(d.submittedAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => setDetailData(d)}
                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg transition"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detailData && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Detail Nilai</h2>
              <button
                onClick={() => setDetailData(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <p className="text-xs text-gray-400">Nama Peserta</p>
                <p className="text-sm font-semibold text-gray-800">
                  {detailData.userName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Ujian</p>
                <p className="text-sm text-gray-700">{detailData.ujianTitle}</p>
              </div>
            </div>

            {/* SCORE PER KATEGORI */}
            <div className="space-y-3 mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Score Per Kategori
              </p>
              {detailData.categoryScores.map((cat: any) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {cat.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {cat.correct} benar dari {cat.total} soal
                    </p>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    {cat.score}
                  </span>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div
              className={`rounded-2xl p-4 text-center ${detailData.passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <p className="text-xs text-gray-500 mb-1">Total Score</p>
              <p
                className={`text-4xl font-bold ${detailData.passed ? "text-green-600" : "text-red-500"}`}
              >
                {detailData.totalScore}
              </p>
              <p
                className={`text-sm font-semibold mt-2 ${detailData.passed ? "text-green-600" : "text-red-500"}`}
              >
                {detailData.passed ? "✓ LULUS" : "✗ TIDAK LULUS"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Passing Score: {detailData.passingScore}
              </p>
            </div>

            <button
              onClick={() => setDetailData(null)}
              className="w-full mt-4 border rounded-xl py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
