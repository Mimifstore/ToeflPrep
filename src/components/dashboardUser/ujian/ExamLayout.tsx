"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { ExamSessionResponse } from "@/types/exam";
import { useExamTimer } from "@/hooks/useExamTimer";
import ExamHeader from "./ExamHeader";
import NavigationSidebar from "./NavigationSidebar";
import QuestionScreen from "./QuestionScreen";
import { useAnswerSaver } from "@/hooks/useAnswerSaver";
import DirectionScreen from "./DirectionScreen";
import SectionStartScreen from "./SectionStartScreen";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import SubmitProgress from "./SubmitProgress";

type Props = {
  data: ExamSessionResponse;
};

export default function ExamLayout({ data }: Props) {
  const router = useRouter();

  // FLAT ALL QUESTIONS
  const allQuestions = useMemo(() => {
    return data.sections.flatMap((section) =>
      section.questions.filter((q) => q.type !== "DIRECTION"),
    );
  }, [data]);

  // STATES
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [continuingSection, setContinuingSection] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(() =>
    Math.min(data.currentSection, data.sections.length - 1),
  );
  const [sectionStarted, setSectionStarted] = useState(data.currentSection > 0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>(() =>
    Array.from({ length: data.currentSection }, (_, i) => i),
  );
  const [markedQuestions, setMarkedQuestions] = useState<string[]>([]);
  const [showSectionComplete, setShowSectionComplete] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [audioFinished, setAudioFinished] = useState(false);
  const [tabWarning, setTabWarning] = useState(data.tabWarning ?? 0);
  const [showDirectionModal, setShowDirectionModal] = useState(false);

  // Blok soal yang halaman petunjuknya sudah dibaca (id soal pertama di blok).
  // Kalau halaman di-refresh, blok yang sudah ada jawabannya dianggap sudah dibaca.
  const [seenDirections, setSeenDirections] = useState<string[]>(() => {
    const seen: string[] = [];
    data.sections.forEach((section) => {
      const block = { startId: null as string | null, answered: false };
      const close = () => {
        if (block.startId && block.answered) seen.push(block.startId);
      };
      section.questions.forEach((q) => {
        if (q.directionBefore) {
          close();
          block.startId = q.id;
          block.answered = false;
        }
        if (q.answer) block.answered = true;
      });
      close();
    });
    return seen;
  });

  // ACTIVE SECTION
  const activeSection = data.sections[activeSectionIndex];

  const currentQuestions = (activeSection?.questions || []).filter(
    (q) => q.type !== "DIRECTION",
  );
  const currentQuestion = currentQuestions[currentQuestionIndex];
  // HALAMAN PETUNJUK: muncul sekali per blok, sebelum soal pertama di blok itu
  let blockStartIndex = -1;
  for (let i = currentQuestionIndex; i >= 0; i--) {
    if (currentQuestions[i]?.directionBefore) {
      blockStartIndex = i;
      break;
    }
  }
  const blockStart =
    blockStartIndex >= 0 ? currentQuestions[blockStartIndex] : null;
  const pendingDirection =
    sectionStarted && blockStart && !seenDirections.includes(blockStart.id)
      ? (blockStart.directionBefore ?? null)
      : null;

  const isListeningSection = activeSection?.title
    ?.toLowerCase()
    .includes("listening");

  const canProceed =
    audioFinished ||
    !currentQuestion?.audio ||
    (currentQuestion?.audioPlayLimit != null &&
      (currentQuestion?.playCount ?? 0) >= currentQuestion?.audioPlayLimit);

  // detect last question of last section
  const isLastSection = activeSectionIndex === data.sections.length - 1;
  const isLastQuestion =
    isLastSection && currentQuestionIndex === currentQuestions.length - 1;

  // ANSWERS
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const mapped: Record<string, string> = {};
    allQuestions.forEach((q) => {
      if (q.answer) mapped[q.id] = q.answer;
    });
    return mapped;
  });

  const unansweredCount = allQuestions.filter((q) => !answers[q.id]).length;

  // AUTO SAVE
  const { saveAnswer, savingQuestionId, flush } = useAnswerSaver({
    sessionId: data.id,
  });

  // TIMER
  const { formatted, timeLeft } = useExamTimer(data.remainingTime);

  // SAVE WARNING KE DB
  // SAVE WARNING KE DB
  const saveWarning = useCallback(
    async (type: "TAB" | "FULLSCREEN") => {
      try {
        const res = await fetch("/api/exam-session/warning", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: data.id, type }),
        });
        const response = await res.json();

        // 🔥 BARU — kalau server bilang batas exit attempts udah kelewat,
        // ujian otomatis diselesaikan (sudah di-grade di server), redirect ke hasil.
        if (response.forceSubmit) {
          toast.error(
            "Batas maksimal keluar dari ujian terlampaui. Ujian otomatis diselesaikan.",
          );
          router.push(`/user/tryout/result/${response.resultId}`);
        }
      } catch {
        // silent fail
      }
    },
    [data.id, router],
  );
  // TAB VISIBILITY DETECTION

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        toast.error("Terdeteksi berpindah tab/browser");
        setTabWarning((prev) => prev + 1);
        saveWarning("TAB");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [saveWarning]);

  const [fullscreenWarning, setFullscreenWarning] = useState(
    data.fullscreenWarning ?? 0,
  );

  useEffect(() => {
    const handleFullscreenChange = () => {
      // Cuma dianggap "keluar" kalau ujian udah dimulai (sectionStarted)
      if (!document.fullscreenElement && sectionStarted && !submitting) {
        toast.error("Terdeteksi keluar dari mode layar penuh");
        setFullscreenWarning((prev) => prev + 1);
        saveWarning("FULLSCREEN");
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [saveWarning, sectionStarted, submitting]);

  // RESET AUDIO SETIAP GANTI SOAL
  useEffect(() => {
    setAudioFinished(false);
  }, [currentQuestion?.id]);

  // SUBMIT
  const isSubmittingRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSubmitting(true);

    try {

      await flush();

      const res = await fetch("/api/tryout/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: data.id }),
      });
      const response = await res.json();
      if (!res.ok) throw new Error(response.message || "Submit gagal");

      const resultUrl = `/user/tryout/result/${response.result.resultId}`;
      router.prefetch(resultUrl);

      setSubmitDone(true);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setTimeout(() => router.push(resultUrl), 400);
    } catch (error: any) {
      toast.error(error.message || "Gagal submit ujian");
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  }, [router, data.id, flush]);

  // LANJUT SECTION BERIKUTNYA
   const handleContinueSection = useCallback(async () => {
    setContinuingSection(true);
    try {
      // kirim dulu semua jawaban section ini; setelah pindah, server menolak jawabannya
      await flush();

      const res = await fetch("/api/tryout/next-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: data.id,
          // section yang sedang dikerjakan: klik ganda tidak melompati section berikutnya
          fromSection: activeSectionIndex,
        }),
      });

      if (!res.ok) {
        toast.error("Gagal lanjut section");
        setContinuingSection(false);
        return;
      }

      window.location.reload();
    } catch {
      toast.error("Gagal lanjut section");
      setContinuingSection(false);
    }
  }, [data.id, activeSectionIndex, flush]);

  // AUTO NEXT SECTION / SUBMIT SAAT WAKTU HABIS
  useEffect(() => {
    if (timeLeft === null || timeLeft !== 0 || submitting) return;

    const hasNextSection = !!data.sections[activeSectionIndex + 1];

    if (hasNextSection) {
      handleContinueSection();
    } else {
      handleSubmit();
    }
  }, [
    timeLeft,
    submitting,
    activeSectionIndex,
    data.sections,
    handleContinueSection,
    handleSubmit,
  ]);

  // START SECTION
  const handleStartSection = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    }
    setSectionStarted(true);
    setCurrentQuestionIndex(0);
  };
  // PELANGGARAN KELUAR UJIAN (tab + layar penuh) dan batas dari admin
  const exitCount = tabWarning + fullscreenWarning;
  const maxExit = data.ujian.maxExitAttempts ?? 0;

  // LANJUT DARI HALAMAN PETUNJUK
  const handleContinueDirection = () => {
    if (!blockStart) return;
    setSeenDirections((prev) =>
      prev.includes(blockStart.id) ? prev : [...prev, blockStart.id],
    );
  };

  // ANSWER
  const handleAnswer = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
    saveAnswer({ questionId: currentQuestion.id, answer: optionId });

    if (data.ujian.autoNextQuestion) {
      const hasNext = !!currentQuestions[currentQuestionIndex + 1];
      if (hasNext && (!isListeningSection || canProceed)) {
        setTimeout(() => setCurrentQuestionIndex((prev) => prev + 1), 400);
      }
    }
  };

  // MARK
  const handleMarkQuestion = () => {
    setMarkedQuestions((prev) =>
      prev.includes(currentQuestion.id)
        ? prev.filter((id) => id !== currentQuestion.id)
        : [...prev, currentQuestion.id],
    );
  };

  // NEXT
  const handleNext = () => {
    if (isListeningSection && !canProceed) {
      toast.error("Selesaikan audio terlebih dahulu");
      return;
    }

    if (currentQuestions[currentQuestionIndex + 1]) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }

    if (data.sections[activeSectionIndex + 1]) {
      setShowSectionComplete(true);
      return;
    }

    // soal terakhir section terakhir → langsung buka modal konfirmasi
    setShowSubmitModal(true);
  };

  // PREV
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // SAFETY
  if (!currentQuestion && sectionStarted) return null;
  if (!activeSection) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <ExamHeader
        title={data.ujian.title}
        timer={formatted}
        sectionTitle={activeSection.title}
        sectionNumber={activeSectionIndex + 1}
        totalSections={data.sections.length}
      />

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* MAIN SCREEN */}
        {showSectionComplete ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Section Selesai
            </h2>
            <p className="text-sm text-gray-500 mb-8">
              Kamu telah menyelesaikan section ini. Klik lanjut untuk
              melanjutkan ke section berikutnya.
            </p>
            <button
              onClick={handleContinueSection}
              disabled={continuingSection}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              {continuingSection ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memuat section...
                </>
              ) : (
                "Lanjut Section Berikutnya"
              )}
            </button>
          </div>
        ) : !sectionStarted ? (
          <SectionStartScreen
            title={activeSection.title}
            onStart={handleStartSection}
          />
        ) : pendingDirection ? (
          <DirectionScreen
            title={activeSection.title}
            direction={pendingDirection}
            onContinue={handleContinueDirection}
          />
        ) : (
          <QuestionScreen
            question={currentQuestion}
            selectedAnswer={answers[currentQuestion.id]}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrev={handlePrev}
            saving={savingQuestionId === currentQuestion.id}
            marked={markedQuestions.includes(currentQuestion.id)}
            onMark={handleMarkQuestion}
            sessionId={data.id}
            showQuestionNumber={data.ujian.showQuestionNumber}
            showPrevNextButton={data.ujian.showPrevNextButton}
            audioFinished={audioFinished}
            onAudioEnded={() => setAudioFinished(true)}
            isListeningSection={isListeningSection}
            isLastQuestion={isLastQuestion}
            onShowDirection={() => setShowDirectionModal(true)}
            canProceed={canProceed}
          />
        )}

        {/* SIDEBAR */}
        <div className="space-y-4 pb-4 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
          {/* NAVIGASI NOMOR SOAL */}
          {data.ujian.showNavigation && (
            <NavigationSidebar
              questions={currentQuestions}
              currentQuestionIndex={currentQuestionIndex}
              answers={answers}
              onSelect={setCurrentQuestionIndex}
              markedQuestions={markedQuestions}
              disabled={!!(isListeningSection && !canProceed)}
            />
          )}

          {/* PINDAH TAB / KELUAR LAYAR PENUH */}
          {exitCount > 0 || maxExit > 0 ? (
            <p
              className={`px-1 text-xs ${
                maxExit > 0 && exitCount >= maxExit - 1
                  ? "text-red-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              Pindah tab / keluar layar penuh:{" "}
              <span className="font-semibold">
                {exitCount}
                {maxExit > 0 ? ` dari ${maxExit}` : "x"}
              </span>
              {maxExit > 0 && " (ujian otomatis selesai jika batas tercapai)"}
            </p>
          ) : null}

          {/* SUBMIT */}
          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={submitting}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Selesai Ujian"}
          </button>
        </div>
      </div>

      {/* KONFIRMASI SELESAI + PROGRES SUBMIT */}
      {(showSubmitModal || submitting || submitDone) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-2xl w-full max-w-sm p-6 text-center"
          >
            {submitting || submitDone ? (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-center py-4"
              >
                <SubmitProgress done={submitDone} />
                <p className="mt-5 text-base font-semibold text-gray-900">
                  {submitDone ? "Ujian selesai" : "Menyimpan jawaban..."}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {submitDone
                    ? "Mengalihkan ke halaman hasil..."
                    : "Mohon tunggu sebentar"}
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-900">
                  Selesaikan ujian?
                </h2>
                <p
                  className={`mt-1.5 text-sm ${
                    unansweredCount > 0 ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {unansweredCount > 0
                    ? `Masih ada ${unansweredCount} soal yang belum dijawab.`
                    : "Semua soal sudah dijawab."}
                </p>

                <div className="flex gap-2.5 mt-6">
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Tidak
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
                  >
                    Ya
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL LIHAT PETUNJUK */}
      {showDirectionModal && currentQuestion?.passageDirection && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDirectionModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-5 pb-3 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Petunjuk
              </h2>
            </div>
            <div
              className="px-6 py-4 overflow-y-auto prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: currentQuestion.passageDirection,
              }}
            />
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowDirectionModal(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTINUE SECTION OVERLAY */}
      {continuingSection && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl px-8 py-6 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-gray-700">
              Memuat section berikutnya...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
