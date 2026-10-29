// components/ui/Container.tsx
export default function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-full mx-auto ${className}`}>
      {children}
    </div>
  );
}

// import { auth } from "../../../auth";
// import NavbarClient from "@/components/Layout/Navbar";
// import { Inter } from "next/font/google";

// const inter = Inter({ subsets: ["latin"] });

// export default async function PublicLayout({
//     children,
//     }: {
//     children: React.ReactNode;
//     }) {

//     const session = await auth(); 

//     return (
//     <div
//             className={`${inter.className} min-h-screen flex flex-col text-white md:overflow-hidden md:fixed md:inset-0 md:overflow-x-hidden`}
//         >
//             <NavbarClient session={session} />
//             <main className="flex-1 bg-blue-600">{children}</main>
//         </div>
//     );
// }