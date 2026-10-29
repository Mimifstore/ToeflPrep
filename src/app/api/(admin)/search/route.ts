import { NextResponse } from "next/server";
import { checkUserRateLimit, requireAdmin } from "@/libs/api-auth";
import { normalizeQuery } from "@/libs/admin-search-utils";
import { searchAdminData } from "@/service/admin-search.service";
import type { AdminSearchResponse } from "@/types/admin-search";

// GET /api/search?q=kata+kunci
export async function GET(req: Request) {
  const { error, session } = await requireAdmin();
  if (error || !session) {
    return error ?? NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Search dipanggil sambil mengetik (sudah di-debounce di client), jadi limitnya agak longgar.
  const limited = checkUserRateLimit(session.user.id, {
    limit: 120,
    windowMs: 60_000,
    prefix: "admin-search",
  });
  if (limited.error) return limited.error;

  try {
    const query = normalizeQuery(new URL(req.url).searchParams.get("q") ?? "");
    const items = await searchAdminData(query);
    const body: AdminSearchResponse = { query, items };

    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("ADMIN SEARCH ERROR:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
