"use client";

import { ExamQuestion } from "@/types/exam";
import AudioPlayer from "@/components/Ui/AudioPlayer";
import { Loader2, Flag, FileText } from "lucide-react";

type Props = {
  sessionId: string;
  question: ExamQuestion;
  selectedAnswer?: string;

  onAnswer: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;

  saving?: boolean;

  marked?: boolean;
  onMark: () => void;

  showQuestionNumber?: boolean;
  showPrevNextButton?: boolean;

  audioFinished?: boolean;
  onAudioEnded?: () => void;

  isListeningSection?: boolean;
  isLastQuestion?: boolean;

  onShowDirection?: () => void;

  canProceed?: boolean;
};

export default function QuestionScreen({
  sessionId,
  question,
  saving,
  selectedAnswer,
  marked,
  showQuestionNumber,
  showPrevNextButton,
  isListeningSection,
  audioFinished,
  isLastQuestion,
  onAnswer,
  onNext,
  onPrev,
  onMark,
  onAudioEnded,
  onShowDirection,
  canProceed,
}: Props) {
  // Listening: Next terkunci sampai audio selesai (atau jatah putar sudah habis)
  const listeningLocked = Boolean(
    isListeningSection && question.audio && !(canProceed ?? audioFinished),
  );

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-5 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-wrap gap-4 items-start justify-between border-b border-gray-100 pb-5 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {showQuestionNumber ? `Question ${question.order}` : "Question"}
          </h2>

          <p className="text-xs text-gray-400 mt-1">
            Pilih jawaban yang paling benar
          </p>
        </div>

        {question.passageDirection && onShowDirection && (
          <button
            type="button"
            onClick={onShowDirection}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Lihat petunjuk
          </button>
        )}
      </div>

      {/* AUDIO */}
      {question.audio && (
        <div className="mb-6">
          <AudioPlayer
            audio={question.audio}
            sessionId={sessionId}
            questionId={question.id}
            playLimit={question.audioPlayLimit}
            initialPlayCount={question.playCount || 0}
            autoPlay={isListeningSection}
            onEnded={onAudioEnded}
          />
        </div>
      )}

      {/* IMAGE */}
      {question.image && (
        <div className="mb-6 flex justify-center">
          <img
            src={question.image}
            alt="Question"
            className="rounded-2xl border max-h-[320px] object-contain"
          />
        </div>
      )}

      {/* HINT LISTENING */}
      {listeningLocked && (
        <p className="mb-6 text-xs text-blue-600">
          Kamu bisa membaca pilihan jawaban sambil mendengarkan. Tombol Next
          aktif setelah audio selesai.
        </p>
      )}

      {/* QUESTION */}
      <div
        className="prose prose-sm lg:prose-base max-w-none mb-10 text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: question.question,
        }}
      />

      {/* OPTIONS */}
      {question.options.length > 0 && (
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const optionValue = String.fromCharCode(65 + index);
            const isSelected = selectedAnswer === optionValue;

            return (
              <button
                key={option.id}
                onClick={() => onAnswer(optionValue)}
                className={`w-full text-left border rounded-2xl px-5 py-4 transition-all duration-200
                  ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 shadow-md scale-[1.01]"
                      : "border-gray-200 hover:border-gray-400 hover:shadow-sm bg-white"
                  }`}
              >
                <div className="flex gap-3 items-start">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-all
                      ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 text-gray-500 bg-gray-50"
                      }`}
                  >
                    {saving && isSelected ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      optionValue
                    )}
                  </div>

                  <div
                    className="flex-1 text-sm text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: option.text,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ACTION */}
      {showPrevNextButton && (
        <div className="flex flex-wrap gap-4 justify-between mt-12 border-t border-gray-100 pt-6">
          <button
            onClick={onPrev}
            disabled={Boolean(isListeningSection)}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-100"
          >
            Previous
          </button>

          <div className="flex gap-3">
            {/* MARK */}
            <button
              onClick={onMark}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors
                ${
                  marked
                    ? "bg-amber-400 text-white border-amber-400"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
              <Flag className="w-4 h-4" />
              {marked ? "Ditandai" : "Tandai"}
            </button>

            {/* NEXT / SELESAI */}
            <button
              onClick={onNext}
              disabled={listeningLocked}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                ${
                  isLastQuestion
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
            >
              {isLastQuestion ? "Selesai Ujian" : "Next"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
