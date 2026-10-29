import { NextResponse } from "next/server";
import { requireAdmin } from "@/libs/api-auth";
import { supabaseAdmin } from "@/libs/supabase-admin";

const ALLOWED = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/x-m4a",
  "audio/mp4",
];
const MAX = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { fileName, contentType, size } = await req.json();
  if (!ALLOWED.includes(contentType))
    return NextResponse.json(
      { error: "Format tidak didukung" },
      { status: 400 },
    );
  if (typeof size !== "number" || size > MAX)
    return NextResponse.json({ error: "Maksimal 10MB" }, { status: 400 });

  const ext =
    String(fileName)
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "mp3";
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { data, error: signError } = await supabaseAdmin.storage
    .from("audio")
    .createSignedUploadUrl(path);
  if (signError)
    return NextResponse.json({ error: signError.message }, { status: 500 });

  const { data: pub } = supabaseAdmin.storage.from("audio").getPublicUrl(path);
  return NextResponse.json({
    path,
    token: data.token,
    publicUrl: pub.publicUrl,
  });
}
