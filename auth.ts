import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/libs/prisma";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/libs/zod";
import { compareSync } from "bcrypt-ts";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { rateLimit, getClientIp } from "@/libs/rate-limit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
    updateAge: 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google,
    GitHub,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (Credentials, request) => {
        const validateFields = signInSchema.safeParse(Credentials);

        if (!validateFields.success) {
          return null;
        }

        const { email, password } = validateFields.data;

        // 🔥 RATE LIMIT — cegah brute force login
        // Dua lapis: per-IP (cegah spray ke banyak akun) & per-email
        // (cegah target satu akun walau IP-nya gonta-ganti)
        const ip = getClientIp(request);

        const ipLimit = rateLimit({
          key: `login-ip:${ip}`,
          limit: 100,
          windowMs: 5 * 60 * 1000, // 100 percobaan / 5 menit / IP
        });

        if (!ipLimit.success) {
          throw new Error(
            "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi.",
          );
        }

        const emailLimit = rateLimit({
          key: `login-email:${email.toLowerCase()}`,
          limit: 5,
          windowMs: 15 * 60 * 1000, // 5 percobaan / 15 menit / email
        });

        if (!emailLimit.success) {
          throw new Error(
            "Terlalu banyak percobaan login untuk akun ini. Coba lagi beberapa menit lagi.",
          );
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error("No user found");
        }

        const passwordMatch = compareSync(password, user.password);

        if (!passwordMatch) return null;

        return user;
      },
    }),
  ],
  // callback
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname.startsWith("/login");

      // belum login tapi akses admin
      if (!isLoggedIn && isAdminRoute) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      // 🔥 user biasa masuk admin → tendang
      if (isLoggedIn && isAdminRoute && auth?.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/user", nextUrl));
      }

      // 🔥 login → redirect sesuai role
      if (isLoggedIn && isLoginPage) {
        if (auth?.user?.role === "ADMIN") {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return Response.redirect(new URL("/user", nextUrl));
      }

      return true;
    },

    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },

    session({ session, token }) {
      session.user.id = token.sub;
      session.user.role = token.role;
      return session;
    },
  },
});
