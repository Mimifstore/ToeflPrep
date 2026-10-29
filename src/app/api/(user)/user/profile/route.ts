import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    });

    if (!siswa) {
      return NextResponse.json(
        { message: "Profile tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: siswa.id,
      name: siswa.name,
      email: siswa.user.email,
      phone: siswa.phone,
      gender: siswa.gender,
      address: siswa.address,
      province: siswa.province,
      city: siswa.city,
      district: siswa.district,
      village: siswa.village,
      isMember: siswa.isMember,
      isActive: siswa.user.isActive,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal ambil profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const siswa = await prisma.siswa.update({
      where: { userId: session.user.id },
      data: {
        name: body.name,
        phone: body.phone,
        gender: body.gender,
        address: body.address,
        province: body.province,
        city: body.city,
        district: body.district,
        village: body.village,
      },
    });

    return NextResponse.json(siswa);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal update profile" },
      { status: 500 },
    );
  }
}
