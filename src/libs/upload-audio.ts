import { supabase } from "@/libs/supabase";

const ALLOWED = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/x-m4a",
  "audio/mp4",
];
const MAX = 10 * 1024 * 1024;

export async function uploadAudio(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type))
    throw new Error("Format audio tidak didukung");
  if (file.size > MAX) throw new Error("Ukuran audio maksimal 10MB");

  const signRes = await fetch("/api/audio/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });
  if (!signRes.ok) {
    const err = await signRes.json().catch(() => ({}));
    throw new Error(
      err.error || err.message || `Gagal minta izin upload (${signRes.status})`,
    );
  }
  const { path, token, publicUrl } = await signRes.json();

  const { error } = await supabase.storage
    .from("audio")
    .uploadToSignedUrl(path, token, file, {
      contentType: file.type,
      cacheControl: "3600",
    });
  if (error) throw error;

  return publicUrl;
}
