import { prisma } from "@/libs/prisma";

/**
 * Data terbaru akun siswa yang sedang login untuk shell dashboard (nama, email, foto, status member).
 * Session JWT bisa basi sampai 8 jam, dan nama yang diubah siswa di halaman profil disimpan
 * di tabel Siswa, jadi diambil langsung dari database. Gagal = null, tampilan fallback ke data session.
 */
export async function getUserShellProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        siswa: { select: { name: true, isMember: true } },
      },
    });
    if (!user) return null;

    return {
      name: user.siswa?.name?.trim() || user.name,
      email: user.email,
      image: user.image,
      isMember: user.siswa?.isMember ?? false,
    };
  } catch (error) {
    console.error("GET USER SHELL PROFILE ERROR:", error);
    return null;
  }
}
