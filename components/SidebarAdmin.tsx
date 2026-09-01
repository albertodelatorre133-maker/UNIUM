"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Marca } from "./Marca";
import { Icono } from "./Icono";
import { useStore } from "@/lib/store";

const ENLACES = [
  { href: "/admin", label: "Calendario", icono: "calendar_month" },
  { href: "/admin/alumnas", label: "Alumnas", icono: "groups" },
  { href: "/admin/coaches", label: "Coaches", icono: "badge" },
  { href: "/admin/asistencia", label: "Asistencia", icono: "how_to_reg" },
  { href: "/admin/promociones", label: "Promociones", icono: "campaign" },
  { href: "/admin/configuracion", label: "Configuración", icono: "tune" },
];

export function SidebarAdmin() {
  const { usuario, salir } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  async function cerrarSesion() {
    await salir();
    router.push("/");
  }

  return (
    <>
      {/* Barra superior compacta en móvil */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-ink-900/90 px-5 backdrop-blur-xl lg:hidden">
        <Marca href="/admin" size={32} />
        <button
          type="button"
          onClick={cerrarSesion}
          aria-label="Cerrar sesión"
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-muted transition hover:border-red-500/40 hover:text-red-300"
        >
          <Icono nombre="logout" size={16} />
        </button>
      </header>

      {/* Sidebar persistente en escritorio */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[262px] flex-col border-r border-white/10 bg-ink-900/70 p-6 backdrop-blur-xl lg:flex">
        <Marca href="/admin" />
        <div className="my-6 hairline" />
        <span className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-dim">
          Administración
        </span>
        <nav className="flex flex-col gap-1">
          {ENLACES.map((e) => {
            const activo = pathname === e.href;
            return (
              <Link
                key={e.href}
                href={e.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.18em] transition ${
                  activo
                    ? "border border-primary/30 bg-primary/10 text-primary"
                    : "border border-transparent text-muted hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Icono nombre={e.icono} size={15} />
                {e.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="hairline" />
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              <Icono nombre="shield_person" size={16} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-white">{usuario?.nombre}</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-dim">Staff</p>
            </div>
          </div>
          <button type="button" onClick={cerrarSesion} className="btn-ghost w-full !py-2.5 text-xs">
            <Icono nombre="logout" size={15} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
