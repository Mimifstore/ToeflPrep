"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Bell, BellOff, CheckCheck, Loader2, TriangleAlert } from "lucide-react";
import {
  DEFAULT_NOTIFICATION_STYLE,
  NOTIFICATION_STYLES,
  type NotificationTone,
} from "@/constants/notification";
import { useDismissable, type DismissReason } from "@/hooks/useDismissable";
import { useNotifications } from "@/hooks/useNotifications";
import { formatTimeAgo } from "@/libs/time-ago";
import type { NotificationItem, NotificationType } from "@/types/notification";

const TONE_CLASS: Record<NotificationTone, string> = {
  success: "bg-emerald-50 text-emerald-600",
  danger: "bg-rose-50 text-rose-600",
  warning: "bg-amber-50 text-amber-600",
  info: "bg-blue-50 text-blue-600",
};

/** Angka di atas ini ditampilkan sebagai "9+". */
const BADGE_CAP = 9;

type RowProps = {
  item: NotificationItem;
  onSelect: (item: NotificationItem) => void;
};

function NotificationRow({ item, onSelect }: RowProps) {
  const { icon: Icon, tone } =
    NOTIFICATION_STYLES[item.type as NotificationType] ?? DEFAULT_NOTIFICATION_STYLE;

  const content = (
    <>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TONE_CLASS[tone]}`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-sm ${
            item.read ? "font-medium text-gray-600" : "font-semibold text-gray-900"
          }`}
        >
          {item.title}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-xs text-gray-500">
          {item.message}
        </span>
        <span className="mt-1 block text-[11px] text-gray-400">
          {formatTimeAgo(item.createdAt)}
        </span>
      </span>

      {!item.read && (
        <>
          <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
          <span className="sr-only">Belum dibaca</span>
        </>
      )}
    </>
  );

  const className =
    "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none";

  return item.href ? (
    <Link href={item.href} onClick={() => onSelect(item)} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={() => onSelect(item)} className={className}>
      {content}
    </button>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    unreadCount,
    items,
    status,
    hasMore,
    loadingMore,
    loadMore,
    retry,
    markRead,
    markAllRead,
  } = useNotifications(open);

  const dismiss = useCallback((reason: DismissReason) => {
    setOpen(false);
    if (reason === "escape") buttonRef.current?.focus();
  }, []);

  useDismissable(open, rootRef, dismiss);

  const handleSelect = (item: NotificationItem) => {
    markRead(item.id);
    setOpen(false);
  };

  const hasUnread = unreadCount > 0;
  const badgeText = unreadCount > BADGE_CAP ? `${BADGE_CAP}+` : String(unreadCount);

  const showSkeleton = items.length === 0 && (status === "idle" || status === "loading");
  const showError = items.length === 0 && status === "error";
  const showEmpty = items.length === 0 && status === "ready";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={hasUnread ? `Notifikasi, ${unreadCount} belum dibaca` : "Notifikasi"}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 ${
          open ? "bg-gray-200/70" : "bg-gray-100"
        }`}
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white"
          >
            {badgeText}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifikasi"
          className="fixed inset-x-3 top-[4.25rem] z-40 flex max-h-[min(30rem,calc(100dvh-5.5rem))] flex-col overflow-hidden rounded-2xl border bg-white shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
        >
          {/* HEADER */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900">Notifikasi</h2>
              {hasUnread && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                  {unreadCount} baru
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={!hasUnread}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Tandai semua dibaca
            </button>
          </div>

          {/* DAFTAR */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
            {items.length > 0 && (
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li key={item.id}>
                    <NotificationRow item={item} onSelect={handleSelect} />
                  </li>
                ))}
              </ul>
            )}

            {hasMore && items.length > 0 && (
              <div className="px-1 pb-1 pt-2">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-60"
                >
                  {loadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Muat lebih banyak
                </button>
              </div>
            )}

            {showSkeleton && (
              <div className="space-y-1" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex animate-pulse items-start gap-3 px-3 py-2.5">
                    <div className="h-9 w-9 rounded-lg bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/5 rounded bg-gray-100" />
                      <div className="h-2.5 w-4/5 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showError && (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <TriangleAlert className="h-6 w-6 text-gray-400" />
                <p className="text-sm text-gray-600">Notifikasi belum bisa dimuat.</p>
                <button
                  type="button"
                  onClick={retry}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {showEmpty && (
              <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
                <BellOff className="mb-1 h-7 w-7 text-gray-300" />
                <p className="text-sm font-medium text-gray-700">Belum ada notifikasi</p>
                <p className="text-xs text-gray-500">
                  Kabar soal pembayaran, akses try out, dan pengumuman akan muncul di sini.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
