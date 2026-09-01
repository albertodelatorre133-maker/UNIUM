"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icono } from "@/components/Icono";
import { useStore } from "@/lib/store";
import { formatoLargo, hoyISO, sumarMinutos } from "@/lib/date";
import { hayBaseDeDatos } from "@/lib/supabase/cliente";
import { activarNotificaciones, desactivarNotificaciones, notificacionesActivas } from "@/lib/push";

function NotificacionesPush() {
  const [activo, setActivo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    notificacionesActivas().then(setActivo);
  }, []);

  async function alternar() {
    setError(null);
    setCargando(true);
    if (activo) {
      await desactivarNotificaciones();
      setActivo(false);
    } else {
      const r = await activarNotificaciones();
      if (r.ok) setActivo(true);
      else setError(r.error ?? "No fue posible activar las notificaciones.");
    }
    setCargando(false);
  }

  return (
    <section className="glass p-5 sm:p-7">
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        disabled={cargando}
        onClick={alternar}
        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-60 ${
          activo ? "border-primary/40 bg-primary/10" : "border-white/10 bg-white/[0.02]"
        }`}
      >
        <span
          className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
            activo ? "border-primary/50 bg-primary/25" : "border-white/15 bg-white/[0.05]"
          }`}
        >
          <span
            className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all ${
              activo ? "left-[25px] bg-gold-gradient" : "left-1 bg-muted-dim"
            }`}
          />
        </span>
        <span className="min-w-0">
          <span className={`block text-[13px] font-semibold ${activo ? "text-primary" : "text-muted-soft"}`}>
            Notificaciones en este dispositivo
          </span>
          <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-muted-dim">
            Avisos de tus clases, cupos liberados y promociones
          </span>
        </span>
      </button>
      {error && (
        <p className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          <Icono nombre="error" size={15} />
          {error}
        </p>
      )}
    </section>
  );
}

export default function PerfilPage() {
  const { usuario, reservasDeUsuario, cancelar, ultimaAsistencia, nombreCoach } = useStore();

  const reservas = usuario ? reservasDeUsuario(usuario.id) : [];
  const hoy = hoyISO();

  const { proximas, pasadas } = useMemo(() => {
    return {
      proximas: reservas.filter((r) => r.booking.fecha >= hoy),
      pasadas: reservas.filter((r) => r.booking.fecha < hoy).reverse(),
    };
  }, [reservas, hoy]);

  const asistidas = reservas.filter((r) => r.booking.asistio).length;
  const ultima = usuario ? ultimaAsistencia(usuario.id) : null;

  if (!usuario) return null;

  return (
    <div className="space-y-8">
      <header>
        <span className="eyebrow">Mi perfil</span>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
          {usuario.nombre}
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <aside className="space-y-6">
          <section className="glass-strong p-5 sm:p-7">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-full border border-primary/30 bg-gold-gradient font-display text-xl font-bold text-ink-900">
                {usuario.nombre
                  .split(" ")
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()}
              </span>
              <div>
                <p className="font-display text-lg font-semibold uppercase tracking-wide">
                  {usuario.nombre}
                </p>
                <span className="chip-gold mt-1">Alumna activa</span>
              </div>
            </div>

            <div className="my-6 hairline" />

            <dl className="space-y-4 text-sm">
              {[
                { icono: "mail", etiqueta: "Correo", valor: usuario.email },
                { icono: "call", etiqueta: "Teléfono", valor: usuario.telefono },
                {
                  icono: "event_available",
                  etiqueta: "Última asistencia",
                  valor: ultima ? formatoLargo(ultima) : "Sin registro",
                },
              ].map((d) => (
                <div key={d.etiqueta} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-primary">
                    <Icono nombre={d.icono} size={16} />
                  </span>
                  <div className="min-w-0">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-dim">
                      {d.etiqueta}
                    </dt>
                    <dd className="truncate text-white">{d.valor}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          <section className="grid grid-cols-2 gap-4">
            {[
              { valor: proximas.length, etiqueta: "Próximas clases" },
              { valor: asistidas, etiqueta: "Clases asistidas" },
            ].map((m) => (
              <div key={m.etiqueta} className="glass p-5 text-center">
                <p className="font-display text-3xl font-bold gold-text">{m.valor}</p>
                <p className="mt-1 font-mono text-[10px] uppercase leading-tight tracking-[0.14em] text-muted-dim">
                  {m.etiqueta}
                </p>
              </div>
            ))}
          </section>

          {hayBaseDeDatos() && <NotificacionesPush />}
        </aside>

        <div className="space-y-6">
          <section className="glass p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">
                Próximas clases
              </h2>
              <Link href="/alumnas" className="btn-ghost !px-4 !py-2 text-xs">
                <Icono nombre="add" size={16} />
                Agendar
              </Link>
            </div>
            <div className="my-5 hairline" />

            {proximas.length === 0 ? (
              <div className="py-10 text-center">
                <Icono nombre="event_busy" size={36} className="text-muted-dim" />
                <p className="mt-3 text-sm text-muted">Aún no tienes clases agendadas.</p>
                <Link href="/alumnas" className="btn-gold mt-5">
                  VER CALENDARIO
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {proximas.map(({ booking, clase }) => (
                  <li
                    key={booking.id}
                    className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary/30 bg-ink-800 font-mono text-[11px] text-primary">
                        {clase.hora}
                      </div>
                      <div>
                        <p className="font-display text-base font-semibold uppercase tracking-wide text-white">
                          {clase.titulo}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {formatoLargo(booking.fecha)} · {nombreCoach(clase.coachId)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/alumnas/clase/${clase.id}?fecha=${booking.fecha}`}
                        className="btn-ghost !px-4 !py-2 text-xs"
                      >
                        Detalle
                      </Link>
                      <button
                        type="button"
                        onClick={() => cancelar(booking.id)}
                        className="btn-danger !px-4 !py-2 text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="glass p-5 sm:p-7">
            <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">
              Clases pasadas
            </h2>
            <div className="my-5 hairline" />

            {pasadas.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">Todavía no hay historial.</p>
            ) : (
              <ul className="divide-y divide-white/8">
                {pasadas.slice(0, 12).map(({ booking, clase }) => (
                  <li key={booking.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-semibold uppercase tracking-wide text-muted-soft">
                        {clase.titulo}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-dim">
                        {formatoLargo(booking.fecha)} · {clase.hora}–
                        {sumarMinutos(clase.hora, clase.duracion)}
                      </p>
                    </div>
                    <span
                      className={
                        booking.asistio
                          ? "chip-gold"
                          : "chip border-white/10 text-muted-dim"
                      }
                    >
                      {booking.asistio ? "Asistió" : "No asistió"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
