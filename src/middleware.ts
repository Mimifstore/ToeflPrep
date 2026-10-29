import { auth } from "../auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  // 🔥 SKIP API — auth check dilakukan di setiap API handler
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 🔥 PUBLIC ROUTES (marketing group + auth pages)
  const publicPaths = ["/login", "/register"];
  const isPublicPath =
    publicPaths.includes(pathname) ||
    (!pathname.startsWith("/admin") && !pathname.startsWith("/user"));

  if (isPublicPath) {
    // 🔥 Kalau sudah login dan akses /login atau /register → redirect
    if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(
        new URL(role === "ADMIN" ? "/admin" : "/user", nextUrl),
      );
    }
    return NextResponse.next();
  }

  // 🔥 BELUM LOGIN — redirect ke login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 🔥 ADMIN ROUTE — hanya role ADMIN
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/user", nextUrl));
  }

  // 🔥 USER ROUTE — admin tidak boleh masuk area user (opsional, sesuaikan kebutuhan)
  if (pathname.startsWith("/user") && role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
