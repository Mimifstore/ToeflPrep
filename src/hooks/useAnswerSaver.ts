"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

type Props = {
  sessionId: string;
};

const DEBOUNCE_MS = 500;

export function useAnswerSaver({ sessionId }: Props) {
  // 🔥 SATU TIMER PER SOAL. Dulu satu timer untuk semua soal: menjawab soal berikutnya
  // dalam 0,5 detik membatalkan simpanan soal sebelumnya (jawaban hilang diam-diam).
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  // jawaban terbaru per soal yang belum terkirim
  const pending = useRef(new Map<string, string>());
  // pengiriman per soal dibuat berurutan supaya jawaban lama tidak menimpa yang baru
  const chains = useRef(new Map<string, Promise<void>>());
  const inFlight = useRef(new Set<Promise<void>>());

  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);

  // tidak pernah reject: semua galat ditangani di sini
  const send = useCallback(
    async (questionId: string, answer: string) => {
      setSavingQuestionId(questionId);

      try {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const res = await fetch("/api/tryout/answer", {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                sessionId,

                questionId,

                answer,
              }),
            });

            if (res.ok) return;

            // ditolak server (waktu habis, section lain, dst): tidak perlu diulang
            if (res.status < 500) break;
          } catch {
            // jaringan terputus sesaat: coba sekali lagi
          }
        }

        toast.error("Gagal menyimpan jawaban");
      } finally {
        setSavingQuestionId((prev) => (prev === questionId ? null : prev));
      }
    },
    [sessionId],
  );

  const enqueue = useCallback(
    (questionId: string, answer: string) => {
      const previous = chains.current.get(questionId) ?? Promise.resolve();
      const next = previous.then(() => send(questionId, answer));

      chains.current.set(questionId, next);
      inFlight.current.add(next);

      next.finally(() => {
        inFlight.current.delete(next);
        if (chains.current.get(questionId) === next) {
          chains.current.delete(questionId);
        }
      });
    },
    [send],
  );

  const saveAnswer = ({
    questionId,
    answer,
  }: {
    questionId: string;

    answer: string;
  }) => {
    pending.current.set(questionId, answer);

    // 🔥 DEBOUNCE PER SOAL
    const existing = timers.current.get(questionId);
    if (existing) clearTimeout(existing);

    timers.current.set(
      questionId,
      setTimeout(() => {
        timers.current.delete(questionId);

        const latest = pending.current.get(questionId);
        pending.current.delete(questionId);

        if (latest !== undefined) enqueue(questionId, latest);
      }, DEBOUNCE_MS),
    );
  };

  // 🔥 KIRIM SEMUA YANG MASIH MENUNGGU SEKARANG JUGA dan tunggu sampai selesai.
  // Dipanggil sebelum pindah section atau submit, supaya jawaban terakhir tidak ketinggalan.
  const flush = useCallback(async () => {
    for (const [questionId, timer] of [...timers.current]) {
      clearTimeout(timer);
      timers.current.delete(questionId);

      const latest = pending.current.get(questionId);
      pending.current.delete(questionId);

      if (latest !== undefined) enqueue(questionId, latest);
    }

    await Promise.allSettled([...inFlight.current]);
  }, [enqueue]);

  // halaman ditinggalkan: kirim yang masih menunggu (permintaan tetap berjalan setelah unmount)
  useEffect(() => {
    return () => {
      void flush();
    };
  }, [flush]);

  return {
    saveAnswer,

    flush,

    savingQuestionId,
  };
}
