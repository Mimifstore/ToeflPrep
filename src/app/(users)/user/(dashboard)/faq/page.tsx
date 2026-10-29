"use client";

import { useEffect, useState } from "react";
import FaqTable from "@/components/dashboardUser/faq/FaqTable";

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/faq");
      const result = await res.json();

      setFaqs(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Gagal fetch FAQ:", error);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  return <FaqTable faqs={faqs} />;
}
