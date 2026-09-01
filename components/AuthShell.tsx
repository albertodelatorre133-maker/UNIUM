"use client";

import Link from "next/link";
import { Isotipo } from "./Marca";
import { useStore } from "@/lib/store";

export function AuthShell({
  titulo,
  subtitulo,
  children,
  pie,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
  pie: React.ReactNode;
}) {
  const { hidratado, state } = useStore();
  return (
    <main className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-4 py-10 corto:py-6 sm:px-5 sm:py-12">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]" />

      <div className="relative mx-auto mt-7 w-full max-w-md corto:mt-6">
        <div className="glass-strong relative overflow-hidden px-5 pb-5 pt-12 corto:pt-11 sm:px-9 sm:pb-9 sm:pt-14">
          {/*
            Filigrana del monograma en la esquina inferior, fuera del área de
            lectura: da textura al panel sin competir con el texto.
          */}
          <div className="pointer-events-none absolute -bottom-10 -right-10 opacity-[0.06]">
            <Isotipo size={230} />
          </div>

          <div className="relative text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-primary/80">
              Unium
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
              {titulo}
            </h1>
            <p className="mx-auto mt-1.5 max-w-[34ch] text-[13px] text-muted sm:text-sm">
              {subtitulo}
            </p>
          </div>

          <div className="relative my-5 hairline corto:my-4 sm:my-6" />
          <div className="relative">{children}</div>
        </div>

        {/* Medallón montado sobre el borde superior del panel */}
        <Link
          href="/"
          aria-label="Ir al inicio"
          className="absolute left-1/2 top-0 grid h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-primary/30 bg-ink-900 shadow-gold transition hover:border-primary/60 corto:h-16 corto:w-16"
        >
          <span className="pointer-events-none absolute inset-1.5 rounded-full border border-primary/15" />
          <Isotipo size={40} />
        </Link>

        <div className="mt-4 text-center text-[13px] text-muted corto:mt-3 sm:mt-5 sm:text-sm">
          {pie}
        </div>
        <p className="mt-5 text-center font-mono text-[9px] uppercase tracking-[0.22em] text-muted-dim corto:hidden sm:mt-7 sm:text-[10px]">
          {hidratado ? state.estudio.lema : ""}
        </p>
      </div>
    </main>
  );
}
