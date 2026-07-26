import './globals.css';
import type { Metadata } from "next";
import Link from "next/link";
import { SidebarNav } from "@/components/sidebar-nav";

export const metadata: Metadata = { title: "DesignQA", description: "Visual regression tracking" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <div className="min-h-screen md:flex">
      <aside className="bg-navy px-6 py-7 text-white md:fixed md:inset-y-0 md:w-64">
        <Link href="/projects" className="text-2xl font-bold tracking-tight">Design<span className="text-teal">QA</span></Link>
        <p className="mt-2 text-sm leading-5 text-slate-300">Visual regression tracking</p>
        <SidebarNav />
      </aside>
      <main className="min-h-screen flex-1 p-6 md:ml-64 md:p-10">{children}</main>
    </div>
  </body></html>;
}
