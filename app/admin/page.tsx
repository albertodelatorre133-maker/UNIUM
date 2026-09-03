"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Icono } from "@/components/Icono";
import { CalendarioSemanal } from "@/components/CalendarioSemanal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useStore, type SesionDelDia } from "@/lib/store";
import { addDays, franjasHorarias, startOfWeek, sumarMinutos, toISODate } from "@/lib/date";

interface Borrador {
  titulo: string;
  descripcion: string;
  hora: string;
  duracion: number;
  coachId: string;
  cupo: number;
  semanal: boolean;
}

const BORRADOR_BASE: Omit<Borrador, "hora" | "coachId"> = {
  titulo: "",
  descripcion: "",
  duracion: 60,
  cupo: 12,
  semanal: true,
};

export default function AdminCalendarioPage() {
  const { state, sesionesDeLaSemana, crearClase, actualizarClase, eliminarClase, nombreCoach } =
    useStore();
  const coachesActivas = state.coaches.filter((c) => c.activa);
  const [offset, setOffset] = useState(0);
  const [diaEnEdicion, setDiaEnEdicion] = useState<number | null>(null);
  const [claseEditando, setClaseEditando] = useState<string | null>(null);
  const [borrador, setBorrador] = useState<Borrador>({
    ...BORRADOR_BASE,
    hora: "07:00",
    coachId: coachesActivas[0]?.id ?? "",
  });
  const [porEliminar, setPorEliminar] = useState<{ id: string; titulo: string } | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  async function confirmarEliminarClase() {
    if (!porEliminar) return;
    setEliminando(true);
    try {
      await eliminarClase(porEliminar.id);
    } catch (e) {
      setErrorEliminar(e instanceof Error ? e.message : "No fue posible eliminar la clase.");
    } finally {
      setEliminando(false);
      setPorEliminar(null);
    }
  }

  const semana = sesionesDeLaSemana(offset);
  const lunes = addDays(startOfWeek(new Date()), offset * 7);

  const todas = semana.flat();
  const totalReservas = todas.reduce((acc, s) => acc + s.reservadas, 0);
  const totalCupos = todas.reduce((acc, s) => acc + s.clase.cupo, 0);
  const ocupacion = totalCupos ? Math.round((totalReservas / totalCupos) * 100) : 0;

  function abrirFormulario(day: number) {
    const config = state.config.find((c) => c.day === day);
    if (!config?.activo) return;
    setClaseEditando(null);
    setDiaEnEdicion(day);
    setBorrador({
      ...BORRADOR_BASE,
      hora: franjasHorarias(config.apertura, config.cierre)[0] ?? "07:00",
      coachId: coachesActivas[0]?.id ?? "",
    });
  }

  function abrirEdicion(s: SesionDelDia) {
    setClaseEditando(s.clase.id);
    setDiaEnEdicion(s.clase.day);
    setBorrador({
      titulo: s.clase.titulo,
      descripcion: s.clase.descripcion,
      hora: s.clase.hora,
      duracion: s.clase.duracion,
      coachId: s.clase.coachId,
      cupo: s.clase.cupo,
      semanal: s.clase.semanal,
    });
  }

  async function guardar(day: number) {
    if (!borrador.titulo.trim()) return;
    const datos = {
      titulo: borrador.titulo.trim(),
      descripcion: borrador.descripcion.trim() || "Sesión guiada por una coach del equipo UNIUM.",
      day,
      hora: borrador.hora,
      duracion: borrador.duracion,
      coachId: borrador.coachId,
      cupo: borrador.cupo,
      semanal: borrador.semanal,
      fecha: borrador.semanal ? null : toISODate(addDays(lunes, day)),
    };
    if (claseEditando) {
      await actualizarClase(claseEditando, datos);
    } else {
      await crearClase(datos);
    }
    setDiaEnEdicion(null);
    setClaseEditando(null);
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
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-[10px] tracking-wider ${
                  lleno ? "text-primary" : "text-muted-dim"
                }`}
              >
                {s.reservadas}/{s.clase.cupo}
              </span>
              <div className="flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.02] p-0.5 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100 max-lg:opacity-100">
                <button
                  type="button"
                  aria-label={`Editar ${s.clase.titulo}`}
                  onClick={() => abrirEdicion(s)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-dim transition hover:bg-primary/10 hover:text-primary"
                >
                  <Icono nombre="edit" size={14} />
                </button>
                <button
                  type="button"
                  aria-label={`Eliminar ${s.clase.titulo}`}
                  onClick={() => {
                    setErrorEliminar(null);
                    setPorEliminar({ id: s.clase.id, titulo: s.clase.titulo });
                  }}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-dim transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <Icono nombre="delete" size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <h4 className="font-display text-[15px] font-semibold uppercase leading-tight tracking-wide text-white">
              {s.clase.titulo}
            </h4>
            <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-muted">
              <Icono nombre="person" size={12} />
              {nombreCoach(s.clase.coachId)}
            </p>
          </div>

          {lleno && s.enEspera > 0 && (
            <span
              title="Horario saturado: hay alumnas anotadas a la espera de un cupo"
              className="mt-2 flex w-fit items-center gap-1.5 rounded-md bg-red-500/12 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-red-300"
            >
              <Icono nombre="schedule" size={11} />
              +{s.enEspera} en espera
            </span>
          )}

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
                className="flex items-center gap-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted transition hover:text-primary"
              >
                Ver asistencia
                <Icono nombre="chevron_right" size={11} />
              </Link>
            </div>
          </div>
        </article>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eliminarClase, nombreCoach],
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
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-primary">
            {claseEditando ? "Editar clase" : "Nueva clase"}
          </p>
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
            <div className="relative">
              <input
                type="number"
                min={15}
                max={240}
                step={5}
                aria-label="Duración en minutos"
                className="w-full !py-2 !pl-2 !pr-11 text-xs"
                value={borrador.duracion || ""}
                onChange={(e) =>
                  setBorrador({ ...borrador, duracion: e.target.value === "" ? 0 : Number(e.target.value) })
                }
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase text-muted-dim">
                min
              </span>
            </div>
          </div>
          <select
            className="w-full !px-2 !py-2 text-xs"
            aria-label="Coach"
            value={borrador.coachId}
            onChange={(e) => setBorrador({ ...borrador, coachId: e.target.value })}
          >
            {coachesActivas.length === 0 && <option value="">Sin coaches activas</option>}
            {coachesActivas.map((c) => (
              <option key={c.id} value={c.id}>
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
              value={borrador.cupo || ""}
              onChange={(e) =>
                setBorrador({ ...borrador, cupo: e.target.value === "" ? 0 : Number(e.target.value) })
              }
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
              {claseEditando ? "Guardar cambios" : "Guardar"}
            </button>
            <button
              type="button"
              className="btn-ghost !rounded-lg !px-3 !py-2 text-[10.5px]"
              onClick={() => {
                setDiaEnEdicion(null);
                setClaseEditando(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [diaEnEdicion, claseEditando, borrador, state.config, lunes],
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

      {errorEliminar && (
        <p className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          <Icono nombre="error" size={15} />
          {errorEliminar}
        </p>
      )}

      <CalendarioSemanal
        offset={offset}
        onOffset={(n) => {
          setOffset(n);
          setDiaEnEdicion(null);
          setClaseEditando(null);
        }}
        renderClase={renderClase}
        pieDia={pieDia}
      />

      {porEliminar && (
        <ConfirmDialog
          titulo="¿Eliminar esta clase?"
          mensaje={`Se elimina "${porEliminar.titulo}" y las reservas que tenga. No se puede deshacer.`}
          confirmarTexto="Sí, eliminar"
          cargando={eliminando}
          onConfirmar={confirmarEliminarClase}
          onCancelar={() => setPorEliminar(null)}
        />
      )}
    </div>
  );
}
