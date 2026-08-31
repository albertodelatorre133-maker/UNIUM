"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Marca } from "./Marca";
import { Icono } from "./Icono";
import { useStore } from "@/lib/store";

const ENLACES = [
  { href: "/alumnas", label: "Reservar", icono: "calendar_month" },
  { href: "/alumnas/perfil", label: "Mi perfil", icono: "person" },
];

export function TopNavAlumnas() {
  const { usuario, salir } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);

  const activo = (href: string) =>
    href === "/alumnas" ? pathname === "/alumnas" || pathname.startsWith("/alumnas/clase") : pathname === href;

  function cerrarSesion() {
    salir();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-900/80 backdrop-blur-xl">
      <nav className="section flex h-[72px] items-center justify-between">
        <Marca href="/alumnas" />

        <div className="hidden items-center gap-2 md:flex">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] transition ${
                activo(e.href)
                  ? "border border-primary/30 bg-primary/10 text-primary"
                  : "border border-transparent text-muted hover:text-white"
              }`}
            >
              <Icono nombre={e.icono} size={16} />
              {e.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="text-right">
            <p className="text-sm font-semibold leading-tight text-white">{usuario?.nombre}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-dim">
              Alumna
            </p>
          </div>
          <button
            type="button"
            onClick={cerrarSesion}
            aria-label="Cerrar sesión"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted transition hover:border-red-500/40 hover:text-red-300"
          >
            <Icono nombre="logout" size={16} />
          </button>
        </div>

        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setAbierto((v) => !v)}
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-primary md:hidden"
        >
          <Icono nombre={abierto ? "close" : "menu"} />
        </button>
      </nav>

      {abierto && (
        <div className="border-t border-white/10 px-5 pb-5 pt-3 md:hidden">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-dim">
            {usuario?.nombre}
          </p>
          <div className="flex flex-col gap-1">
            {ENLACES.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                onClick={() => setAbierto(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 font-mono text-xs uppercase tracking-[0.18em] ${
                  activo(e.href) ? "bg-primary/10 text-primary" : "text-muted-soft"
                }`}
              >
                <Icono nombre={e.icono} size={16} />
                {e.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={cerrarSesion}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left font-mono text-xs uppercase tracking-[0.18em] text-red-300"
            >
              <Icono nombre="logout" size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
