"use client";

import { ExamQuestion } from "@/types/exam";

type Props = {
  questions: ExamQuestion[];

  currentQuestionIndex: number;

  answers: Record<string, string>;

  onSelect: (index: number) => void;

  markedQuestions: string[];

  disabled?: boolean;
};

export default function NavigationSidebar({
  questions,
  currentQuestionIndex,
  answers,
  markedQuestions,
  disabled,
  onSelect,
}: Props) {
  const answeredCount = questions.filter((q) => answers[q.id]).length;

  const unansweredCount = questions.length - answeredCount;

  const markedCount = markedQuestions.length;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
      {/* TITLE */}
      <h2 className="font-semibold text-gray-700 mb-4">Navigasi Soal</h2>

      {/* STATISTIK */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-green-50 border border-green-200 rounded-xl p-2 text-center">
          <p className="text-xs text-gray-500">Answered</p>

          <p className="font-bold text-green-600">{answeredCount}</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-2 text-center">
          <p className="text-xs text-gray-500">Empty</p>

          <p className="font-bold text-red-500">{unansweredCount}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-2 text-center">
          <p className="text-xs text-gray-500">Marked</p>

          <p className="font-bold text-yellow-600">{markedCount}</p>
        </div>
      </div>

      {/* LEGEND */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-600 pb-5 mb-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-blue-600 shrink-0" />
          <span>Soal Aktif</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-green-500 shrink-0" />
          <span>Sudah Dijawab</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-yellow-400 shrink-0" />
          <span>Marked Review</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded border border-gray-300 bg-white shrink-0" />
          <span>Belum Dijawab</span>
        </div>
      </div>

      {/* QUESTION BUTTON */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, index) => {
          const isActive = currentQuestionIndex === index;

          const isAnswered = !!answers[q.id];

          const isMarked = markedQuestions.includes(q.id);

          return (
            <button
              key={q.id}
              disabled={disabled}
              onClick={() => onSelect(index)}
              className={`
          h-11 rounded-xl text-sm font-semibold transition-all border

          ${
            isActive
              ? "bg-blue-600 border-blue-600 text-white shadow-md scale-[1.03]"
              : isMarked
                ? "bg-yellow-400 border-yellow-400 text-black"
                : isAnswered
                  ? "bg-green-500 border-green-500 text-white"
                  : "bg-white border-gray-300 hover:border-gray-400"
          }

          disabled:opacity-50
          disabled:cursor-not-allowed
        `}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
