"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Icono } from "@/components/Icono";
import { Cargando } from "@/components/Guard";
import { useStore } from "@/lib/store";
import { addDays, formatoLargo, hoyISO, MESES, startOfWeek, sumarMinutos } from "@/lib/date";

function ControlAsistencia() {
  const search = useSearchParams();
  const {
    sesionesDeLaSemana,
    sesion,
    reservasDeSesion,
    marcarAsistencia,
    nombreCoach,
    esperaDeSesion,
    registrarDesdeEspera,
    salirListaEspera,
  } = useStore();
  const [avisoEspera, setAvisoEspera] = useState<string | null>(null);

  const semana = sesionesDeLaSemana(0);
  const sesiones = useMemo(() => semana.flat(), [semana]);

  const inicial = useMemo(() => {
    const claseParam = search.get("clase");
    const fechaParam = search.get("fecha");
    if (claseParam && fechaParam) return `${claseParam}|${fechaParam}`;
    const hoy = hoyISO();
    const deHoy = sesiones.find((s) => s.fecha === hoy);
    const alguna = deHoy ?? sesiones[0];
    return alguna ? `${alguna.clase.id}|${alguna.fecha}` : "";
  }, [search, sesiones]);

  const [seleccion, setSeleccion] = useState(inicial);
  const [classId, fecha] = (seleccion || inicial).split("|");
  const actual = classId && fecha ? sesion(classId, fecha) : null;
  const lista = actual ? reservasDeSesion(classId, fecha) : [];
  const presentes = lista.filter((r) => r.booking.asistio).length;
  const espera = actual ? esperaDeSesion(classId, fecha) : [];

  const lunes = startOfWeek(new Date());

  async function registrar(entryId: string) {
    setAvisoEspera(null);
    const r = await registrarDesdeEspera(entryId);
    if (!r.ok) setAvisoEspera(r.error ?? "No fue posible registrar la reserva.");
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <span className="eyebrow">Clase en curso</span>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
            Control de <span className="gold-text">asistencia</span>
          </h1>
          <p className="mt-2 max-w-xl text-[13px] text-muted sm:text-sm">
            Selecciona una sesión de la semana y marca la asistencia de cada alumna en tiempo real.
          </p>
        </div>

        <div className="w-full xl:max-w-md">
          <label htmlFor="sesion">Sesión</label>
          <select
            id="sesion"
            className="w-full"
            value={seleccion || inicial}
            onChange={(e) => setSeleccion(e.target.value)}
          >
            {sesiones.length === 0 && <option value="">No hay clases esta semana</option>}
            {sesiones.map((s) => (
              <option key={`${s.clase.id}|${s.fecha}`} value={`${s.clase.id}|${s.fecha}`}>
                {formatoLargo(s.fecha)} · {s.clase.hora} · {s.clase.titulo}
              </option>
            ))}
          </select>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-dim">
            Semana del {lunes.getDate()} de {MESES[lunes.getMonth()]} al{" "}
            {addDays(lunes, 6).getDate()} de {MESES[addDays(lunes, 6).getMonth()]}
          </p>
        </div>
      </header>

      {!actual ? (
        <div className="glass p-16 text-center">
          <Icono nombre="event_busy" size={36} className="text-muted-dim" />
          <p className="mt-3 text-sm text-muted">
            No hay una sesión seleccionada para mostrar asistencia.
          </p>
        </div>
      ) : (
        <>
          <section className="glass-strong flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip-gold">{formatoLargo(actual.fecha)}</span>
                <span className="chip">
                  {actual.clase.hora} – {sumarMinutos(actual.clase.hora, actual.clase.duracion)}
                </span>
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                {actual.clase.titulo}
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                <Icono nombre="person" size={16} />
                {nombreCoach(actual.clase.coachId)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { valor: actual.reservadas, etiqueta: "Reservadas" },
                { valor: presentes, etiqueta: "Presentes" },
                { valor: actual.reservadas - presentes, etiqueta: "Pendientes" },
              ].map((m) => (
                <div
                  key={m.etiqueta}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3.5 text-center sm:px-5 sm:py-4"
                >
                  <p className="font-display text-3xl font-bold gold-text">{m.valor}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-dim">
                    {m.etiqueta}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass p-5 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold uppercase tracking-wide">
                Lista de reservas
              </h3>
              <span className="chip">
                {presentes}/{actual.reservadas} presentes
              </span>
            </div>

            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gold-gradient transition-all duration-500"
                style={{
                  width: `${actual.reservadas ? (presentes / actual.reservadas) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="my-6 hairline" />

            {lista.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted">
                Todavía no hay reservas para esta sesión.
              </p>
            ) : (
              <ul className="space-y-3">
                {lista.map(({ booking, alumna }) => (
                  <li
                    key={booking.id}
                    className={`flex flex-col gap-3 rounded-xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                      booking.asistio
                        ? "border-primary/35 bg-primary/[0.07]"
                        : "border-white/8 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/25 bg-primary/10 font-mono text-[11px] text-primary">
                        {alumna.nombre
                          .split(" ")
                          .slice(0, 2)
                          .map((p) => p[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{alumna.nombre}</p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-dim">
                          {alumna.telefono}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => marcarAsistencia(booking.id, true)}
                        className={
                          booking.asistio
                            ? "btn-gold !px-4 !py-2 text-xs"
                            : "btn-ghost !px-4 !py-2 text-xs"
                        }
                      >
                        <Icono nombre="check" size={16} />
                        {booking.asistio ? "ASISTIÓ" : "Marcar asistencia"}
                      </button>
                      {booking.asistio && (
                        <button
                          type="button"
                          aria-label="Deshacer asistencia"
                          onClick={() => marcarAsistencia(booking.id, false)}
                          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-muted transition hover:border-red-500/40 hover:text-red-300"
                        >
                          <Icono nombre="undo" size={16} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {espera.length > 0 && (
            <section className="glass p-5 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold uppercase tracking-wide">
                  Lista de espera
                </h3>
                <span className="chip">{espera.length} en espera</span>
              </div>
              <p className="mt-2 max-w-2xl text-[13px] text-muted">
                Alumnas que quieren un cupo en esta sesión si se libera uno. Regístralas manualmente
                cuando cancele alguien.
              </p>

              {avisoEspera && (
                <p className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                  <Icono nombre="error" size={15} />
                  {avisoEspera}
                </p>
              )}

              <div className="my-6 hairline" />

              <ul className="space-y-3">
                {espera.map(({ entrada, alumna }, i) => (
                  <li
                    key={entrada.id}
                    className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4 transition sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 font-mono text-[11px] text-muted-dim">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{alumna.nombre}</p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-dim">
                          {alumna.telefono}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => registrar(entrada.id)}
                        disabled={actual.disponibles === 0}
                        className="btn-gold !px-4 !py-2 text-xs disabled:opacity-40"
                      >
                        <Icono nombre="check" size={16} />
                        Registrar
                      </button>
                      <button
                        type="button"
                        aria-label={`Quitar a ${alumna.nombre} de la lista de espera`}
                        onClick={() => salirListaEspera(entrada.id)}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-muted transition hover:border-red-500/40 hover:text-red-300"
                      >
                        <Icono nombre="close" size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default function AsistenciaPage() {
  return (
    <Suspense fallback={<Cargando />}>
      <ControlAsistencia />
    </Suspense>
  );
}
