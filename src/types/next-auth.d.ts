import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string; // <-- optional biar gak error
  }

  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["USER"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}
