import { NextResponse } from "next/server";
import { checkUserRateLimit, requireAuth } from "@/libs/api-auth";
import { normalizeQuery } from "@/libs/admin-search-utils";
import { searchUserData } from "@/service/user-search.service";
import type { UserSearchResponse } from "@/types/user-search";

export const dynamic = "force-dynamic";

// GET /api/user/search?q=kata+kunci
export async function GET(req: Request) {
  const { error, session } = await requireAuth();
  if (error || !session) {
    return error ?? NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Search dipanggil sambil mengetik (sudah di-debounce di client), jadi limitnya agak longgar.
  const limited = checkUserRateLimit(session.user.id, {
    limit: 120,
    windowMs: 60_000,
    prefix: "user-search",
  });
  if (limited.error) return limited.error;

  try {
    const query = normalizeQuery(new URL(req.url).searchParams.get("q") ?? "");
    const items = await searchUserData(session.user.id, query);
    const body: UserSearchResponse = { query, items };

    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("USER SEARCH ERROR:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
