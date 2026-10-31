"use client";
import { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Busy from "@/components/Ui/Busy";

export default function MonitoringTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [forceSubmitId, setForceSubmitId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/monitoring");
      const result = await res.json();
      setData(result);
      setLastUpdated(new Date());
    } catch {
      console.error("Gagal fetch monitoring");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔥 INITIAL FETCH + POLLING 10 DETIK
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleForceSubmit = async () => {
    if (!forceSubmitId) return;
    try {
      setSubmitting(true);
      const res = await fetch(
        `/api/monitoring/${forceSubmitId}/force-submit`,
        {
          method: "POST",
        },
      );
      if (!res.ok) throw new Error();
      toast.success("Session berhasil disubmit");
      setForceSubmitId(null);
      await fetchData();
    } catch {
      toast.error("Gagal force submit");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === "SUBMITTED")
      return {
        color: "bg-green-100 text-green-700",
        icon: <CheckCircle size={12} />,
        label: "Selesai",
      };
    if (status === "EXPIRED")
      return {
        color: "bg-red-100 text-red-600",
        icon: <XCircle size={12} />,
        label: "Expired",
      };
    return {
      color: "bg-yellow-100 text-yellow-700",
      icon: <Clock size={12} />,
      label: "Berlangsung",
    };
  };

  const warningColor = (count: number) => {
    if (count === 0) return "text-gray-400";
    if (count <= 2) return "text-yellow-500";
    return "text-red-500 font-bold";
  };

  const ongoingSessions = data.filter((s) => s.status === "ONGOING");
  const finishedSessions = data.filter((s) => s.status !== "ONGOING");

  return (
    <div className="space-y-4">
      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Hari Ini",
            value: data.length,
            color: "border-blue-500",
          },
          {
            label: "Sedang Ujian",
            value: ongoingSessions.length,
            color: "border-yellow-500",
          },
          {
            label: "Selesai",
            value: finishedSessions.filter((s) => s.status === "SUBMITTED")
              .length,
            color: "border-green-500",
          },
          {
            label: "Expired",
            value: finishedSessions.filter((s) => s.status === "EXPIRED")
              .length,
            color: "border-red-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${stat.color}`}
          >
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-gray-800">
              Live Session Monitor
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {lastUpdated
                ? `Terakhir diupdate: ${lastUpdated.toLocaleTimeString("id-ID")}`
                : (
                  <span
                    aria-hidden="true"
                    className="inline-block h-3 w-40 animate-pulse rounded bg-gray-200 align-middle motion-reduce:animate-none"
                  />
                )}
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-xl transition"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b bg-gray-50">
                <th className="px-3 py-3">No</th>
                <th className="px-3 py-3">Peserta</th>
                <th className="px-3 py-3">Ujian</th>
                <th className="px-3 py-3">Progress</th>
                <th className="px-3 py-3">Section</th>
                <th className="px-3 py-3">Tab Warning</th>
                <th className="px-3 py-3">Sisa Waktu</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b">
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-3 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-10 text-gray-400 text-sm"
                  >
                    Belum ada session hari ini
                  </td>
                </tr>
              ) : (
                data.map((s, i) => {
                  const badge = statusBadge(s.status);
                  const progressPercent =
                    s.totalQuestions > 0
                      ? Math.round(
                          (s.answeredQuestions / s.totalQuestions) * 100,
                        )
                      : 0;

                  const remainingTime =
                    s.expiredAt && s.status === "ONGOING"
                      ? Math.max(
                          0,
                          Math.floor(
                            (new Date(s.expiredAt).getTime() - Date.now()) /
                              1000,
                          ),
                        )
                      : null;

                  const formatTime = (seconds: number) => {
                    const h = Math.floor(seconds / 3600);
                    const m = Math.floor((seconds % 3600) / 60);
                    const sec = seconds % 60;
                    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
                  };

                  return (
                    <tr
                      key={s.id}
                      className="border-b last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="px-3 py-3 text-xs text-gray-500">
                        {i + 1}
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs font-medium text-gray-800">
                          {s.userName}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs text-gray-600">{s.ujianTitle}</p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {s.answeredQuestions}/{s.totalQuestions}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600">
                        Section {s.currentSection + 1}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          {s.tabWarning > 0 && (
                            <AlertTriangle
                              size={12}
                              className="text-yellow-500"
                            />
                          )}
                          <span
                            className={`text-xs ${warningColor(s.tabWarning)}`}
                          >
                            {s.tabWarning}x
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {remainingTime !== null ? (
                          <span
                            className={`text-xs font-mono font-medium ${remainingTime < 300 ? "text-red-500" : "text-gray-600"}`}
                          >
                            {formatTime(remainingTime)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium w-fit ${badge.color}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {s.status === "ONGOING" ? (
                          <button
                            onClick={() => setForceSubmitId(s.id)}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition font-medium"
                          >
                            Force Submit
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORCE SUBMIT MODAL */}
      {forceSubmitId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Force Submit
                </h2>
                <p className="text-xs text-gray-400">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Apakah kamu yakin ingin memaksa submit session ini? Jawaban yang
              sudah diisi akan tetap dihitung.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setForceSubmitId(null)}
                disabled={submitting}
                className="flex-1 border rounded-xl py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleForceSubmit}
                disabled={submitting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 text-sm font-semibold transition disabled:opacity-50"
              >
                <Busy loading={submitting} text="Memproses...">Ya, Force Submit</Busy>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
