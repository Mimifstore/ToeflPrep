import {
  Bell,
  CircleCheck,
  CircleX,
  Crown,
  KeyRound,
  Megaphone,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@/types/notification";

export type NotificationTone = "success" | "danger" | "warning" | "info";

export type NotificationStyle = { icon: LucideIcon; tone: NotificationTone };

/** Icon dan warna tiap jenis notifikasi. */
export const NOTIFICATION_STYLES: Record<NotificationType, NotificationStyle> = {
  PAYMENT_SUCCESS: { icon: CircleCheck, tone: "success" },
  PAYMENT_FAILED: { icon: CircleX, tone: "danger" },
  PAYMENT_DUPLICATE: { icon: TriangleAlert, tone: "warning" },
  ACCESS_GRANTED: { icon: KeyRound, tone: "success" },
  MEMBER_ACTIVATED: { icon: Crown, tone: "warning" },
  MEMBER_DEACTIVATED: { icon: Crown, tone: "info" },
  ANNOUNCEMENT: { icon: Megaphone, tone: "info" },
};

/** Dipakai untuk jenis yang belum dikenal. */
export const DEFAULT_NOTIFICATION_STYLE: NotificationStyle = {
  icon: Bell,
  tone: "info",
};
