import { getAllUsers, toggleUserStatus } from "@/service/userService";
import { requireAdmin } from "@/libs/api-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const toggleStatusSchema = z.object({
  userId: z.string().min(1, "userId wajib diisi"),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const validated = toggleStatusSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    // 🔥 CEGAH ADMIN NONAKTIFKAN DIRI SENDIRI
    if (validated.data.userId === session!.user.id) {
      return NextResponse.json(
        { message: "Tidak dapat menonaktifkan akun sendiri" },
        { status: 400 }
      );
    }

    const updated = await toggleUserStatus(validated.data.userId);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("TOGGLE STATUS ERROR:", error);
    return NextResponse.json({ message: "Error updating user" }, { status: 500 });
  }
}