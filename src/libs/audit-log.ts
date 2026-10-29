import { prisma } from "./prisma";

type LogAction =
  | "DELETE_USER"
  | "CHANGE_ROLE"
  | "TOGGLE_USER_STATUS"
  | "DELETE_QUESTION"
  | "DELETE_EXAM"
  | "FORCE_SUBMIT"
  | "DELETE_TRANSACTION"
  | "BULK_DELETE_QUESTION"
  | "DUPLICATE_PAYMENT";

type Props = {
  actorId: string;
  action: LogAction;
  targetId?: string;
  metadata?: Record<string, any>;
};

export async function logAudit({ actorId, action, targetId, metadata }: Props) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetId,
        metadata: metadata || undefined,
      },
    });
  } catch (error) {
    // Jangan throw — audit log gagal tidak boleh menggagalkan aksi utama
    console.error("AUDIT LOG ERROR:", error);
  }
}
