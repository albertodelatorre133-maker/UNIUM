"use client";

import { Guard } from "@/components/Guard";
import { TopNavAlumnas } from "@/components/TopNavAlumnas";

export default function AlumnasLayout({ children }: { children: React.ReactNode }) {
  return (
    <Guard rol="alumna">
      <div className="min-h-screen">
        <TopNavAlumnas />
        <main className="section py-10">{children}</main>
      </div>
    </Guard>
  );
}
