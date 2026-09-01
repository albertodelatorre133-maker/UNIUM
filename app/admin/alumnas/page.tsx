"use client";

import { useMemo, useState } from "react";
import { Icono } from "@/components/Icono";
import { useStore } from "@/lib/store";
import { diasDesde, formatoCorto } from "@/lib/date";

type Filtro = "todas" | "activas" | "inactivas";

const FILTROS: Array<{ id: Filtro; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "activas", label: "Activas" },
  { id: "inactivas", label: "Inactivas" },
];

export default function DirectorioAlumnasPage() {
  const { alumnas, state, ultimaAsistencia, cambiarEstadoAlumna } = useStore();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const filas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return alumnas
      .map((a) => {
        const ultima = ultimaAsistencia(a.id);
        return {
          alumna: a,
          ultima,
          dias: diasDesde(ultima),
          reservas: state.bookings.filter((b) => b.userId === a.id).length,
          asistencias: state.bookings.filter((b) => b.userId === a.id && b.asistio).length,
        };
      })
      .filter((f) => {
        if (filtro === "activas" && !f.alumna.activa) return false;
        if (filtro === "inactivas" && f.alumna.activa) return false;
        if (!q) return true;
        return (
          f.alumna.nombre.toLowerCase().includes(q) ||
          f.alumna.email.toLowerCase().includes(q) ||
          f.alumna.telefono.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.alumna.nombre.localeCompare(b.alumna.nombre));
  }, [alumnas, busqueda, filtro, state.bookings, ultimaAsistencia]);

  const activas = alumnas.filter((a) => a.activa).length;

  return (
    <div className="space-y-8">
      <header>
        <span className="eyebrow">Directorio · CRM</span>
        <h1 className="font-display text-[28px] font-bold uppercase tracking-tight sm:mt-2 sm:text-4xl lg:text-5xl">
          Alumnas del <span className="gold-text">estudio</span>
        </h1>
        <p className="mt-2 text-[13px] text-muted sm:text-sm">
          {alumnas.length} alumnas registradas · {activas} activas
        </p>
      </header>

      <section className="glass flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-dim">
            <Icono nombre="search" size={16} />
          </span>
          <input
            type="search"
            placeholder="Buscar por nombre, correo o teléfono"
            className="w-full !pl-12"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar alumnas"
          />
        </div>

        <div className="flex gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={`rounded-xl border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] transition ${
                filtro === f.id
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/[0.03] text-muted hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Móvil: una tarjeta por alumna en lugar de una tabla con scroll lateral */}
      <section className="grid gap-3 lg:hidden">
        {filas.map((f) => (
          <article key={f.alumna.id} className="glass p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/25 bg-primary/10 font-mono text-[11px] text-primary">
                  {f.alumna.nombre
                    .split(" ")
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{f.alumna.nombre}</p>
                  <p className="truncate text-[12px] text-muted">{f.alumna.email}</p>
                </div>
              </div>
              <span
                className={f.alumna.activa ? "chip-gold" : "chip border-white/10 text-muted-dim"}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    f.alumna.activa ? "bg-primary" : "bg-muted-dim"
                  }`}
                />
                {f.alumna.activa ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="my-3.5 hairline" />

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="font-display text-lg font-bold text-white">{f.reservas}</p>
                <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-dim">
                  Reservas
                </p>
              </div>
              <div>
                <p className="font-display text-lg font-bold text-white">{f.asistencias}</p>
                <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-dim">
                  Asistencias
                </p>
              </div>
              <div>
                <p className="font-mono text-[12px] text-white">
                  {f.ultima ? formatoCorto(f.ultima) : "—"}
                </p>
                <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-dim">
                  {f.dias === null ? "Sin registro" : f.dias === 0 ? "Hoy" : `Hace ${f.dias} días`}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <a
                href={`tel:${f.alumna.telefono.replace(/\s/g, "")}`}
                className="btn-ghost flex-1 !py-2 text-[11px]"
              >
                <Icono nombre="call" size={13} />
                Llamar
              </a>
              <button
                type="button"
                onClick={() => cambiarEstadoAlumna(f.alumna.id)}
                className="btn-ghost flex-1 !py-2 text-[11px]"
              >
                {f.alumna.activa ? "Desactivar" : "Activar"}
              </button>
            </div>
          </article>
        ))}

        {filas.length === 0 && (
          <div className="glass px-6 py-14 text-center">
            <Icono nombre="person_search" size={30} className="mx-auto text-muted-dim" />
            <p className="mt-3 text-sm text-muted">
              No hay alumnas que coincidan con la búsqueda.
            </p>
          </div>
        )}
      </section>

      <section className="glass hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-white/10">
                {["Alumna", "Contacto", "Estado", "Última asistencia", "Reservas", ""].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-dim"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr
                  key={f.alumna.id}
                  className="border-b border-white/5 transition last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/25 bg-primary/10 font-mono text-[11px] text-primary">
                        {f.alumna.nombre
                          .split(" ")
                          .slice(0, 2)
                          .map((p) => p[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{f.alumna.nombre}</p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-dim">
                          {f.asistencias} asistencias
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-soft">{f.alumna.email}</p>
                    <p className="font-mono text-[11px] text-muted-dim">{f.alumna.telefono}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        f.alumna.activa ? "chip-gold" : "chip border-white/10 text-muted-dim"
                      }
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          f.alumna.activa ? "bg-primary" : "bg-muted-dim"
                        }`}
                      />
                      {f.alumna.activa ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {f.ultima ? (
                      <>
                        <p className="font-mono text-xs text-white">{formatoCorto(f.ultima)}</p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-dim">
                          {f.dias === 0 ? "Hoy" : `Hace ${f.dias} días`}
                        </p>
                      </>
                    ) : (
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-dim">
                        Sin registro
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-display text-lg font-bold text-white">{f.reservas}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => cambiarEstadoAlumna(f.alumna.id)}
                      className="btn-ghost !px-3 !py-2 text-[10px]"
                    >
                      {f.alumna.activa ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}

              {filas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Icono nombre="person_search" size={36} className="text-muted-dim" />
                    <p className="mt-3 text-sm text-muted">
                      No hay alumnas que coincidan con la búsqueda.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
