"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Marca } from "./Marca";
import { Icono } from "./Icono";
import { useStore } from "@/lib/store";

const ENLACES = [
  { href: "#metodo", label: "Método" },
  { href: "#promociones", label: "Promos" },
  { href: "#horarios", label: "Horarios" },
  { href: "#coaches", label: "Coaches" },
  { href: "#ubicacion", label: "Ubicación" },
];

export function NavPublica() {
  const { hidratado, usuario } = useStore();
  const [abierto, setAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const destino = hidratado && usuario ? (usuario.role === "admin" ? "/admin" : "/alumnas") : "/login";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-white/10 bg-ink-900/80 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="section flex h-20 items-center justify-between">
        <Marca />

        <div className="hidden items-center gap-9 lg:flex">
          {ENLACES.map((e) => (
            <a
              key={e.href}
              href={e.href}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted transition hover:text-primary"
            >
              {e.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {hidratado && usuario ? (
            <Link href={destino} className="btn-gold">
              MI PORTAL
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Iniciar sesión
              </Link>
              <Link href="/register" className="btn-gold">
                AGENDAR CLASE
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setAbierto((v) => !v)}
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-primary lg:hidden"
        >
          <Icono nombre={abierto ? "close" : "menu"} />
        </button>
      </nav>

      {abierto && (
        <div className="border-t border-white/10 bg-ink-900/95 px-5 pb-6 pt-4 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1">
            {ENLACES.map((e) => (
              <a
                key={e.href}
                href={e.href}
                onClick={() => setAbierto(false)}
                className="rounded-xl px-3 py-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-soft hover:bg-white/[0.04] hover:text-primary"
              >
                {e.label}
              </a>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Link href={destino} className="btn-gold w-full" onClick={() => setAbierto(false)}>
              {hidratado && usuario ? "MI PORTAL" : "AGENDAR CLASE"}
            </Link>
            {!(hidratado && usuario) && (
              <Link href="/login" className="btn-ghost w-full" onClick={() => setAbierto(false)}>
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
