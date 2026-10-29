import { prisma } from "@/libs/prisma";

/**
 * Data terbaru akun yang sedang login (nama, email, foto).
 * Session JWT bisa basi sampai 8 jam, jadi buat tampilan avatar diambil langsung dari database.
 * Gagal = null, tampilan fallback ke data session.
 */
export async function getAdminProfile(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true },
    });
  } catch (error) {
    console.error("GET ADMIN PROFILE ERROR:", error);
    return null;
  }
}
