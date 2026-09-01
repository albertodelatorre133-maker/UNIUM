"use client";

import { useStore } from "@/lib/store";

/**
 * Cifras destacadas del hero, gestionadas desde /admin/configuracion. Lee del
 * mismo estado que el panel, así que lo que el staff publica aparece aquí de
 * inmediato.
 */
export function MetricasInicio() {
  const { hidratado, state } = useStore();
  if (!hidratado) return null;

  const metricas = [...state.metricas].sort((a, b) => a.orden - b.orden);
  if (metricas.length === 0) return null;

  return (
    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {metricas.map((m) => (
        <div key={m.id}>
          <p className="font-display text-3xl font-bold gold-text">{m.valor}</p>
          <p className="mt-1 font-mono text-[9.5px] uppercase leading-tight tracking-[0.14em] text-muted-dim">
            {m.etiqueta}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * Texto de la foto del hero ("Grupos de máximo N alumnas"). Toma el valor de
 * la cifra "Alumnas por clase" en vez de tenerlo escrito aparte, para que no
 * se desincronicen si alguien edita solo una de las dos.
 */
export function GrupoMaximoTexto() {
  const { hidratado, state } = useStore();
  if (!hidratado) return null;

  const metrica = state.metricas.find((m) => m.etiqueta.toLowerCase().includes("alumnas"));
  const valor = metrica?.valor ?? "12";

  return (
    <>
      Grupos de máximo
      <br />
      {valor} alumnas
    </>
  );
}
