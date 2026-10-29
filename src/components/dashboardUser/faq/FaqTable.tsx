"use client";

import { Card } from "@/components/Ui/Card";
import { Home, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

export default function FaqTable({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="p-4 md:p-6 shadow-md">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 ">
        <span className="text-lg font-semibold text-gray-600">FAQ</span>

        <span className="hidden md:flex items-center gap-2 text-gray-400">
          <ChevronRight className="w-4 h-4" />
          <Link href="/user" className="flex items-center gap-1 text-blue-600 hover:underline">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-700 font-medium">Data FAQ</span>
        </span>
      </div>

      {/* Card */}
      <Card className="p-4 border border-gray-100">
        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.id || index}
                className={`border rounded-xl transition-colors duration-200 ${
                  isOpen
                    ? "border-blue-200"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                {/* HEADER */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex justify-between items-center px-4 py-3 text-left"
                >
                  <span className="text-sm md:text-[15px] font-medium text-gray-800 leading-relaxed">
                    {faq.question}
                  </span>

                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-blue-600" : "text-gray-400"
                    }`}
                  />
                </button>

                {/* CONTENT */}
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                      <div
                        className="prose max-w-none break-words [&_*]:max-w-full [&_*]:break-words pt-2"
                        dangerouslySetInnerHTML={{
                          __html: faq.answer,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {faqs.length === 0 && (
            <div className="p-6 text-center text-gray-400 text-sm border border-gray-100 rounded-xl">
              Data FAQ belum tersedia
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}