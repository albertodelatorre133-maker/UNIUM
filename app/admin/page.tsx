"use client";

import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/Icono";
import { useStore } from "@/lib/store";
import { COACHES } from "@/lib/seed";
import {
  DIAS,
  DIAS_CORTOS,
  addDays,
  franjasHorarias,
  hoyISO,
  MESES,
  startOfWeek,
  sumarMinutos,
  toISODate,
} from "@/lib/date";

const DURACIONES = [30, 45, 50, 60, 75, 90];

interface Borrador {
  titulo: string;
  descripcion: string;
  hora: string;
  duracion: number;
  coach: string;
  cupo: number;
  semanal: boolean;
}

function borradorInicial(hora: string): Borrador {
  return {
    titulo: "",
    descripcion: "",
    hora,
    duracion: 60,
    coach: COACHES[0].nombre,
    cupo: 12,
    semanal: true,
  };
}

export default function AdminCalendarioPage() {
  const { state, sesionesDeLaSemana, crearClase, eliminarClase } = useStore();
  const [offset, setOffset] = useState(0);
  const [diaEnEdicion, setDiaEnEdicion] = useState<number | null>(null);
  const [borrador, setBorrador] = useState<Borrador>(borradorInicial("07:00"));

  const semana = sesionesDeLaSemana(offset);
  const lunes = addDays(startOfWeek(new Date()), offset * 7);
  const hoy = hoyISO();

  const domingo = addDays(lunes, 6);
  const rango =
    lunes.getMonth() === domingo.getMonth()
      ? `${lunes.getDate()} – ${domingo.getDate()} de ${MESES[lunes.getMonth()]}`
      : `${lunes.getDate()} ${MESES[lunes.getMonth()].slice(0, 3)} – ${domingo.getDate()} ${MESES[domingo.getMonth()].slice(0, 3)}`;

  const totalClases = semana.flat().length;
  const totalReservas = semana.flat().reduce((acc, s) => acc + s.reservadas, 0);
  const totalCupos = semana.flat().reduce((acc, s) => acc + s.clase.cupo, 0);
  const ocupacion = totalCupos ? Math.round((totalReservas / totalCupos) * 100) : 0;

  function abrirFormulario(day: number) {
    const config = state.config.find((c) => c.day === day);
    if (!config?.activo) return;
    setDiaEnEdicion(day);
    setBorrador(borradorInicial(franjasHorarias(config.apertura, config.cierre)[0] ?? "07:00"));
  }

  function guardar(day: number) {
    if (!borrador.titulo.trim()) return;
    crearClase({
      titulo: borrador.titulo.trim(),
      descripcion:
        borrador.descripcion.trim() || "Sesión guiada por una coach del equipo UNIUM.",
      day,
      hora: borrador.hora,
      duracion: borrador.duracion,
      coach: borrador.coach,
      cupo: borrador.cupo,
      semanal: borrador.semanal,
      fecha: borrador.semanal ? null : toISODate(addDays(lunes, day)),
    });
    setDiaEnEdicion(null);
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <span className="eyebrow">Gestión de clases</span>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl">
            Calendario <span className="gold-text">semanal</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Los días inactivos se definen en{" "}
            <Link href="/admin/configuracion" className="text-primary hover:underline">
              Configuración del estudio
            </Link>
            . Solo puedes programar clases dentro del horario operativo de cada día.
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
          <div className="min-w-[180px] text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.14em]">
              {rango}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-dim">
              {offset === 0 ? "Semana actual" : "Otra semana"}
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icono: "event", valor: String(totalClases), etiqueta: "Clases programadas" },
          { icono: "how_to_reg", valor: String(totalReservas), etiqueta: "Reservas de la semana" },
          { icono: "chair", valor: String(totalCupos), etiqueta: "Cupos ofertados" },
          { icono: "trending_up", valor: `${ocupacion}%`, etiqueta: "Ocupación" },
        ].map((m) => (
          <div key={m.etiqueta} className="glass flex items-center gap-4 p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <Icono nombre={m.icono} size={16} />
            </span>
            <div>
              <p className="font-display text-2xl font-bold text-white">{m.valor}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-dim">
                {m.etiqueta}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {DIAS.map((dia, d) => {
          const config = state.config.find((c) => c.day === d);
          const inactivo = !config?.activo;
          const fecha = toISODate(addDays(lunes, d));
          const franjas = config ? franjasHorarias(config.apertura, config.cierre) : [];

          return (
            <div
              key={dia}
              className={`glass flex flex-col p-4 ${
                inactivo ? "border-dashed border-white/10 bg-transparent opacity-55" : ""
              } ${fecha === hoy ? "border-primary/40 shadow-gold" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">
                    {DIAS_CORTOS[d]}
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-white">
                    {addDays(lunes, d).getDate()}
                  </p>
                </div>
                {inactivo ? (
                  <span className="chip !text-[9px]">Cerrado</span>
                ) : (
                  <span className="chip !text-[9px]">
                    {config!.apertura}–{config!.cierre}
                  </span>
                )}
              </div>

              <div className="my-3 hairline" />

              <ul className="flex-1 space-y-2">
                {semana[d].map((s) => (
                  <li
                    key={s.clase.id}
                    className="group rounded-lg border border-white/8 bg-white/[0.03] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm font-semibold uppercase tracking-wide text-white">
                          {s.clase.titulo}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] tracking-wider text-primary">
                          {s.clase.hora}–{sumarMinutos(s.clase.hora, s.clase.duracion)}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Eliminar ${s.clase.titulo}`}
                        onClick={() => eliminarClase(s.clase.id)}
                        className="text-muted-dim opacity-0 transition hover:text-red-400 focus:opacity-100 group-hover:opacity-100"
                      >
                        <Icono nombre="delete" size={16} />
                      </button>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-muted-dim">{s.clase.coach}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                        {s.reservadas}/{s.clase.cupo}
                      </span>
                      <div className="flex items-center gap-2">
                        {s.clase.semanal && (
                          <span title="Se repite cada semana">
                            <Icono nombre="repeat" size={14} className="text-primary/70" />
                          </span>
                        )}
                        <Link
                          href={`/admin/asistencia?clase=${s.clase.id}&fecha=${s.fecha}`}
                          className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted transition hover:text-primary"
                        >
                          Asistencia
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}

                {semana[d].length === 0 && !inactivo && (
                  <li className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-dim">
                    Sin clases
                  </li>
                )}
              </ul>

              {diaEnEdicion === d ? (
                <form
                  className="mt-3 space-y-3 rounded-lg border border-primary/25 bg-primary/[0.05] p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    guardar(d);
                  }}
                >
                  <input
                    required
                    placeholder="Nombre de la clase"
                    className="w-full !px-3 !py-2 text-xs"
                    value={borrador.titulo}
                    onChange={(e) => setBorrador({ ...borrador, titulo: e.target.value })}
                  />
                  <textarea
                    rows={2}
                    placeholder="Descripción (opcional)"
                    className="w-full !px-3 !py-2 text-xs"
                    value={borrador.descripcion}
                    onChange={(e) => setBorrador({ ...borrador, descripcion: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="w-full !px-2 !py-2 text-xs"
                      value={borrador.hora}
                      onChange={(e) => setBorrador({ ...borrador, hora: e.target.value })}
                    >
                      {franjas.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <select
                      className="w-full !px-2 !py-2 text-xs"
                      value={borrador.duracion}
                      onChange={(e) =>
                        setBorrador({ ...borrador, duracion: Number(e.target.value) })
                      }
                    >
                      {DURACIONES.map((m) => (
                        <option key={m} value={m}>
                          {m} min
                        </option>
                      ))}
                    </select>
                  </div>
                  <select
                    className="w-full !px-2 !py-2 text-xs"
                    value={borrador.coach}
                    onChange={(e) => setBorrador({ ...borrador, coach: e.target.value })}
                  >
                    {COACHES.map((c) => (
                      <option key={c.nombre} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={40}
                      className="w-full !px-3 !py-2 text-xs"
                      value={borrador.cupo}
                      onChange={(e) => setBorrador({ ...borrador, cupo: Number(e.target.value) })}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-dim">
                      cupos
                    </span>
                  </div>
                  <label className="!mb-0 flex cursor-pointer items-center gap-2 !text-[10px] !normal-case !tracking-normal">
                    <input
                      type="checkbox"
                      className="h-4 w-4 !p-0 accent-[#d4af37]"
                      checked={borrador.semanal}
                      onChange={(e) => setBorrador({ ...borrador, semanal: e.target.checked })}
                    />
                    <span className="font-mono uppercase tracking-[0.14em]">Repetir cada semana</span>
                  </label>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-gold flex-1 !py-2 text-[11px]">
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="btn-ghost !px-3 !py-2 text-[11px]"
                      onClick={() => setDiaEnEdicion(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  disabled={inactivo}
                  onClick={() => abrirFormulario(d)}
                  className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icono nombre="add" size={16} />
                  {inactivo ? "Día cerrado" : "Nueva clase"}
                </button>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
