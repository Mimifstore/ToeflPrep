"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type DashboardShellProps = {
  children: React.ReactNode;
  session: any;
  logoutAction: () => void;
};

export default function DashboardShell({
  children,
  session,
  logoutAction,
}: DashboardShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />

      <div className="flex-1 flex flex-col md:ml-64">
        <Topbar
          onOpenSidebar={() => setOpen(true)}
          session={session}
          logoutAction={logoutAction}
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
