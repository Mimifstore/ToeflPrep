import { prisma } from "@/libs/prisma";
import { supabaseAdmin } from "@/libs/supabase-admin";

const MARKER = "/object/public/audio/";

function getAudioPath(url: string): string | null {
  const i = url.indexOf(MARKER);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + MARKER.length).split("?")[0]);
}

// Hapus file audio dari bucket, tapi hanya yang tidak dipakai soal lain.
// Panggil SETELAH database berhasil diubah.
export async function deleteAudioIfUnused(urls: (string | null | undefined)[]) {
  const unique = [...new Set(urls.filter((u): u is string => !!u))];
  if (unique.length === 0) return;

  const stillUsed = await prisma.question.findMany({
    where: { audioUrl: { in: unique } },
    select: { audioUrl: true },
  });
  const usedSet = new Set(stillUsed.map((q) => q.audioUrl));

  const paths = unique
    .filter((u) => !usedSet.has(u))
    .map(getAudioPath)
    .filter((p): p is string => !!p);
  if (paths.length === 0) return;

  const { error } = await supabaseAdmin.storage.from("audio").remove(paths);
  if (error) console.error("DELETE AUDIO FILES ERROR:", error);
}
