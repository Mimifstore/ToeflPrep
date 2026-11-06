"use client";

import { Suspense, useEffect, useState } from "react";
import FaqTable from "@/components/dashboardUser/faq/FaqTable";

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/faq");
      const result = await res.json();

      setFaqs(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Gagal fetch FAQ:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // FaqTable membaca ?faq=<id> (useSearchParams), yang wajib dibungkus Suspense.
  return (
    <Suspense fallback={null}>
      <FaqTable faqs={faqs} loading={loading} />
    </Suspense>
  );
}
