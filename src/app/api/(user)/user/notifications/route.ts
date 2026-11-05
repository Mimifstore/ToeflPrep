import { NextResponse } from "next/server";
import { z } from "zod";
import { checkUserRateLimit, requireAuth } from "@/libs/api-auth";
import {
  countUnread,
  listNotifications,
  markAllAsRead,
  markAsRead,
} from "@/service/notification.service";
import type { NotificationListResponse } from "@/types/notification";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_CURSOR_LENGTH = 64;

// Tandai dibaca: sebagian (`ids`) atau semuanya (`all`).
const markReadSchema = z.union([
  z.object({ all: z.literal(true) }),
  z.object({ ids: z.array(z.string().min(1).max(MAX_CURSOR_LENGTH)).min(1).max(MAX_LIMIT) }),
]);

// GET /api/user/notifications?limit=20&cursor=<id>
export async function GET(req: Request) {
  const { error, session } = await requireAuth();
  if (error || !session) {
    return error ?? NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const limited = checkUserRateLimit(session.user.id, {
    limit: 60,
    windowMs: 60_000,
    prefix: "user-notifications",
  });
  if (limited.error) return limited.error;

  try {
    const { searchParams } = new URL(req.url);
    const requested = Number(searchParams.get("limit"));
    const limit = Number.isInteger(requested) && requested > 0
      ? Math.min(requested, MAX_LIMIT)
      : DEFAULT_LIMIT;
    const rawCursor = searchParams.get("cursor");
    const cursor = rawCursor && rawCursor.length <= MAX_CURSOR_LENGTH ? rawCursor : null;

    const [{ items, nextCursor }, unreadCount] = await Promise.all([
      listNotifications(session.user.id, { limit, cursor }),
      countUnread(session.user.id),
    ]);
    const body: NotificationListResponse = { items, nextCursor, unreadCount };

    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/user/notifications  { ids: [...] } atau { all: true }
export async function PATCH(req: Request) {
  const { error, session } = await requireAuth();
  if (error || !session) {
    return error ?? NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const limited = checkUserRateLimit(session.user.id, {
    limit: 60,
    windowMs: 60_000,
    prefix: "user-notifications-read",
  });
  if (limited.error) return limited.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  const validated = markReadSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ message: "Input tidak valid" }, { status: 400 });
  }

  try {
    if ("all" in validated.data) await markAllAsRead(session.user.id);
    else await markAsRead(session.user.id, validated.data.ids);

    const unreadCount = await countUnread(session.user.id);
    return NextResponse.json({ unreadCount }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("MARK NOTIFICATIONS READ ERROR:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
