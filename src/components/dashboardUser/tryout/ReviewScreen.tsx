"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Minus, ChevronDown } from "lucide-react";
import type { ReviewData, ReviewQuestionView } from "@/service/exam/get-review.service";

type Filter = "all" | "correct" | "wrong" | "unanswered";

const STATUS: Record<
  ReviewQuestionView["status"],
  { label: string; pill: string; icon: typeof Check }
> = {
  correct: { label: "Benar", pill: "bg-emerald-50 text-emerald-700", icon: Check },
  wrong: { label: "Salah", pill: "bg-red-50 text-red-600", icon: X },
  unanswered: { label: "Tidak dijawab", pill: "bg-gray-100 text-gray-500", icon: Minus },
};

export default function ReviewScreen({ data }: { data: ReviewData }) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts: Record<Filter, number> = {
    all: data.totalQuestion,
    correct: data.correct,
    wrong: data.wrong,
    unanswered: data.unanswered,
  };

  const sections = useMemo(
    () =>
      data.sections
        .map((s) => ({
          ...s,
          questions: s.questions.filter((q) => filter === "all" || q.status === filter),
        }))
        .filter((s) => s.questions.length > 0),
    [data.sections, filter],
  );

  const chips: Array<[Filter, string]> = [
    ["all", "Semua"],
    ["wrong", "Salah"],
    ["unanswered", "Tidak dijawab"],
    ["correct", "Benar"],
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* HEADER */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8">
          <Link
            href={`/user/tryout/result/${data.resultId}`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke hasil
          </Link>
          <p className="mb-1 text-sm font-semibold text-blue-600">Pembahasan</p>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{data.examTitle}</h1>
          <p className="mt-2 text-sm text-gray-500">
            Skor kamu <span className="font-semibold text-gray-800">{data.score}</span> ·{" "}
            {data.correct} benar, {data.wrong} salah, {data.unanswered} tidak dijawab.
          </p>

          <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter soal">
            {chips.map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  filter === key
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label} <span className="opacity-70">({counts[key]})</span>
              </button>
            ))}
          </div>
        </div>

        {sections.length === 0 && (
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400">
            Tidak ada soal pada filter ini.
          </div>
        )}

        {/* SECTIONS */}
        {sections.map((section) => (
          <section key={section.id} className="space-y-4">
            <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-gray-400">
              {section.title}
            </h2>

            {section.questions.map((q) => {
              const s = STATUS[q.status];
              const Icon = s.icon;

              return (
                <article
                  key={q.id}
                  data-status={q.status}
                  className="rounded-2xl border border-gray-100 bg-white p-5 md:p-6"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-gray-500">Soal {q.number}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${s.pill}`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {s.label}
                    </span>
                  </div>

                  {q.directionBefore && (
                    <details className="group mb-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                      <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-gray-700">
                        Lihat bacaan / petunjuk
                        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <div
                        className="prose prose-sm mt-3 max-w-none"
                        dangerouslySetInnerHTML={{ __html: q.directionBefore }}
                      />
                    </details>
                  )}

                  <div
                    className="prose prose-sm mb-5 max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{ __html: q.question }}
                  />

                  <ul className="space-y-2">
                    {q.options.map((o) => {
                      const tone = o.isCorrect
                        ? "border-emerald-300 bg-emerald-50"
                        : o.isSelected
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white";
                      return (
                        <li
                          key={o.label}
                          data-correct={o.isCorrect || undefined}
                          data-selected={o.isSelected || undefined}
                          className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${tone}`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                              o.isCorrect
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : o.isSelected
                                  ? "border-red-500 bg-red-500 text-white"
                                  : "border-gray-300 bg-gray-50 text-gray-500"
                            }`}
                          >
                            {o.letter}
                          </span>
                          <div
                            className="flex-1 text-sm text-gray-700"
                            dangerouslySetInnerHTML={{ __html: o.text }}
                          />
                          {(o.isCorrect || o.isSelected) && (
                            <span
                              className={`shrink-0 text-xs font-medium ${
                                o.isCorrect ? "text-emerald-700" : "text-red-600"
                              }`}
                            >
                              {o.isCorrect && o.isSelected
                                ? "Jawabanmu · Benar"
                                : o.isCorrect
                                  ? "Jawaban benar"
                                  : "Jawabanmu"}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {q.explanation && (
                    <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Pembahasan
                      </p>
                      <div
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: q.explanation }}
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}
