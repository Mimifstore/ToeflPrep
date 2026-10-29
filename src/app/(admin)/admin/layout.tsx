import type { ReactNode } from "react";
import { cookies } from "next/headers";
import DashboardShell from "@/components/dashboardAdmin/DashboardShell";
import { SIDEBAR_COLLAPSED_COOKIE } from "@/constants/sidebar";
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
  const defaultCollapsed =
    cookies().get(SIDEBAR_COLLAPSED_COOKIE)?.value === "true";

  async function handleLogout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <DashboardShell
      session={session}
      logoutAction={handleLogout}
      defaultCollapsed={defaultCollapsed}
    >
      {children}
    </DashboardShell>
  );
}
