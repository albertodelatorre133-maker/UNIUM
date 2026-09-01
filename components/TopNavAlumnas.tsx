"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Marca } from "./Marca";
import { Icono } from "./Icono";
import { Notificaciones } from "./Notificaciones";
import { useStore } from "@/lib/store";

const ENLACES = [
  { href: "/alumnas", label: "Reservar", icono: "calendar_month", prefijos: ["/alumnas/clase"] },
  { href: "/alumnas/novedades", label: "Novedades", icono: "campaign", prefijos: [] },
  { href: "/alumnas/perfil", label: "Mi perfil", icono: "person", prefijos: [] },
];

export function TopNavAlumnas() {
  const { usuario, salir } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const activo = (href: string, prefijos: string[]) =>
    pathname === href || prefijos.some((p) => pathname.startsWith(p));

  async function cerrarSesion() {
    await salir();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/85 backdrop-blur-xl">
      <nav className="section flex h-16 items-center justify-between gap-3 lg:h-[72px]">
        <Marca href="/alumnas" size={34} />

        <div className="hidden items-center gap-1.5 lg:flex">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] transition ${
                activo(e.href, e.prefijos)
                  ? "border border-primary/30 bg-primary/10 text-primary"
                  : "border border-transparent text-muted hover:text-white"
              }`}
            >
              <Icono nombre={e.icono} size={15} />
              {e.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <Notificaciones />
          <div className="hidden text-right lg:block">
            <p className="text-[13px] font-semibold leading-tight text-white">{usuario?.nombre}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-dim">Alumna</p>
          </div>
          <button
            type="button"
            onClick={cerrarSesion}
            aria-label="Cerrar sesión"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-muted transition hover:border-red-500/40 hover:text-red-300"
          >
            <Icono nombre="logout" size={16} />
          </button>
        </div>
      </nav>
    </header>
  );
}
