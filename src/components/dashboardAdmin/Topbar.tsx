"use client";

import { Menu, User2Icon, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";

type TopbarProps = {
  onOpenSidebar: () => void;
  session: any;
  logoutAction: () => void;
};

export default function Topbar({
  onOpenSidebar,
  session,
  logoutAction,
}: TopbarProps) {
  const [openUser, setOpenUser] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b shadow-sm">
      
      <div className="flex items-center justify-between px-4 md:px-6 py-3">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          <button
            onClick={onOpenSidebar}
            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          {/* BRAND / TITLE */}
          <div className="hidden md:block">
            <h1 className="text-sm font-semibold text-gray-800">
              Admin Panel
            </h1>
            <p className="text-xs text-gray-500">
              Manage system & data
            </p>
          </div>

        </div>

        {/* RIGHT */}
        {session && (
          <div className="relative flex items-center gap-3">

            {/* USER BUTTON */}
            <button
              onClick={() => setOpenUser(!openUser)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition"
            >

              {/* AVATAR */}
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center border">
                <User2Icon className="w-5 h-5 text-blue-600" />
              </div>

              {/* INFO (DESKTOP ONLY) */}
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-gray-800 leading-tight">
                  {session.user.name}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {session.user.role}
                </div>
              </div>

              <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
            </button>

            {/* DROPDOWN */}
            {openUser && (
              <div className="absolute right-0 top-12 w-44 bg-white border shadow-lg rounded-xl overflow-hidden">
                
                <div className="px-3 py-2 text-xs text-gray-500 border-b">
                  Signed in as
                  <div className="font-semibold text-gray-800">
                    {session.user.name}
                  </div>
                </div>

                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center font-semibold gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={10} strokeWidth={2.5} />
                    Logout
                  </button>
                </form>

              </div>
            )}

          </div>
        )}

      </div>
    </header>
  );
}