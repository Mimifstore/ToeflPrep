import type { ReactNode } from "react";
import { cookies } from "next/headers";
import DashboardShell from "@/components/dashboardUser/DashboardShell";
import { USER_SIDEBAR_COLLAPSED_COOKIE } from "@/constants/sidebar";
import { getUserShellProfile } from "@/service/user-profile.service";
import type { UserShellSession } from "@/types/user-shell";
import { auth, signOut } from "../../../../../auth";

export const metadata = {
  title: "Dashboard - TryTOFL",
};

export default async function UserLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  // Nama/email/foto/status member diambil dari database (bukan dari JWT) biar perubahan profil langsung kelihatan.
  const profile = session?.user?.id
    ? await getUserShellProfile(session.user.id)
    : null;
  const shellSession: UserShellSession = session
    ? {
        user: {
          name: profile ? profile.name : session.user.name,
          email: profile ? profile.email : session.user.email,
          image: profile ? profile.image : session.user.image,
          isMember: profile?.isMember ?? false,
        },
      }
    : null;
  const defaultCollapsed =
    cookies().get(USER_SIDEBAR_COLLAPSED_COOKIE)?.value === "true";

  async function handleLogout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <DashboardShell
      session={shellSession}
      logoutAction={handleLogout}
      defaultCollapsed={defaultCollapsed}
    >
      {children}
    </DashboardShell>
  );
}
