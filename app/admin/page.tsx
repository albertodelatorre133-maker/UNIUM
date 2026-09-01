"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Icono } from "@/components/Icono";
import { CalendarioSemanal } from "@/components/CalendarioSemanal";
import { useStore, type SesionDelDia } from "@/lib/store";
import { COACHES } from "@/lib/seed";
import { addDays, franjasHorarias, startOfWeek, sumarMinutos, toISODate } from "@/lib/date";

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

const BORRADOR_BASE: Omit<Borrador, "hora"> = {
  titulo: "",
  descripcion: "",
  duracion: 60,
  coach: COACHES[0].nombre,
  cupo: 12,
  semanal: true,
};

export default function AdminCalendarioPage() {
  const { state, sesionesDeLaSemana, crearClase, eliminarClase } = useStore();
  const [offset, setOffset] = useState(0);
  const [diaEnEdicion, setDiaEnEdicion] = useState<number | null>(null);
  const [borrador, setBorrador] = useState<Borrador>({ ...BORRADOR_BASE, hora: "07:00" });

  const semana = sesionesDeLaSemana(offset);
  const lunes = addDays(startOfWeek(new Date()), offset * 7);

  const todas = semana.flat();
  const totalReservas = todas.reduce((acc, s) => acc + s.reservadas, 0);
  const totalCupos = todas.reduce((acc, s) => acc + s.clase.cupo, 0);
  const ocupacion = totalCupos ? Math.round((totalReservas / totalCupos) * 100) : 0;

  function abrirFormulario(day: number) {
    const config = state.config.find((c) => c.day === day);
    if (!config?.activo) return;
    setDiaEnEdicion(day);
    setBorrador({
      ...BORRADOR_BASE,
      hora: franjasHorarias(config.apertura, config.cierre)[0] ?? "07:00",
    });
  }

  async function guardar(day: number) {
    if (!borrador.titulo.trim()) return;
    await crearClase({
      titulo: borrador.titulo.trim(),
      descripcion: borrador.descripcion.trim() || "Sesión guiada por una coach del equipo UNIUM.",
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

  const renderClase = useCallback(
    (s: SesionDelDia) => {
      const lleno = s.disponibles === 0;
      return (
        <article className="group rounded-xl border border-white/8 bg-white/[0.03] p-3 transition hover:border-white/20">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-md bg-primary/12 px-2 py-0.5 font-mono text-[10.5px] tracking-wider text-primary">
              {s.clase.hora}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`font-mono text-[10px] tracking-wider ${
                  lleno ? "text-primary" : "text-muted-dim"
                }`}
              >
                {s.reservadas}/{s.clase.cupo}
              </span>
              <button
                type="button"
                aria-label={`Eliminar ${s.clase.titulo}`}
                onClick={() => eliminarClase(s.clase.id)}
                className="text-muted-dim opacity-0 transition hover:text-red-400 focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-100"
              >
                <Icono nombre="delete" size={14} />
              </button>
            </div>
          </div>

          <h4 className="mt-2 font-display text-[15px] font-semibold uppercase leading-tight tracking-wide text-white">
            {s.clase.titulo}
          </h4>
          <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-muted">
            <Icono nombre="person" size={12} />
            {s.clase.coach}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-dim">
              {s.clase.hora}–{sumarMinutos(s.clase.hora, s.clase.duracion)}
            </span>
            <div className="flex items-center gap-2">
              {s.clase.semanal && (
                <span title="Se repite cada semana">
                  <Icono nombre="repeat" size={12} className="text-primary/70" />
                </span>
              )}
              <Link
                href={`/admin/asistencia?clase=${s.clase.id}&fecha=${s.fecha}`}
                className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted transition hover:text-primary"
              >
                Asistencia
              </Link>
            </div>
          </div>
        </article>
      );
    },
    [eliminarClase],
  );

  const pieDia = useCallback(
    (day: number, _fecha: string, activo: boolean) => {
      if (!activo) return null;
      const config = state.config.find((c) => c.day === day);
      const franjas = config ? franjasHorarias(config.apertura, config.cierre) : [];

      if (diaEnEdicion !== day) {
        return (
          <button
            type="button"
            onClick={() => abrirFormulario(day)}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted transition hover:border-primary/50 hover:text-primary"
          >
            <Icono nombre="add" size={14} />
            Nueva clase
          </button>
        );
      }

      return (
        <form
          className="mt-1 space-y-2.5 rounded-xl border border-primary/25 bg-primary/[0.06] p-3"
          onSubmit={(e) => {
            e.preventDefault();
            guardar(day);
          }}
        >
          <input
            required
            autoFocus
            placeholder="Nombre de la clase"
            className="w-full !px-3 !py-2 text-xs"
            value={borrador.titulo}
            onChange={(e) => setBorrador({ ...borrador, titulo: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              className="w-full !px-2 !py-2 text-xs"
              aria-label="Hora"
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
              aria-label="Duración"
              value={borrador.duracion}
              onChange={(e) => setBorrador({ ...borrador, duracion: Number(e.target.value) })}
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
            aria-label="Coach"
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
              aria-label="Cupos"
              className="w-full !px-3 !py-2 text-xs"
              value={borrador.cupo}
              onChange={(e) => setBorrador({ ...borrador, cupo: Number(e.target.value) })}
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-dim">
              cupos
            </span>
          </div>
          <label className="!mb-0 flex cursor-pointer items-center gap-2 !text-[9px] !tracking-[0.12em]">
            <input
              type="checkbox"
              className="h-4 w-4 !p-0 accent-[#d4af37]"
              checked={borrador.semanal}
              onChange={(e) => setBorrador({ ...borrador, semanal: e.target.checked })}
            />
            Repetir cada semana
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-gold flex-1 !rounded-lg !py-2 text-[10.5px]">
              Guardar
            </button>
            <button
              type="button"
              className="btn-ghost !rounded-lg !px-3 !py-2 text-[10.5px]"
              onClick={() => setDiaEnEdicion(null)}
            >
              Cancelar
            </button>
          </div>
        </form>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [diaEnEdicion, borrador, state.config, lunes],
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <header>
        <span className="eyebrow hidden sm:block">Gestión de clases</span>
        <h1 className="font-display text-[28px] font-bold uppercase tracking-tight sm:mt-2 sm:text-4xl lg:text-5xl">
          Calendario <span className="gold-text">semanal</span>
        </h1>
        <p className="mt-2 hidden max-w-2xl text-[13px] text-muted sm:block sm:text-sm">
          Los días inactivos se definen en{" "}
          <Link href="/admin/configuracion" className="text-primary hover:underline">
            Configuración del estudio
          </Link>
          . Solo puedes programar clases dentro del horario operativo de cada día.
        </p>
      </header>

      <section className="grid grid-cols-4 gap-2 sm:gap-3 xl:grid-cols-4">
        {[
          { icono: "event", valor: String(todas.length), etiqueta: "Clases" },
          { icono: "how_to_reg", valor: String(totalReservas), etiqueta: "Reservas" },
          { icono: "chair", valor: String(totalCupos), etiqueta: "Cupos" },
          { icono: "trending_up", valor: `${ocupacion}%`, etiqueta: "Ocupación" },
        ].map((m) => (
          <div
            key={m.etiqueta}
            className="glass flex flex-col items-center gap-1 p-3 text-center sm:flex-row sm:gap-4 sm:p-5 sm:text-left"
          >
            <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary sm:grid">
              <Icono nombre={m.icono} size={16} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-bold text-white sm:text-2xl">{m.valor}</p>
              <p className="truncate font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-dim sm:text-[9px] sm:tracking-[0.14em]">
                {m.etiqueta}
              </p>
            </div>
          </div>
        ))}
      </section>

      <CalendarioSemanal
        offset={offset}
        onOffset={(n) => {
          setOffset(n);
          setDiaEnEdicion(null);
        }}
        renderClase={renderClase}
        pieDia={pieDia}
      />
    </div>
  );
}
