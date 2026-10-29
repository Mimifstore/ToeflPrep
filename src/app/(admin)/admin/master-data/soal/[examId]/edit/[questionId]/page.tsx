"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CreateQuestionForm from "@/components/dashboardAdmin/masterData/soal/CreateQuestionForm";

export default function EditQuestionPage() {
  const params = useParams();
  const questionId = params.questionId as string;

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/question/${questionId}`)
      .then((res) => res.json())
      .then((res) => {
        setForm(res);
      });
  }, [questionId]);

  if (!form) {
    return <div className="p-6">Loading...</div>;
  }

  
  return (
    <CreateQuestionForm
      examId={form.examId}
      defaultValues={{
        ...form,
        categoryId: form.categoryPenilaianId,
        optionA: form.options?.find((o: any) => o.label === "A")?.text || "",
        optionB: form.options?.find((o: any) => o.label === "B")?.text || "",
        optionC: form.options?.find((o: any) => o.label === "C")?.text || "",
        optionD: form.options?.find((o: any) => o.label === "D")?.text || "",
      }}
      isEdit
      questionId={questionId}
    />
  );
}
