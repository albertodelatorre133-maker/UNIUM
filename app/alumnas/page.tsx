"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icono } from "@/components/Icono";
import { useStore } from "@/lib/store";
import { DIAS, addDays, hoyISO, MESES, startOfWeek, sumarMinutos, toISODate } from "@/lib/date";

export default function ReservaClasesPage() {
  const { state, sesionesDeLaSemana, reservar, cancelar, usuario } = useStore();
  const [offset, setOffset] = useState(0);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const semana = sesionesDeLaSemana(offset);
  const lunes = addDays(startOfWeek(new Date()), offset * 7);
  const domingo = addDays(lunes, 6);
  const hoy = hoyISO();

  const misReservasSemana = useMemo(
    () => semana.flat().filter((s) => s.reservaPropia).length,
    [semana],
  );

  const rango =
    lunes.getMonth() === domingo.getMonth()
      ? `${lunes.getDate()} – ${domingo.getDate()} de ${MESES[lunes.getMonth()]}`
      : `${lunes.getDate()} ${MESES[lunes.getMonth()].slice(0, 3)} – ${domingo.getDate()} ${MESES[domingo.getMonth()].slice(0, 3)}`;

  function onReservar(classId: string, fecha: string) {
    const res = reservar(classId, fecha);
    setAviso(
      res.ok
        ? { tipo: "ok", texto: "¡Listo! Tu cupo quedó reservado." }
        : { tipo: "error", texto: res.error ?? "No fue posible reservar." },
    );
    window.setTimeout(() => setAviso(null), 3500);
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow">Calendario de clases</span>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl">
            Hola, <span className="gold-text">{usuario?.nombre.split(" ")[0]}</span>
          </h1>
          <p className="mt-3 text-sm text-muted">
            Elige tu horario y reserva con un clic. Tienes{" "}
            <span className="font-semibold text-primary">{misReservasSemana}</span>{" "}
            {misReservasSemana === 1 ? "clase agendada" : "clases agendadas"} esta semana.
          </p>
        </div>

        <div className="glass flex items-center gap-2 p-2">
          <button
            type="button"
            aria-label="Semana anterior"
            onClick={() => setOffset((o) => o - 1)}
            className="grid h-10 w-10 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-primary"
          >
            <Icono nombre="chevron_left" />
          </button>
          <div className="min-w-[190px] text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-white">
              {rango}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-dim">
              {offset === 0 ? "Semana actual" : offset > 0 ? `+${offset} semana(s)` : `${offset} semana(s)`}
            </p>
          </div>
          <button
            type="button"
            aria-label="Semana siguiente"
            onClick={() => setOffset((o) => o + 1)}
            className="grid h-10 w-10 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-primary"
          >
            <Icono nombre="chevron_right" />
          </button>
        </div>
      </header>

      {aviso && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
            aviso.tipo === "ok"
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          <Icono nombre={aviso.tipo === "ok" ? "check_circle" : "error"} size={16} />
          {aviso.texto}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {DIAS.map((dia, d) => {
          const fecha = toISODate(addDays(lunes, d));
          const config = state.config.find((c) => c.day === d);
          const sesiones = semana[d];
          const esHoy = fecha === hoy;
          const pasado = fecha < hoy;

          return (
            <section
              key={dia}
              className={`glass flex flex-col p-5 transition ${
                esHoy ? "border-primary/40 shadow-gold" : ""
              } ${pasado ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold uppercase tracking-[0.16em] text-white">
                    {dia}
                  </h2>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-dim">
                    {addDays(lunes, d).getDate()} de {MESES[addDays(lunes, d).getMonth()]}
                  </p>
                </div>
                {esHoy ? (
                  <span className="chip-gold">Hoy</span>
                ) : config?.activo ? (
                  <span className="chip">
                    {config.apertura}–{config.cierre}
                  </span>
                ) : (
                  <span className="chip">Cerrado</span>
                )}
              </div>

              <div className="my-4 hairline" />

              {!config?.activo ? (
                <p className="flex items-center gap-2 py-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-dim">
                  <Icono nombre="do_not_disturb_on" size={16} />
                  Estudio cerrado
                </p>
              ) : sesiones.length === 0 ? (
                <p className="flex items-center gap-2 py-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-dim">
                  <Icono nombre="event_busy" size={16} />
                  Sin clases programadas
                </p>
              ) : (
                <ul className="space-y-3">
                  {sesiones.map((s) => {
                    const lleno = s.disponibles === 0 && !s.reservaPropia;
                    return (
                      <li
                        key={s.clase.id}
                        className={`rounded-xl border p-4 transition ${
                          s.reservaPropia
                            ? "border-primary/40 bg-primary/[0.07]"
                            : "border-white/8 bg-white/[0.02] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-display text-base font-semibold uppercase tracking-wide text-white">
                              {s.clase.titulo}
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                              <Icono nombre="person" size={14} />
                              {s.clase.coach}
                            </p>
                          </div>
                          <span className="whitespace-nowrap font-mono text-[11px] tracking-wider text-primary">
                            {s.clase.hora}
                            <span className="block text-right text-muted-dim">
                              {sumarMinutos(s.clase.hora, s.clase.duracion)}
                            </span>
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span
                            className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
                              lleno ? "text-red-300" : "text-muted-dim"
                            }`}
                          >
                            {lleno ? "Sin cupos" : `${s.disponibles} de ${s.clase.cupo} cupos`}
                          </span>
                          <Link
                            href={`/alumnas/clase/${s.clase.id}?fecha=${s.fecha}`}
                            className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition hover:text-primary"
                          >
                            Detalle
                          </Link>
                        </div>

                        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-gold-gradient transition-all"
                            style={{
                              width: `${Math.min((s.reservadas / s.clase.cupo) * 100, 100)}%`,
                            }}
                          />
                        </div>

                        {s.pasada ? (
                          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-dim">
                            Clase finalizada
                          </p>
                        ) : s.reservaPropia ? (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="chip-gold flex-1 justify-center !py-2">
                              <Icono nombre="check_circle" size={14} />
                              Agendada
                            </span>
                            <button
                              type="button"
                              onClick={() => cancelar(s.reservaPropia!.id)}
                              className="btn-ghost !px-3 !py-2 text-[11px]"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={lleno}
                            onClick={() => onReservar(s.clase.id, s.fecha)}
                            className="btn-gold mt-3 w-full !py-2.5 text-xs"
                          >
                            {lleno ? "SIN CUPOS" : "AGENDAR"}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
