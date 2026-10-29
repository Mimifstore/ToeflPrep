import { changeUserRole } from "@/service/userService";
import { requireAdmin } from "@/libs/api-auth";
import { NextResponse } from "next/server";
import { logAudit } from "@/libs/audit-log";
import { prisma } from "@/libs/prisma";
import { z } from "zod";

const changeRoleSchema = z.object({
  userId: z.string().min(1, "userId wajib diisi"),
  role: z.enum(["USER", "ADMIN"], {
    error: "Role harus USER atau ADMIN",
  }),
});

export async function PATCH(req: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = changeRoleSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 },
      );
    }

    const { userId, role } = validated.data;

    // 🔥 CEGAH ADMIN UBAH ROLE DIRI SENDIRI (mencegah self-demote tidak sengaja)
    if (userId === session!.user.id) {
      return NextResponse.json(
        { message: "Tidak dapat mengubah role akun sendiri" },
        { status: 400 },
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });

    const updated = await changeUserRole(userId, role);

    await logAudit({
      actorId: session!.user.id,
      action: "CHANGE_ROLE",
      targetId: userId,
      metadata: { oldRole: targetUser?.role, newRole: role },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("CHANGE ROLE ERROR:", error);
    return NextResponse.json(
      { message: "Error updating role" },
      { status: 500 },
    );
  }
}
