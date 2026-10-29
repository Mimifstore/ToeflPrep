import ProgramForm from "@/components/dashboardAdmin/masterData/program/ProgramForm";

type SearchParams = { id?: string | string[] };

type Props = {
  searchParams: Promise<SearchParams> | SearchParams;
};

export default async function CreateProgramPage({ searchParams }: Props) {
  const { id: rawId } = await searchParams;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  // key: supaya form ter-reset kalau pindah dari mode edit ke tambah (atau antar kategori)
  return id ? (
    <ProgramForm key={id} mode="edit" programId={id} />
  ) : (
    <ProgramForm key="new" mode="create" />
  );
}