"use client";

import { useStore } from "@/lib/store";
import { Icono } from "./Icono";
import { Foto } from "./Foto";
import { FOTOS } from "@/lib/seed";

/**
 * Fragmentos de la landing que dependen de los datos del estudio,
 * gestionados desde /admin/configuracion.
 */

export function ChipCiudad() {
  const { hidratado, state } = useStore();
  if (!hidratado) return null;
  return (
    <span className="chip-gold">
      <Icono nombre="location_on" size={12} />
      {state.estudio.ciudad}
    </span>
  );
}

export function LemaFooter() {
  const { hidratado, state } = useStore();
  if (!hidratado) return null;
  return <>{state.estudio.lema}</>;
}

export function UbicacionInicio() {
  const { hidratado, state } = useStore();
  if (!hidratado) return null;
  const e = state.estudio;

  return (
    <section id="ubicacion" className="section scroll-mt-24 py-20">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <span className="eyebrow">Dónde entrenamos</span>
          <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
            El <span className="gold-text">estudio</span>
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted">{e.sobreEstudio}</p>
          <ul className="mt-8 space-y-4">
            {[
              { icono: "location_on", texto: `${e.direccion} · ${e.ciudad}` },
              { icono: "call", texto: e.telefono },
              { icono: "mail", texto: e.email },
              { icono: "photo_camera", texto: e.instagram },
            ].map((i) => (
              <li key={i.icono} className="flex items-center gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-primary">
                  <Icono nombre={i.icono} size={16} />
                </span>
                <span className="text-sm text-muted-soft">{i.texto}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <Foto
            {...FOTOS.sala}
            respaldo={FOTOS.claseGrupal.src}
            className="aspect-video rounded-2xl border border-white/10"
          />
          <div className="glass overflow-hidden p-2">
            <iframe
              title="Ubicación del estudio UNIUM"
              src={e.mapa}
              className="h-[260px] w-full rounded-xl border-0 grayscale contrast-125"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
