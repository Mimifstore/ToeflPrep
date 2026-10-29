import { supabase } from "@/libs/supabase";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX = 5 * 1024 * 1024;

export async function uploadImage(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type))
    throw new Error("Format gambar tidak didukung");
  if (file.size > MAX) throw new Error("Ukuran gambar maksimal 5MB");

  const signRes = await fetch("/api/image/sign", {
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
    throw new Error(err.error || "Gagal minta izin upload");
  }
  const { path, token, publicUrl } = await signRes.json();

  const { error } = await supabase.storage
    .from("editor")
    .uploadToSignedUrl(path, token, file, {
      contentType: file.type,
      cacheControl: "3600",
    });
  if (error) throw error;

  return publicUrl;
}
