"use client";

import { Icono } from "./Icono";
import { useStore } from "@/lib/store";
import { formatoCorto } from "@/lib/date";

/**
 * Promociones vigentes marcadas para la landing. Lee del mismo estado que el
 * panel de administración, así que lo que el staff publica aparece aquí.
 */
export function PromocionesInicio() {
  const { hidratado, promocionesDeInicio } = useStore();
  if (!hidratado) return null;

  const promos = promocionesDeInicio();
  if (promos.length === 0) return null;

  return (
    <section className="section scroll-mt-24 py-16 sm:py-20" id="promociones">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Lo que está pasando</span>
          <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
            Promociones <span className="gold-text">vigentes</span>
          </h2>
        </div>
        <span className="chip-gold">
          <Icono nombre="campaign" size={13} />
          {promos.length} {promos.length === 1 ? "activa" : "activas"}
        </span>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promos.map((p) => (
          <li
            key={p.id}
            className="glass relative flex flex-col overflow-hidden p-6 transition hover:border-primary/30"
          >
            <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex items-center justify-between gap-3">
              <span className="rounded-lg bg-gold-gradient px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-900">
                {p.etiqueta}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-dim">
                Hasta {formatoCorto(p.hasta)}
              </span>
            </div>
            <h3 className="relative mt-5 font-display text-xl font-semibold uppercase tracking-wide text-white">
              {p.titulo}
            </h3>
            <p className="relative mt-2.5 flex-1 text-sm leading-relaxed text-muted">
              {p.descripcion}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
