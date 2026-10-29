import { prisma } from "@/libs/prisma";

export async function getAllUsers() {
    return await prisma.user.findMany({
        select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        },
        orderBy: {
            createdAt: "asc"
    }
    });
}

export async function toggleUserStatus(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    return await prisma.user.update({
        where: { id: userId },
        data: {
        isActive: !user.isActive,
        },
    });
}

export async function changeUserRole(userId: string, role: "ADMIN" | "USER") {
    return await prisma.user.update({
        where: { id: userId },
        data: { role },
    });
}
