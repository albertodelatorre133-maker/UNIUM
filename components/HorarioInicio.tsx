"use client";

import { useStore } from "@/lib/store";
import { DIAS, sumarMinutos } from "@/lib/date";

/**
 * Vista previa del calendario semanal en la landing. Lee las clases reales
 * del store (solo las semanales, para no atarla a una semana concreta) en
 * vez de datos de ejemplo, así que refleja lo que el staff programe.
 */
export function HorarioInicio() {
  const { hidratado, state, nombreCoach } = useStore();
  if (!hidratado) return null;

  const porDia = DIAS.map((_, d) =>
    state.classes
      .filter((c) => c.day === d && c.semanal)
      .sort((a, b) => a.hora.localeCompare(b.hora)),
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {DIAS.map((dia, d) => {
        const abierto = state.config.find((c) => c.day === d)?.activo ?? true;
        return (
          <div key={dia} className="glass p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold uppercase tracking-[0.16em] text-white">
                {dia}
              </h3>
              <span className="chip">{porDia[d].length} clases</span>
            </div>
            <div className="my-4 hairline" />
            {porDia[d].length === 0 ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-dim">
                {abierto ? "Sin clases programadas" : "Estudio cerrado"}
              </p>
            ) : (
              <ul className="space-y-3">
                {porDia[d].map((c) => (
                  <li key={c.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{c.titulo}</p>
                      <p className="mt-0.5 text-xs text-muted-dim">{nombreCoach(c.coachId)}</p>
                    </div>
                    <span className="whitespace-nowrap font-mono text-[11px] tracking-wider text-primary">
                      {c.hora}–{sumarMinutos(c.hora, c.duracion)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
