"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Marca } from "./Marca";
import { Icono } from "./Icono";
import { useStore } from "@/lib/store";

const ENLACES = [
  { href: "/admin", label: "Calendario", icono: "calendar_month" },
  { href: "/admin/alumnas", label: "Alumnas", icono: "groups" },
  { href: "/admin/asistencia", label: "Asistencia", icono: "how_to_reg" },
  { href: "/admin/configuracion", label: "Configuración", icono: "tune" },
];

function Enlaces({ onNavegar }: { onNavegar?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {ENLACES.map((e) => {
        const activo = pathname === e.href;
        return (
          <Link
            key={e.href}
            href={e.href}
            onClick={onNavegar}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] transition ${
              activo
                ? "border border-primary/30 bg-primary/10 text-primary"
                : "border border-transparent text-muted hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <Icono nombre={e.icono} size={16} />
            {e.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarAdmin() {
  const { usuario, salir } = useStore();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);

  function cerrarSesion() {
    salir();
    router.push("/");
  }

  return (
    <>
      {/* Barra superior movil */}
      <header className="sticky top-0 z-50 flex h-[68px] items-center justify-between border-b border-white/10 bg-ink-900/85 px-5 backdrop-blur-xl lg:hidden">
        <Marca href="/admin" />
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setAbierto(true)}
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-primary"
        >
          <Icono nombre="menu" />
        </button>
      </header>

      {abierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setAbierto(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[78%] max-w-xs flex-col border-r border-white/10 bg-ink-900 p-6">
            <Marca href="/admin" />
            <div className="my-6 hairline" />
            <Enlaces onNavegar={() => setAbierto(false)} />
            <button type="button" onClick={cerrarSesion} className="btn-ghost mt-auto">
              <Icono nombre="logout" size={16} />
              Cerrar sesión
            </button>
          </aside>
        </div>
      )}

      {/* Sidebar persistente en escritorio */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-white/10 bg-ink-900/70 p-6 backdrop-blur-xl lg:flex">
        <Marca href="/admin" />
        <div className="my-6 hairline" />
        <span className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-dim">
          Administración
        </span>
        <Enlaces />

        <div className="mt-auto space-y-4">
          <div className="hairline" />
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              <Icono nombre="shield_person" size={16} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{usuario?.nombre}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-dim">
                Staff
              </p>
            </div>
          </div>
          <button type="button" onClick={cerrarSesion} className="btn-ghost w-full !py-2.5 text-xs">
            <Icono nombre="logout" size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
