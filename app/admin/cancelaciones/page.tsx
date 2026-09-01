"use client";

import { useMemo, useState } from "react";
import { Icono } from "@/components/Icono";
import { useStore } from "@/lib/store";
import { formatoLargo } from "@/lib/date";

function formatoFechaHora(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("es-CO", { day: "numeric", month: "short" })} · ${d.toLocaleTimeString(
    "es-CO",
    { hour: "2-digit", minute: "2-digit" },
  )}`;
}

export default function CancelacionesPage() {
  const { state } = useStore();
  const [busqueda, setBusqueda] = useState("");

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return state.cancelaciones;
    return state.cancelaciones.filter(
      (c) =>
        c.usuarioNombre.toLowerCase().includes(q) || c.claseTitulo.toLowerCase().includes(q),
    );
  }, [state.cancelaciones, busqueda]);

  const autoCanceladas = state.cancelaciones.filter((c) => c.usuarioId === c.canceladaPorId).length;

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow hidden sm:block">Historial</span>
        <h1 className="font-display text-[28px] font-bold uppercase tracking-tight sm:mt-2 sm:text-4xl lg:text-5xl">
          Cancelaciones
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] text-muted sm:text-sm">
          Quién canceló, qué clase y cuándo. Se registra automáticamente cada vez que se libera un
          cupo, sin importar desde dónde se cancele.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:max-w-sm">
        {[
          { icono: "event_busy", valor: String(state.cancelaciones.length), etiqueta: "Total" },
          { icono: "person", valor: String(autoCanceladas), etiqueta: "Por la alumna" },
        ].map((m) => (
          <div key={m.etiqueta} className="glass flex items-center gap-3 p-3.5 sm:gap-4 sm:p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <Icono nombre={m.icono} size={16} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-xl font-bold text-white sm:text-2xl">{m.valor}</p>
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-muted-dim">
                {m.etiqueta}
              </p>
            </div>
          </div>
        ))}
      </section>

      <div className="relative max-w-sm">
        <Icono
          nombre="search"
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-dim"
        />
        <input
          placeholder="Buscar por alumna o clase"
          className="w-full !pl-10"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {lista.length === 0 ? (
        <div className="glass px-6 py-16 text-center">
          <Icono
            nombre={state.cancelaciones.length === 0 ? "event_busy" : "search_off"}
            size={34}
            className="mx-auto text-muted-dim"
          />
          <p className="mt-4 text-sm text-muted">
            {state.cancelaciones.length === 0
              ? "Todavía no se ha cancelado ninguna reserva."
              : "Ninguna cancelación coincide con esa búsqueda."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {lista.map((c) => {
            const porElla = c.usuarioId === c.canceladaPorId;
            return (
              <li
                key={c.id}
                className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4 transition sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-white">{c.usuarioNombre}</p>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {c.claseTitulo} · {formatoLargo(c.fechaClase)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-dim">
                    {formatoFechaHora(c.canceladaEn)}
                  </span>
                  <span
                    className={`chip !py-1 !text-[9px] ${porElla ? "" : "!border-primary/30 !text-primary"}`}
                  >
                    {porElla ? "Canceló ella misma" : `Canceló ${c.canceladaPorNombre}`}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
