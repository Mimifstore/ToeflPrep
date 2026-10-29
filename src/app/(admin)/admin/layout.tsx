import type { ReactNode } from "react";
import { cookies } from "next/headers";
import DashboardShell from "@/components/dashboardAdmin/DashboardShell";
import { SIDEBAR_COLLAPSED_COOKIE } from "@/constants/sidebar";
import { getAdminProfile } from "@/service/admin-profile.service";
import type { TopbarSession } from "@/types/admin-shell";
import { auth, signOut } from "../../../../auth";

export const metadata = {
  title: "Dashboard - TryTOFL",
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  // Nama/email/foto diambil dari database (bukan dari JWT) biar perubahan profil langsung kelihatan.
  const profile = session?.user?.id ? await getAdminProfile(session.user.id) : null;
  const shellSession: TopbarSession = session
    ? {
        user: {
          name: profile ? profile.name : session.user.name,
          email: profile ? profile.email : session.user.email,
          image: profile ? profile.image : session.user.image,
          role: session.user.role,
        },
      }
    : null;
  const defaultCollapsed =
    cookies().get(SIDEBAR_COLLAPSED_COOKIE)?.value === "true";

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
