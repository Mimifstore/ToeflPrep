import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboardAdmin/DashboardShell";
import { auth, signOut } from "../../../../auth";

export const metadata = {
  title: "Dashboard - TryTOFL",
};

export default async function UserLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

async function handleLogout() {
  "use server";
  await signOut({ redirectTo: "/" });
}

  return (
        <DashboardShell
          session={session}
          logoutAction={handleLogout}
        >
          {children}
        </DashboardShell>

  );
}
