"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

type Props = {
  audio: string;

  sessionId: string;

  questionId: string;

  playLimit?: number | null;

  initialPlayCount?: number;

  onEnded?: () => void;

  autoPlay?: boolean;
};

// Jatah putar baru dihitung setelah audio benar-benar bunyi sekian detik
const COUNT_AFTER_SECONDS = 1;
const LIMIT_MESSAGE = "Batas pemutaran audio habis";

// mode "check"  : cuma cek masih ada jatah (tidak menghitung)
// mode "commit" : catat 1 pemutaran
async function callAudioApi(
  sessionId: string,
  questionId: string,
  mode: "check" | "commit",
) {
  const res = await fetch("/api/tryout/audio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, questionId, mode }),
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || "Gagal memutar audio");
  }

  return result as { playCount: number };
}

export default function AudioPlayer({
  audio,
  sessionId,
  questionId,
  playLimit,
  initialPlayCount = 0,
  onEnded,
  autoPlay,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔥 PREVENT MULTIPLE AUTOPLAY
  const hasAutoPlayed = useRef(false);

  // 🔥 pemutaran yang sedang berjalan sudah dicatat ke server atau belum
  const countedRef = useRef(false);

  // 🔥 soal yang sedang aktif (buat membuang hasil async yang sudah basi)
  const currentQuestionRef = useRef(questionId);
  currentQuestionRef.current = questionId;

  // 🔥 onEnded dari parent selalu berganti tiap render, simpan di ref
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const [loading, setLoading] = useState(false);

  const [playing, setPlaying] = useState(false);

  const [playCount, setPlayCount] = useState(initialPlayCount);

  const prevQuestionId = useRef(questionId);

  useEffect(() => {
    if (prevQuestionId.current !== questionId) {
      prevQuestionId.current = questionId;
      hasAutoPlayed.current = false;
      countedRef.current = false;
      audioRef.current?.pause();
      setPlaying(false);
      setLoading(false);
      setPlayCount(initialPlayCount);
    }
  }, [questionId, initialPlayCount]);

  // 🔥 REMAINING PLAY
  const remaining =
    playLimit != null ? Math.max(0, playLimit - playCount) : null;

  // 🔥 DISABLED
  const isDisabled = playLimit != null && playCount >= playLimit;

  // 🔥 jatah sudah habis (misal dari tab lain): tandai habis dan buka kunci
  const markExhausted = useCallback(() => {
    if (playLimit != null) setPlayCount(playLimit);
    onEndedRef.current?.();
  }, [playLimit]);

  // 🔥 CATAT PEMUTARAN: dipanggil setelah audio benar-benar bunyi
  const commitPlay = useCallback(async () => {
    if (countedRef.current) return;
    countedRef.current = true;

    const qid = questionId;

    try {
      const result = await callAudioApi(sessionId, qid, "commit");

      if (currentQuestionRef.current === qid) {
        setPlayCount(result.playCount);
      }
    } catch (error: any) {
      if (currentQuestionRef.current !== qid) return;

      if (error?.message === LIMIT_MESSAGE) {
        // jatah ternyata sudah habis dari tab/perangkat lain
        audioRef.current?.pause();
        setPlaying(false);
        toast.error(LIMIT_MESSAGE);
        markExhausted();
      } else {
        // gagal mencatat (jaringan): audio tetap jalan, catat sementara di layar
        setPlayCount((c) => c + 1);
      }
    }
  }, [sessionId, questionId, markExhausted]);

  // 🔥 PLAY AUDIO
  const handlePlay = useCallback(async () => {
    // 🔥 BLOCK LIMIT + PREVENT DOUBLE REQUEST
    if (isDisabled || playing || loading) return;

    const audioEl = audioRef.current;
    if (!audioEl) return;

    const qid = questionId;
    setLoading(true);

    try {
      // 1) CEK jatah ke server (belum menghitung apa-apa)
      try {
        await callAudioApi(sessionId, qid, "check");
      } catch (error: any) {
        if (currentQuestionRef.current !== qid) return;

        if (error?.message === LIMIT_MESSAGE) {
          markExhausted();
        } else {
          toast.error(error?.message || "Gagal memutar audio");
        }
        return;
      }

      if (currentQuestionRef.current !== qid) return;

      // 2) PUTAR. Kalau gagal (autoplay diblokir, file rusak), jatah TIDAK terpakai
      audioEl.pause();
      audioEl.currentTime = 0;
      countedRef.current = false;

      try {
        await audioEl.play();
      } catch (error: any) {
        if (currentQuestionRef.current !== qid) return;

        if (error?.name === "NotAllowedError") {
          toast.error(
            "Browser memblokir pemutaran otomatis. Klik Play Audio untuk memulai.",
          );
        } else if (error?.name !== "AbortError") {
          toast.error("Gagal memutar audio. Coba klik Play Audio lagi.");
        }
        return;
      }

      if (currentQuestionRef.current !== qid) return;

      setPlaying(true);
    } finally {
      if (currentQuestionRef.current === qid) setLoading(false);
    }
  }, [isDisabled, playing, loading, sessionId, questionId, markExhausted]);

  // 🔥 AUTO PLAY ONLY ONCE PER QUESTION
  useEffect(() => {
    if (autoPlay && !hasAutoPlayed.current && !isDisabled) {
      hasAutoPlayed.current = true;

      handlePlay();
    }
  }, [autoPlay, isDisabled, handlePlay]);

  return (
    <div className="border rounded-2xl p-4 bg-gray-50">
      {/* AUDIO */}
      <audio
        ref={audioRef}
        src={audio}
        onTimeUpdate={() => {
          const el = audioRef.current;

          if (
            el &&
            !countedRef.current &&
            el.currentTime >= COUNT_AFTER_SECONDS
          ) {
            commitPlay();
          }
        }}
        onEnded={() => {
          setPlaying(false);

          // audio yang lebih pendek dari ambang tetap dihitung
          if (!countedRef.current) commitPlay();

          onEndedRef.current?.();
        }}
        onError={() => {
          // file audio gagal dimuat: jatah tidak terpakai, buka kunci supaya tidak macet
          setPlaying(false);
          setLoading(false);
          toast.error(
            "Audio gagal dimuat. Kamu bisa lanjut ke soal berikutnya.",
          );
          onEndedRef.current?.();
        }}
      />

      <div className="flex items-center justify-between gap-4">
        {/* INFO */}
        <div>
          <p className="font-semibold text-sm text-gray-700">Audio Listening</p>

          {playLimit != null && (
            <p className="text-xs text-gray-500 mt-1">
              Sisa pemutaran: {remaining}
            </p>
          )}
        </div>

        {/* BUTTON */}
        <button
          onClick={handlePlay}
          disabled={loading || playing || isDisabled}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-2 rounded-xl text-sm font-medium transition"
        >
          {loading
            ? "Loading..."
            : playing
              ? "Diputar..."
              : isDisabled
                ? "Batas Habis"
                : "Play Audio"}
        </button>
      </div>
    </div>
  );
}
