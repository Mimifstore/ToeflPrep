import { prisma } from "@/libs/prisma";
import { requireAdmin } from "@/libs/api-auth";
import { NextResponse } from "next/server";
import { logAudit } from "@/libs/audit-log";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    // 🔥 CEGAH ADMIN HAPUS DIRI SENDIRI
    if (params.id === session!.user.id) {
      return NextResponse.json(
        { message: "Tidak dapat menghapus akun sendiri" },
        { status: 400 },
      );
    }

    // 🔥 CEK USER ADA
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    // log audit
    await logAudit({
      actorId: session!.user.id,
      action: "DELETE_USER",
      targetId: params.id,
      metadata: { deletedEmail: targetUser.email, deletedName: targetUser.name },
    });


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return NextResponse.json({ error: "Delete gagal" }, { status: 500 });
  }
}
