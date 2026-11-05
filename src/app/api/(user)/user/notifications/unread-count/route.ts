import { NextResponse } from "next/server";
import { checkUserRateLimit, requireAuth } from "@/libs/api-auth";
import { countUnread } from "@/service/notification.service";

export const dynamic = "force-dynamic";

// GET /api/user/notifications/unread-count — ringan, dipanggil berkala oleh ikon lonceng.
export async function GET() {
  const { error, session } = await requireAuth();
  if (error || !session) {
    return error ?? NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const limited = checkUserRateLimit(session.user.id, {
    limit: 120,
    windowMs: 60_000,
    prefix: "user-notifications-count",
  });
  if (limited.error) return limited.error;

  try {
    const unreadCount = await countUnread(session.user.id);
    return NextResponse.json({ unreadCount }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("COUNT NOTIFICATIONS ERROR:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
