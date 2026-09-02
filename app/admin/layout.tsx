"use client";

import { Guard } from "@/components/Guard";
import { SidebarAdmin } from "@/components/SidebarAdmin";
import { BottomNav } from "@/components/BottomNav";
import { PromptNotificaciones } from "@/components/PromptNotificaciones";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Guard rol="admin">
      <div className="min-h-screen pb-24 lg:pb-0">
        <PromptNotificaciones />
        <SidebarAdmin />
        <main className="px-5 py-6 sm:px-7 sm:py-8 lg:ml-[262px] lg:px-9 lg:py-10">{children}</main>
        <BottomNav
          items={[
            { href: "/admin", label: "Agenda", icono: "calendar_month" },
            { href: "/admin/alumnas", label: "Alumnas", icono: "groups" },
            { href: "/admin/coaches", label: "Coaches", icono: "badge" },
            { href: "/admin/asistencia", label: "Asistencia", icono: "how_to_reg" },
            { href: "/admin/cancelaciones", label: "Canceladas", icono: "event_busy" },
            { href: "/admin/promociones", label: "Promos", icono: "campaign" },
            { href: "/admin/configuracion", label: "Ajustes", icono: "tune" },
          ]}
        />
      </div>
    </Guard>
  );
}
