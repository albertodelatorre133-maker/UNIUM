"use client";

import { useEffect, useMemo, useState } from "react";
import { Icono } from "./Icono";
import { useStore, type SesionDelDia } from "@/lib/store";
import { DIAS, DIAS_CORTOS, addDays, dayIndex, hoyISO, MESES, startOfWeek, toISODate } from "@/lib/date";

export interface CalendarioSemanalProps {
  offset: number;
  onOffset: (siguiente: number) => void;
  /** Tarjeta de una clase; la decide cada portal (alumnas o admin). */
  renderClase: (sesion: SesionDelDia) => React.ReactNode;
  /** Contenido al pie de cada columna, p. ej. el formulario de nueva clase. */
  pieDia?: (day: number, fecha: string, activo: boolean) => React.ReactNode;
  filtrar?: (sesion: SesionDelDia) => boolean;
  vacio?: string;
}

/**
 * Rejilla semanal de 7 columnas en escritorio y selector de día + lista en
 * móvil, que es donde más se usa la aplicación.
 */
export function CalendarioSemanal({
  offset,
  onOffset,
  renderClase,
  pieDia,
  filtrar,
  vacio = "Sin clases",
}: CalendarioSemanalProps) {
  const { state, sesionesDeLaSemana } = useStore();
  const hoy = hoyISO();

  const lunes = addDays(startOfWeek(new Date()), offset * 7);
  const domingo = addDays(lunes, 6);
  const indiceHoy = offset === 0 ? dayIndex(new Date()) : -1;

  const [diaSel, setDiaSel] = useState(() => (indiceHoy >= 0 ? indiceHoy : 0));
  useEffect(() => {
    setDiaSel(offset === 0 ? dayIndex(new Date()) : 0);
  }, [offset]);

  const semana = sesionesDeLaSemana(offset);
  const porDia = useMemo(
    () => semana.map((sesiones) => (filtrar ? sesiones.filter(filtrar) : sesiones)),
    [semana, filtrar],
  );

  const rango =
    lunes.getMonth() === domingo.getMonth()
      ? `${lunes.getDate()} – ${domingo.getDate()} de ${MESES[lunes.getMonth()]}`
      : `${lunes.getDate()} ${MESES[lunes.getMonth()].slice(0, 3)} – ${domingo.getDate()} ${MESES[domingo.getMonth()].slice(0, 3)}`;

  const cfg = (d: number) => state.config.find((c) => c.day === d);

  return (
    <div className="space-y-4">
      {/* Barra de navegación de la semana */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Semana anterior"
            onClick={() => onOffset(offset - 1)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-muted transition hover:border-primary/40 hover:text-primary"
          >
            <Icono nombre="chevron_left" size={17} />
          </button>
          <button
            type="button"
            aria-label="Semana siguiente"
            onClick={() => onOffset(offset + 1)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-muted transition hover:border-primary/40 hover:text-primary"
          >
            <Icono nombre="chevron_right" size={17} />
          </button>
          <p className="ml-2 font-display text-base font-semibold uppercase tracking-[0.12em] text-white sm:text-lg">
            {rango}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOffset(0)}
          disabled={offset === 0}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted transition hover:border-primary/40 hover:text-primary disabled:opacity-35 disabled:hover:border-white/10 disabled:hover:text-muted"
        >
          Hoy
        </button>
      </div>

      {/* ---------- Móvil: tira de días + lista del día ---------- */}
      <div className="md:hidden">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DIAS.map((dia, d) => {
            const activo = cfg(d)?.activo ?? false;
            const esHoy = toISODate(addDays(lunes, d)) === hoy;
            const sel = d === diaSel;
            return (
              <button
                key={dia}
                type="button"
                onClick={() => setDiaSel(d)}
                aria-pressed={sel}
                className={`flex min-w-[62px] flex-col items-center gap-0.5 rounded-2xl border px-3 py-2.5 transition ${
                  sel
                    ? "border-primary/45 bg-primary/12 text-primary"
                    : "border-white/10 bg-white/[0.03] text-muted"
                } ${!activo ? "opacity-45" : ""}`}
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.16em]">
                  {DIAS_CORTOS[d]}
                </span>
                <span
                  className={`font-display text-xl font-bold leading-none ${
                    sel ? "text-primary" : esHoy ? "text-white" : "text-muted-soft"
                  }`}
                >
                  {addDays(lunes, d).getDate()}
                </span>
                <span
                  className={`mt-0.5 h-1 w-1 rounded-full ${
                    porDia[d].length ? (sel ? "bg-primary" : "bg-muted-dim") : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-semibold uppercase tracking-[0.14em] text-white">
              {DIAS[diaSel]} {addDays(lunes, diaSel).getDate()}
            </h3>
            <span className="chip">
              {cfg(diaSel)?.activo
                ? `${cfg(diaSel)!.apertura}–${cfg(diaSel)!.cierre}`
                : "Cerrado"}
            </span>
          </div>
          <div className="my-3 hairline" />

          {!cfg(diaSel)?.activo ? (
            <ColumnaVacia icono="do_not_disturb_on" texto="Día inactivo" />
          ) : porDia[diaSel].length === 0 ? (
            <ColumnaVacia icono="event_busy" texto={vacio} />
          ) : (
            <ul className="space-y-3">
              {porDia[diaSel].map((s) => (
                <li key={s.clase.id}>{renderClase(s)}</li>
              ))}
            </ul>
          )}

          {pieDia?.(diaSel, toISODate(addDays(lunes, diaSel)), cfg(diaSel)?.activo ?? false)}
        </div>
      </div>

      {/* ---------- Escritorio: rejilla de 7 columnas ---------- */}
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.015] md:block">
        <div className="grid grid-cols-7">
          {DIAS.map((dia, d) => {
            const config = cfg(d);
            const activo = config?.activo ?? false;
            const fecha = toISODate(addDays(lunes, d));
            const esHoy = fecha === hoy;

            return (
              <div
                key={dia}
                className={`flex min-w-0 flex-col border-white/[0.06] ${d < 6 ? "border-r" : ""} ${
                  activo ? "" : "bg-black/25"
                }`}
              >
                <div
                  className={`border-b px-2 pb-2.5 pt-3 text-center ${
                    esHoy ? "border-b-2 border-primary" : "border-white/10"
                  }`}
                >
                  <p
                    className={`font-mono text-[9.5px] uppercase tracking-[0.2em] ${
                      esHoy ? "text-primary" : "text-muted-dim"
                    }`}
                  >
                    {DIAS_CORTOS[d]}
                  </p>
                  <p
                    className={`font-display text-2xl font-bold leading-tight ${
                      esHoy ? "text-primary" : activo ? "text-white" : "text-muted-dim"
                    }`}
                  >
                    {addDays(lunes, d).getDate()}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-dim">
                    {activo ? `${config!.apertura} – ${config!.cierre}` : "Cerrado"}
                  </p>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-2">
                  {!activo ? (
                    <ColumnaVacia icono="do_not_disturb_on" texto="Día inactivo" compacta />
                  ) : porDia[d].length === 0 ? (
                    <ColumnaVacia icono="event_busy" texto={vacio} compacta />
                  ) : (
                    porDia[d].map((s) => <div key={s.clase.id}>{renderClase(s)}</div>)
                  )}

                  {pieDia?.(d, fecha, activo)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ColumnaVacia({
  icono,
  texto,
  compacta = false,
}: {
  icono: string;
  texto: string;
  compacta?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 text-center ${
        compacta ? "min-h-[92px] px-2 py-5" : "px-4 py-10"
      }`}
    >
      <Icono nombre={icono} size={compacta ? 16 : 22} className="text-muted-dim" />
      <p className="font-mono text-[9px] uppercase leading-tight tracking-[0.14em] text-muted-dim">
        {texto}
      </p>
    </div>
  );
}
