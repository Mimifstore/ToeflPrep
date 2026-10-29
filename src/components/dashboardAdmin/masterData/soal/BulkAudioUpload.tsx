"use client";

import { useState } from "react";
import { supabase } from "@/libs/supabase";
import toast from "react-hot-toast";
import {
  Upload,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
} from "lucide-react";

const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/x-m4a",
  "audio/mp4",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type UploadItem = {
  originalName: string;
  status: "pending" | "uploading" | "success" | "failed";
  url?: string;
  errorMessage?: string;
};

export default function BulkAudioUpload() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // 🔥 VALIDASI SEBELUM MASUK ANTRIAN
    const validated: UploadItem[] = [];
    for (const file of fileArray) {
      if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
        toast.error(
          `"${file.name}" dilewati — format gak didukung (harus MP3/WAV/OGG/M4A)`,
        );
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" dilewati — ukuran lebih dari 10MB`);
        continue;
      }
      validated.push({ originalName: file.name, status: "pending" });
    }

    setItems(validated);
    // simpan File object asli di closure lewat state terpisah biar gampang di-loop pas upload
    (window as any).__pendingBulkFiles = fileArray.filter((f) =>
      validated.some((v) => v.originalName === f.name),
    );
  };

  const handleUploadAll = async () => {
    const files: File[] = (window as any).__pendingBulkFiles || [];
    if (files.length === 0) return;

    setUploading(true);

    // 🔥 UPLOAD SATU-SATU (bukan Promise.all) — biar gak nge-flood Supabase
    // storage dengan puluhan request bersamaan kalau filenya banyak
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      setItems((prev) =>
        prev.map((item, idx) =>
          idx === i ? { ...item, status: "uploading" } : item,
        ),
      );

      try {
        // 1) minta izin upload ke server (server yang ngecek admin)
        const signRes = await fetch("/api/audio/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            size: file.size,
          }),
        });
        if (!signRes.ok) {
          const err = await signRes.json().catch(() => ({}));
          throw new Error(err.error || "Gagal minta izin upload");
        }
        const { path, token, publicUrl } = await signRes.json();

        // 2) upload langsung ke Supabase pakai token dari server
        const { error } = await supabase.storage
          .from("audio")
          .uploadToSignedUrl(path, token, file, {
            contentType: file.type,
            cacheControl: "3600",
          });
        if (error) throw error;

        // 3) simpan URL hasil upload buat ditampilin di tabel
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "success", url: publicUrl } : item,
          ),
        );
      } catch (err: any) {
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? {
                  ...item,
                  status: "failed",
                  errorMessage: err.message || "Upload gagal",
                }
              : item,
          ),
        );
      }
    }

    setUploading(false);
    toast.success("Selesai upload semua file");
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL disalin");
  };

  const copyAllUrls = () => {
    const urls = items
      .filter((i) => i.status === "success" && i.url)
      .map((i) => i.url)
      .join("\n");
    navigator.clipboard.writeText(urls);
    toast.success(
      `${items.filter((i) => i.status === "success").length} URL disalin (urut sesuai urutan upload)`,
    );
  };

  // 🔥 DOWNLOAD SEBAGAI CSV — biar gampang dibuka di Excel & di-paste manual
  const downloadCsv = () => {
    const rows = [
      ["NamaFileAsli", "AudioUrl"],
      ...items
        .filter((i) => i.status === "success" && i.url)
        .map((i) => [i.originalName, i.url as string]),
    ];
    const csvContent = rows
      .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hasil-upload-audio.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const successCount = items.filter((i) => i.status === "success").length;
  const failedCount = items.filter((i) => i.status === "failed").length;

  return (
    <div className="bg-white p-6 rounded-2xl shadow border space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Upload Audio Massal</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload banyak file audio sekaligus, dapetin URL-nya buat ditempel ke
          kolom{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
            AudioUrl
          </code>{" "}
          di template Excel. Kasih nama file yang jelas urutannya (misal{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
            01-listening.mp3
          </code>
          ) biar gampang dicocokin ke baris soal.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
        <input
          id="bulk-audio-input"
          type="file"
          multiple
          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/x-m4a,audio/mp4"
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="hidden"
        />
        <label
          htmlFor="bulk-audio-input"
          className="cursor-pointer inline-flex flex-col items-center gap-2"
        >
          <Upload className="w-8 h-8 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">
            Klik buat pilih banyak file audio sekaligus
          </span>
          <span className="text-xs text-gray-400">
            MP3, WAV, OGG, M4A — maksimal 10MB per file
          </span>
        </label>
      </div>

      {items.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {items.length} file dipilih
              {successCount > 0 && (
                <span className="text-emerald-600 ml-2">
                  · {successCount} berhasil
                </span>
              )}
              {failedCount > 0 && (
                <span className="text-red-500 ml-2">· {failedCount} gagal</span>
              )}
            </p>
            <button
              onClick={handleUploadAll}
              disabled={uploading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Semua"
              )}
            </button>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Nama File Asli</th>
                  <th className="px-4 py-2 text-left">URL Hasil Upload</th>
                  <th className="px-4 py-2 text-left w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-2">
                      {item.status === "pending" && (
                        <span className="text-gray-400 text-xs">Menunggu</span>
                      )}
                      {item.status === "uploading" && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      )}
                      {item.status === "success" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {item.status === "failed" && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {item.originalName}
                    </td>
                    <td className="px-4 py-2 text-gray-500 break-all max-w-xs">
                      {item.status === "success" && item.url}
                      {item.status === "failed" && (
                        <span className="text-red-500">
                          {item.errorMessage}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {item.status === "success" && item.url && (
                        <button
                          onClick={() => copyUrl(item.url as string)}
                          title="Salin URL"
                        >
                          <Copy className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {successCount > 0 && (
            <div className="flex gap-3">
              <button
                onClick={copyAllUrls}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition"
              >
                <Copy className="w-4 h-4" />
                Salin Semua URL (urut)
              </button>
              <button
                onClick={downloadCsv}
                className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm transition"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
