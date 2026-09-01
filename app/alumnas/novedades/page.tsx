"use client";

import { useEffect } from "react";
import { Icono } from "@/components/Icono";
import { useStore } from "@/lib/store";
import { formatoCorto } from "@/lib/date";

export default function NovedadesPage() {
  const { promocionesVigentes, marcarPromocionesLeidas, sinLeer } = useStore();
  const promos = promocionesVigentes();

  useEffect(() => {
    if (sinLeer > 0) {
      const t = window.setTimeout(marcarPromocionesLeidas, 1200);
      return () => window.clearTimeout(t);
    }
  }, [sinLeer, marcarPromocionesLeidas]);

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Del estudio para ti</span>
        <h1 className="font-display text-[28px] font-bold uppercase tracking-tight sm:mt-2 sm:text-4xl lg:text-5xl">
          Novedades y <span className="gold-text">promociones</span>
        </h1>
        <p className="mt-2 text-[13px] text-muted sm:text-sm">
          Beneficios y avisos vigentes del estudio.
        </p>
      </header>

      {promos.length === 0 ? (
        <div className="glass px-6 py-16 text-center">
          <Icono nombre="campaign" size={34} className="mx-auto text-muted-dim" />
          <p className="mt-4 text-sm text-muted">No hay promociones activas por ahora.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {promos.map((p) => (
            <li key={p.id} className="glass flex flex-col p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="chip-gold">{p.etiqueta}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-dim">
                  Hasta {formatoCorto(p.hasta)}
                </span>
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold uppercase tracking-wide text-white">
                {p.titulo}
              </h2>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-muted">{p.descripcion}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
