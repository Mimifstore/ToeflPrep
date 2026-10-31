"use client";

import React from "react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  PenBox,
  Trash2,
  Download,
  Upload,
  CheckSquare,
  Square,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import Busy from "@/components/Ui/Busy";

export default function DetailSoal({ examId }: { examId: string }) {
  const [page, setPage] = useState(1);
  const [exam, setExam] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔥 BULK DELETE STATE
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const perPage = 5;

  const fetchSoal = useCallback(async () => {
    const res = await fetch(`/api/soal/${examId}`);
    const result = await res.json();
    setExam(result);
  }, [examId]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    fetchSoal();
  }, [fetchSoal]);

  const handleDownloadTemplate = () => {
    const headers = [
      "Section",
      "Type",
      "Question",
      "Direction",
      "A",
      "B",
      "C",
      "D",
      "Answer",
      "AudioUrl",
      "AudioLimit",
      "Category",
    ];

    const example = [
      [
        "Listening",
        "DIRECTION",
        "",
        "Listen to the following conversation carefully.",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      [
        "Listening",
        "QUESTION",
        "What does the man suggest?",
        "",
        "Go to the store",
        "Call a friend",
        "Take a bus",
        "Stay home",
        "A",
        "",
        "",
        "Listening Score",
      ],
      [
        "Structure",
        "QUESTION",
        "The students ___ in the library.",
        "",
        "is",
        "are",
        "was",
        "were",
        "B",
        "",
        "",
        "Structure Score",
      ],
      [
        "Reading",
        "QUESTION",
        "What is the main idea of the passage?",
        "",
        "Option A",
        "Option B",
        "Option C",
        "Option D",
        "C",
        "",
        "",
        "Reading Score",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...example]);
    ws["!cols"] = [
      { wch: 12 },
      { wch: 12 },
      { wch: 40 },
      { wch: 40 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 8 },
      { wch: 40 },
      { wch: 12 },
      { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Soal");
    XLSX.writeFile(wb, "template-soal.xlsx");

    toast.success("Template berhasil didownload");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("examId", examId);

      const res = await fetch("/api/soal/import", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Gagal import");

      setImportResult(result);

      if (result.success > 0) {
        await fetchSoal();
        toast.success(`${result.success} soal berhasil diimport`);
      }

      if (result.failed > 0) {
        toast.error(`Import dibatalkan: ${result.failed} baris bermasalah`);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal import soal");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 🔥 TOGGLE SELECT MODE
  const toggleSelectMode = () => {
    setSelectMode((prev) => !prev);
    setSelectedIds([]);
  };

  // 🔥 TOGGLE SATU SOAL
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // 🔥 SELECT/DESELECT SEMUA DALAM 1 SECTION
  const toggleSelectSection = (questionIds: string[]) => {
    const allSelected = questionIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !questionIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...questionIds])]);
    }
  };

  // 🔥 BULK DELETE
  const handleBulkDelete = async () => {
    try {
      setBulkDeleting(true);
      const res = await fetch("/api/question/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds: selectedIds }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal hapus soal");

      toast.success(`${result.deletedCount} soal berhasil dihapus`);
      setSelectedIds([]);
      setSelectMode(false);
      setShowBulkDeleteModal(false);
      await fetchSoal();
    } catch (error: any) {
      toast.error(error.message || "Gagal hapus soal");
    } finally {
      setBulkDeleting(false);
    }
  };

  const grouped = (exam?.questions ?? []).reduce((acc: any, q: any) => {
    const sectionId = q.section?.id;
    if (!sectionId) return acc;
    if (!acc[sectionId]) {
      acc[sectionId] = { section: q.section, questions: [] };
    }
    acc[sectionId].questions.push(q);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* INFO */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow border relative">
        <div className="flex justify-end mb-3 md:absolute md:right-6 md:top-2">
          <Link href="/admin/master-data/soal">
            <button className="w-full md:w-auto bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm">
              Kembali
            </button>
          </Link>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          {[
            ["Peminatan", exam?.category?.name],
            ["Judul Soal", exam?.title],
            ["Total Pilihan Ganda", exam?.totalOption],
            ["Total Bagian", exam?.totalSession],
          ].map(([label, value], i) => (
            <div key={i} className="flex flex-col md:flex-row md:border-b pb-2">
              <span className="md:w-72 font-semibold">{label}</span>
              <span className="hidden md:block mr-2">:</span>
              <span className="font-medium">{value || "-"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white p-4 rounded-2xl shadow border">
        <div className="flex flex-col md:flex-row gap-2 md:justify-between mb-4">
          <input
            placeholder="Cari soal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition"
            >
              <Download size={14} />
              Template
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm transition"
            >
              <Upload size={14} />
              <Busy loading={importing} text="Importing...">Import Excel</Busy>
            </button>

            <Link href="/admin/master-data/soal/bulk-audio">
              <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition">
                Upload Audio Massal
              </button>
            </Link>

            {/* 🔥 TOGGLE SELECT MODE */}
            <button
              onClick={toggleSelectMode}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                selectMode
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {selectMode ? "Batal Pilih" : "Pilih Soal"}
            </button>

            <Link href={`/admin/master-data/soal/${examId}/create`}>
              <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition">
                + Tambah Soal
              </button>
            </Link>
          </div>
        </div>

        {/* 🔥 BULK ACTION BAR */}
        {selectMode && selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4">
            <span className="text-sm font-medium text-blue-700">
              {selectedIds.length} soal terpilih
            </span>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <Trash2 size={14} />
              Hapus {selectedIds.length} Soal
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-gray-50 border-b text-gray-600">
              <tr>
                {selectMode && <th className="px-3 py-3 text-left w-10"></th>}
                <th className="px-3 py-3 text-left w-10">No</th>
                <th className="px-3 py-3 text-left">Soal</th>
                <th className="px-3 py-3 text-left w-24">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {Object.keys(grouped).length === 0 ? (
                <tr>
                  <td
                    colSpan={selectMode ? 4 : 3}
                    className="text-center py-6 text-gray-400"
                  >
                    Belum ada soal
                  </td>
                </tr>
              ) : (
                Object.values(grouped).map((group: any) => {
                  const sectionQuestionIds = group.questions.map(
                    (q: any) => q.id,
                  );
                  const allSectionSelected = sectionQuestionIds.every(
                    (id: string) => selectedIds.includes(id),
                  );

                  return (
                    <React.Fragment key={group.section.id}>
                      <tr>
                        <td
                          colSpan={selectMode ? 4 : 3}
                          className="px-3 py-2 font-semibold text-blue-600 bg-blue-50"
                        >
                          <div className="flex items-center justify-between">
                            <span>
                              Section {group.section.order} -{" "}
                              {group.section.title}
                            </span>
                            {selectMode && (
                              <button
                                onClick={() =>
                                  toggleSelectSection(sectionQuestionIds)
                                }
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                              >
                                {allSectionSelected ? (
                                  <CheckSquare size={14} />
                                ) : (
                                  <Square size={14} />
                                )}
                                Pilih Semua
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {(() => {
                        let questionNumber = 0;
                        return group.questions
                          .sort((a: any, b: any) => a.order - b.order)
                          .map((d: any) => {
                            if (d.type === "QUESTION") questionNumber++;
                            const isSelected = selectedIds.includes(d.id);

                            return (
                              <tr
                                key={d.id}
                                className={`border-b align-top ${isSelected ? "bg-blue-50" : ""}`}
                              >
                                {selectMode && (
                                  <td className="px-3 py-3">
                                    <button onClick={() => toggleSelect(d.id)}>
                                      {isSelected ? (
                                        <CheckSquare
                                          size={16}
                                          className="text-blue-600"
                                        />
                                      ) : (
                                        <Square
                                          size={16}
                                          className="text-gray-400"
                                        />
                                      )}
                                    </button>
                                  </td>
                                )}
                                <td className="px-3 py-3 font-semibold">
                                  {d.type === "DIRECTION" ? (
                                    <span className="text-red-600 text-[11px] font-bold">
                                      DIR
                                    </span>
                                  ) : (
                                    questionNumber
                                  )}
                                </td>
                                <td className="px-3 py-3 space-y-2">
                                  {d.audioUrl && (
                                    <audio controls className="w-full max-w-xs">
                                      <source src={d.audioUrl} />
                                    </audio>
                                  )}
                                  {d.type === "DIRECTION" && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                      <div className="text-[11px] uppercase tracking-wide font-bold text-yellow-700 mb-2">
                                        Direction
                                      </div>
                                      <div
                                        className="italic text-gray-700 text-xs md:text-sm"
                                        dangerouslySetInnerHTML={{
                                          __html: d.directionText || "-",
                                        }}
                                      />
                                    </div>
                                  )}
                                  {d.type === "QUESTION" && (
                                    <>
                                      <div
                                        className="pb-2 border-b text-xs md:text-sm"
                                        dangerouslySetInnerHTML={{
                                          __html: d.questionText || "",
                                        }}
                                      />
                                      <div className="space-y-2 mt-2">
                                        {d.options?.map((opt: any) => (
                                          <div
                                            key={opt.id}
                                            className={`flex gap-2 ${
                                              d.correctAnswer === opt.label
                                                ? "text-green-600 font-semibold"
                                                : ""
                                            }`}
                                          >
                                            <span>{opt.label}.</span>
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html: opt.text,
                                              }}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </td>
                                <td className="px-3 py-3 flex gap-1 md:gap-2">
                                  <Link
                                    href={`/admin/master-data/soal/${exam.id}/edit/${d.id}`}
                                  >
                                    <button className="p-1.5 md:p-2 bg-gray-200 rounded-md">
                                      <PenBox size={14} />
                                    </button>
                                  </Link>
                                  <button
                                    onClick={() => setDeleteId(d.id)}
                                    className="p-1.5 bg-gray-100 rounded-md hover:bg-red-100"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          });
                      })()}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* IMPORT RESULT MODAL — sama seperti sebelumnya */}
      {importResult && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Hasil Import
            </h2>
            
            {importResult.message && (
              <p className="text-sm text-gray-600 mb-4">
                {importResult.message}
              </p>
            )}

            <div className="flex gap-4 mb-4">
              <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {importResult.success}
                </p>
                <p className="text-sm text-green-700 mt-1">Berhasil</p>
              </div>
              <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-red-500">
                  {importResult.failed}
                </p>
                <p className="text-sm text-red-600 mt-1">Gagal</p>
              </div>
            </div>
            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">
                  Detail Error:
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {importResult.errors.map((err: any, i: number) => (
                    <div
                      key={i}
                      className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm"
                    >
                      <span className="font-semibold text-red-600">
                        Row {err.row}:
                      </span>{" "}
                      <span className="text-red-500">{err.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResult.warnings && importResult.warnings.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-sm font-semibold text-gray-700">
                  Peringatan:
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {importResult.warnings.map((warn: string, i: number) => (
                    <div
                      key={i}
                      className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700"
                    >
                      {warn}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setImportResult(null)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* SINGLE DELETE MODAL */}
      {deleteId && (
        <div className="w-full fixed top-0 inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Hapus Soal</h2>
            <p className="text-sm text-gray-500 mb-4">
              Yakin mau hapus soal ini?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-3 py-2 text-sm bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                disabled={loadingDelete}
                onClick={async () => {
                  try {
                    setLoadingDelete(true);
                    const res = await fetch(`/api/question/${deleteId}`, {
                      method: "DELETE",
                    });
                    if (!res.ok) throw new Error();
                    await fetchSoal();
                    toast.success("Soal berhasil dihapus");
                    setDeleteId(null);
                  } catch {
                    toast.error("Gagal menghapus soal");
                  } finally {
                    setLoadingDelete(false);
                  }
                }}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg"
              >
                <Busy loading={loadingDelete} text="Menghapus...">Hapus</Busy>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 BULK DELETE MODAL */}
      {showBulkDeleteModal && (
        <div className="w-full fixed top-0 inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">
              Hapus {selectedIds.length} Soal
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Yakin mau hapus {selectedIds.length} soal yang terpilih? Tindakan
              ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={bulkDeleting}
                className="px-3 py-2 text-sm bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50"
              >
                {bulkDeleting
                  ? "Menghapus..."
                  : `Hapus ${selectedIds.length} Soal`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
