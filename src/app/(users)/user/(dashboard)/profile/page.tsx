import ProfileCard from "@/components/dashboardUser/profile/ProfileCard";
import { Home } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* BREADCRUMB */}
      <div className="flex items-center text-sm text-gray-500 gap-2">
        <span className="font-bold text-xl text-gray-800">Profile</span>
        <span className="text-gray-300 text-xl">|</span>
        <Link href="/user" className="text-blue-600 hover:text-blue-700">
          <Home className="w-4 h-4" />
        </Link>
        <span className="text-gray-400">›</span>
        <span className="text-gray-600 font-medium">Profile Saya</span>
      </div>

      <ProfileCard />
    </div>
  );
}