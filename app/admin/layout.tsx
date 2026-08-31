"use client";

import { Guard } from "@/components/Guard";
import { SidebarAdmin } from "@/components/SidebarAdmin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Guard rol="admin">
      <div className="min-h-screen">
        <SidebarAdmin />
        <main className="px-5 py-8 sm:px-8 lg:ml-[268px] lg:px-10 lg:py-10">{children}</main>
      </div>
    </Guard>
  );
}
