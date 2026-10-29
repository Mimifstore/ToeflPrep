"use client";

import { useParams } from "next/navigation";
import ProgramForm from "@/components/dashboardAdmin/masterData/program/ProgramForm";

export default function EditProgramPage() {
  const { id } = useParams();
  return <ProgramForm mode="edit" programId={id as string} />;
}