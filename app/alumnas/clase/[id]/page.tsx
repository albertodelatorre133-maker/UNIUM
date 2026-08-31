"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Icono } from "@/components/Icono";
import { Cargando } from "@/components/Guard";
import { useStore } from "@/lib/store";
import { COACHES, ESTUDIO } from "@/lib/seed";
import { formatoLargo, hoyISO, sumarMinutos } from "@/lib/date";

function DetalleClase() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const fecha = search.get("fecha") ?? hoyISO();
  const { sesion, reservar, cancelar } = useStore();
  const [aviso, setAviso] = useState<string | null>(null);

  const s = sesion(params.id, fecha);

  if (!s) {
    return (
      <div className="glass p-10 text-center">
        <Icono nombre="search_off" size={36} className="text-muted-dim" />
        <h1 className="mt-4 font-display text-2xl font-semibold uppercase">Clase no encontrada</h1>
        <p className="mt-2 text-sm text-muted">Es posible que la sesión haya sido eliminada.</p>
        <Link href="/alumnas" className="btn-ghost mt-6">
          Volver al calendario
        </Link>
      </div>
    );
  }

  const coach = COACHES.find((c) => c.nombre === s.clase.coach);
  const lleno = s.disponibles === 0 && !s.reservaPropia;

  return (
    <div className="space-y-8">
      <Link
        href="/alumnas"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition hover:text-primary"
      >
        <Icono nombre="arrow_back" size={16} />
        Volver al calendario
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="glass-strong p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip-gold">{formatoLargo(s.fecha)}</span>
              <span className="chip">
                {s.clase.hora} – {sumarMinutos(s.clase.hora, s.clase.duracion)}
              </span>
              <span className="chip">{s.clase.duracion} min</span>
            </div>

            <h1 className="mt-6 font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl">
              {s.clase.titulo}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-soft">
              {s.clase.descripcion}
            </p>

            <div className="my-7 hairline" />

            <div className="grid gap-5 sm:grid-cols-3">
              {[
                { icono: "group", etiqueta: "Cupos totales", valor: String(s.clase.cupo) },
                { icono: "event_available", etiqueta: "Reservadas", valor: String(s.reservadas) },
                { icono: "check_circle", etiqueta: "Disponibles", valor: String(s.disponibles) },
              ].map((d) => (
                <div key={d.etiqueta} className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                    <Icono nombre={d.icono} size={16} />
                  </span>
                  <div>
                    <p className="font-display text-2xl font-bold text-white">{d.valor}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-dim">
                      {d.etiqueta}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {aviso && (
              <p className="mt-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                {aviso}
              </p>
            )}

            <div className="mt-8">
              {s.pasada ? (
                <p className="chip !py-2.5">Esta clase ya finalizó</p>
              ) : s.reservaPropia ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <span className="btn-ghost pointer-events-none flex-1 border-primary/40 text-primary">
                    <Icono nombre="check_circle" size={16} />
                    YA ESTÁS AGENDADA
                  </span>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => cancelar(s.reservaPropia!.id)}
                  >
                    Cancelar reserva
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={lleno}
                  className="btn-gold w-full text-base sm:w-auto"
                  onClick={() => {
                    const res = reservar(s.clase.id, s.fecha);
                    setAviso(res.ok ? null : (res.error ?? "No fue posible reservar."));
                  }}
                >
                  <Icono nombre="calendar_add_on" />
                  {lleno ? "SIN CUPOS DISPONIBLES" : "AGENDAR ESTA CLASE"}
                </button>
              )}
            </div>
          </section>

          <section className="glass p-7">
            <span className="eyebrow">Tu coach</span>
            <div className="mt-5 flex items-start gap-5">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-primary/30 bg-gold-gradient font-display text-xl font-bold text-ink-900">
                {coach?.iniciales ?? s.clase.coach.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
                  {s.clase.coach}
                </h2>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  {coach?.especialidad ?? "Coach UNIUM"}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {coach?.bio ?? "Coach certificada del equipo UNIUM."}
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="glass overflow-hidden">
            <iframe
              title="Ubicación del estudio"
              src={ESTUDIO.mapa}
              className="h-56 w-full border-0 grayscale contrast-125"
              loading="lazy"
            />
            <div className="p-6">
              <span className="eyebrow">Ubicación</span>
              <h2 className="mt-3 font-display text-lg font-semibold uppercase tracking-wide">
                {ESTUDIO.nombre}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {ESTUDIO.direccion}
                <br />
                {ESTUDIO.ciudad}
              </p>
              <div className="my-5 hairline" />
              <div className="space-y-3 text-sm text-muted-soft">
                <p className="flex items-center gap-3">
                  <Icono nombre="call" size={16} className="text-primary" />
                  {ESTUDIO.telefono}
                </p>
                <p className="flex items-center gap-3">
                  <Icono nombre="mail" size={16} className="text-primary" />
                  {ESTUDIO.email}
                </p>
              </div>
            </div>
          </section>

          <section className="glass p-6">
            <span className="eyebrow">Recomendaciones</span>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              {[
                "Llega 10 minutos antes para el calentamiento.",
                "Trae toalla y botella de agua.",
                "Cancela con 3 horas de anticipación para liberar tu cupo.",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <Icono nombre="chevron_right" size={16} className="shrink-0 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function ClaseDetallePage() {
  return (
    <Suspense fallback={<Cargando />}>
      <DetalleClase />
    </Suspense>
  );
}
