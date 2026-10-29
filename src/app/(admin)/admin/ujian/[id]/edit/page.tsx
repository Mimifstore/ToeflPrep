import CreateUjianForm from "@/components/dashboardAdmin/ujian/CreateUjianForm";
import { prisma } from "@/libs/prisma";
import { notFound } from "next/navigation";

export default async function Page({ params }: any) {
  const data = await prisma.ujian.findUnique({
    where: { id: params.id },
    include: {
      program: true,
      questionBank: true,
    },
  });

  if (!data) return notFound();

  return (
    <div className="p-6">
      <CreateUjianForm initialData={data} isEdit />
    </div>
  );
}