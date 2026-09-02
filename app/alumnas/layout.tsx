"use client";

import { Guard } from "@/components/Guard";
import { TopNavAlumnas } from "@/components/TopNavAlumnas";
import { BottomNav } from "@/components/BottomNav";
import { PromptNotificaciones } from "@/components/PromptNotificaciones";
import { useStore } from "@/lib/store";

export default function AlumnasLayout({ children }: { children: React.ReactNode }) {
  return (
    <Guard rol="alumna">
      <Contenido>{children}</Contenido>
    </Guard>
  );
}

function Contenido({ children }: { children: React.ReactNode }) {
  const { sinLeer } = useStore();

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <PromptNotificaciones />
      <TopNavAlumnas />
      <main className="section py-6 sm:py-8 lg:py-10">{children}</main>
      <BottomNav
        items={[
          { href: "/alumnas", label: "Reservar", icono: "calendar_month", prefijos: ["/alumnas/clase"] },
          { href: "/alumnas/novedades", label: "Novedades", icono: "campaign", badge: sinLeer },
          { href: "/alumnas/perfil", label: "Perfil", icono: "person" },
        ]}
      />
    </div>
  );
}
