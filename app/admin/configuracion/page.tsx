"use client";

import { useEffect, useState } from "react";
import { Icono } from "@/components/Icono";
import { useStore } from "@/lib/store";
import { DIAS } from "@/lib/date";
import type { DayConfig } from "@/lib/types";

const HORAS = Array.from({ length: 24 * 2 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

export default function ConfiguracionPage() {
  const { state, guardarConfig } = useStore();
  const [config, setConfig] = useState<DayConfig[]>(state.config);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => setConfig(state.config), [state.config]);

  function actualizar(day: number, cambios: Partial<DayConfig>) {
    setConfig((c) => c.map((d) => (d.day === day ? { ...d, ...cambios } : d)));
    setGuardado(false);
  }

  const invalidos = config.filter((d) => d.activo && d.apertura >= d.cierre);
  const diasActivos = config.filter((d) => d.activo).length;

  return (
    <div className="space-y-8">
      <header>
        <span className="eyebrow">Motor del calendario</span>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
          Configuración del <span className="gold-text">estudio</span>
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] text-muted sm:text-sm">
          Define qué días abre el estudio y el horario operativo de cada uno. Estas franjas
          determinan los horarios disponibles al crear clases y los días que las alumnas ven como
          cerrados.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[
          { icono: "event_available", valor: String(diasActivos), etiqueta: "Días activos" },
          { icono: "schedule", valor: String(7 - diasActivos), etiqueta: "Días cerrados" },
          {
            icono: "rule",
            valor: invalidos.length ? String(invalidos.length) : "0",
            etiqueta: "Rangos inválidos",
          },
        ].map((m) => (
          <div key={m.etiqueta} className="glass flex items-center gap-3 p-3.5 sm:gap-4 sm:p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <Icono nombre={m.icono} size={16} />
            </span>
            <div>
              <p className="font-display text-xl font-bold text-white sm:text-2xl">{m.valor}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-dim">
                {m.etiqueta}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="glass p-5 sm:p-8">
        <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">
          Horario operativo
        </h2>
        <div className="my-6 hairline" />

        <div className="space-y-3">
          {config.map((d) => {
            const invalido = d.activo && d.apertura >= d.cierre;
            return (
              <div
                key={d.day}
                className={`flex flex-col gap-4 rounded-xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                  d.activo
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-dashed border-white/10 bg-transparent"
                } ${invalido ? "!border-red-500/40" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={d.activo}
                    aria-label={`Activar ${DIAS[d.day]}`}
                    onClick={() => actualizar(d.day, { activo: !d.activo })}
                    className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
                      d.activo
                        ? "border-primary/50 bg-primary/25"
                        : "border-white/15 bg-white/[0.05]"
                    }`}
                  >
                    <span
                      className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-all ${
                        d.activo ? "left-[26px] bg-gold-gradient" : "left-1 bg-muted-dim"
                      }`}
                    />
                  </button>
                  <div>
                    <p
                      className={`font-display text-lg font-semibold uppercase tracking-[0.14em] ${
                        d.activo ? "text-white" : "text-muted-dim"
                      }`}
                    >
                      {DIAS[d.day]}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-dim">
                      {d.activo ? "Abierto" : "Cerrado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <label htmlFor={`apertura-${d.day}`} className="!mb-1">
                      Apertura
                    </label>
                    <select
                      id={`apertura-${d.day}`}
                      disabled={!d.activo}
                      className="!py-2 text-xs disabled:opacity-40"
                      value={d.apertura}
                      onChange={(e) => actualizar(d.day, { apertura: e.target.value })}
                    >
                      {HORAS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="mt-6 text-muted-dim">—</span>
                  <div>
                    <label htmlFor={`cierre-${d.day}`} className="!mb-1">
                      Cierre
                    </label>
                    <select
                      id={`cierre-${d.day}`}
                      disabled={!d.activo}
                      className="!py-2 text-xs disabled:opacity-40"
                      value={d.cierre}
                      onChange={(e) => actualizar(d.day, { cierre: e.target.value })}
                    >
                      {HORAS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {invalidos.length > 0 && (
          <p className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            <Icono nombre="error" size={16} />
            La hora de cierre debe ser posterior a la de apertura en{" "}
            {invalidos.map((d) => DIAS[d.day]).join(", ")}.
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <button
            type="button"
            disabled={invalidos.length > 0}
            onClick={() => {
              guardarConfig(config);
              setGuardado(true);
            }}
            className="btn-gold w-full sm:w-auto"
          >
            <Icono nombre="save" />
            GUARDAR CONFIGURACIÓN
          </button>
          <button
            type="button"
            className="btn-ghost w-full sm:w-auto"
            onClick={() => {
              setConfig(state.config);
              setGuardado(false);
            }}
          >
            Descartar cambios
          </button>
          {guardado && (
            <span className="chip-gold">
              <Icono nombre="check_circle" size={14} />
              Configuración guardada
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
