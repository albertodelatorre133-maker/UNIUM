"use client";

import { useStore } from "@/lib/store";
import { Icono } from "./Icono";

/**
 * Los "pilares" del método, gestionados desde /admin/configuracion. Lee del
 * mismo estado que el panel, así que lo que el staff publica aparece aquí de
 * inmediato.
 */
export function MetodoInicio() {
  const { hidratado, state } = useStore();
  if (!hidratado) return null;

  const pilares = [...state.pilares].sort((a, b) => a.orden - b.orden);
  if (pilares.length === 0) return null;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {pilares.map((p) => (
        <article key={p.id} className="glass group p-6 transition hover:border-primary/30">
          <span className="grid h-12 w-12 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <Icono nombre={p.icono} size={20} />
          </span>
          <h3 className="mt-5 font-display text-xl font-semibold uppercase tracking-wide text-white">
            {p.titulo}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">{p.texto}</p>
        </article>
      ))}
    </div>
  );
}
