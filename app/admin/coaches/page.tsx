"use client";

import { useState } from "react";
import { Icono } from "@/components/Icono";
import { useStore } from "@/lib/store";
import { inicialesDe } from "@/lib/texto";
import type { Coach } from "@/lib/types";

type Borrador = Omit<Coach, "id" | "creadaEn">;

function borradorNuevo(): Borrador {
  return { nombre: "", especialidad: "", bio: "", activa: true };
}

export default function CoachesPage() {
  const { state, crearCoach, actualizarCoach, eliminarCoach } = useStore();

  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [borrador, setBorrador] = useState<Borrador>(borradorNuevo());
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null);

  const coaches = state.coaches;
  const activas = coaches.filter((c) => c.activa).length;

  function nueva() {
    setBorrador(borradorNuevo());
    setEditando(null);
    setError(null);
    setAbierto(true);
  }

  function editar(c: Coach) {
    const { id: _id, creadaEn: _creadaEn, ...resto } = c;
    setBorrador(resto);
    setEditando(c.id);
    setError(null);
    setAbierto(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!borrador.nombre.trim()) {
      setError("Ponle un nombre a la coach.");
      return;
    }
    const limpio: Borrador = {
      ...borrador,
      nombre: borrador.nombre.trim(),
      especialidad: borrador.especialidad.trim(),
      bio: borrador.bio.trim(),
    };
    setEnviando(true);
    if (editando) await actualizarCoach(editando, limpio);
    else await crearCoach(limpio);
    setEnviando(false);
    setAbierto(false);
    setEditando(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow hidden sm:block">Equipo del estudio</span>
          <h1 className="font-display text-[28px] font-bold uppercase tracking-tight sm:mt-2 sm:text-4xl lg:text-5xl">
            Coaches
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] text-muted sm:text-sm">
            Lo que publiques aquí aparece en la página de inicio y en el desplegable al crear una
            clase nueva. Si renombras a una coach, sus clases ya creadas muestran el nuevo nombre
            automáticamente.
          </p>
        </div>
        <button type="button" className="btn-gold shrink-0" onClick={nueva}>
          <Icono nombre="add" size={16} />
          NUEVA COACH
        </button>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:max-w-sm">
        {[
          { icono: "groups", valor: String(coaches.length), etiqueta: "Registradas" },
          { icono: "check_circle", valor: String(activas), etiqueta: "Activas" },
        ].map((m) => (
          <div key={m.etiqueta} className="glass flex items-center gap-3 p-3.5 sm:gap-4 sm:p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <Icono nombre={m.icono} size={16} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-xl font-bold text-white sm:text-2xl">{m.valor}</p>
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-muted-dim">
                {m.etiqueta}
              </p>
            </div>
          </div>
        ))}
      </section>

      {abierto && (
        <section className="glass-strong p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
              {editando ? "Editar coach" : "Nueva coach"}
            </h2>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar formulario"
              className="grid h-9 w-9 place-items-center rounded-lg text-muted-dim transition hover:text-white"
            >
              <Icono nombre="close" size={17} />
            </button>
          </div>
          <div className="my-5 hairline" />

          <form className="grid gap-4 lg:grid-cols-2" onSubmit={guardar}>
            <div>
              <label htmlFor="c-nombre">Nombre completo</label>
              <input
                id="c-nombre"
                required
                placeholder="María Fernanda López"
                className="w-full"
                value={borrador.nombre}
                onChange={(e) => setBorrador({ ...borrador, nombre: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="c-especialidad">Especialidad</label>
              <input
                id="c-especialidad"
                placeholder="Fuerza funcional"
                className="w-full"
                value={borrador.especialidad}
                onChange={(e) => setBorrador({ ...borrador, especialidad: e.target.value })}
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="c-bio">Biografía</label>
              <textarea
                id="c-bio"
                rows={3}
                placeholder="Un par de líneas sobre su enfoque y experiencia."
                className="w-full"
                value={borrador.bio}
                onChange={(e) => setBorrador({ ...borrador, bio: e.target.value })}
              />
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={borrador.activa}
              onClick={() => setBorrador({ ...borrador, activa: !borrador.activa })}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition lg:col-span-2 ${
                borrador.activa
                  ? "border-primary/40 bg-primary/10"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <span
                className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
                  borrador.activa
                    ? "border-primary/50 bg-primary/25"
                    : "border-white/15 bg-white/[0.05]"
                }`}
              >
                <span
                  className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all ${
                    borrador.activa ? "left-[25px] bg-gold-gradient" : "left-1 bg-muted-dim"
                  }`}
                />
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-[13px] font-semibold ${
                    borrador.activa ? "text-primary" : "text-muted-soft"
                  }`}
                >
                  Activa
                </span>
                <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-muted-dim">
                  Visible en la landing y disponible para clases nuevas
                </span>
              </span>
            </button>

            {error && (
              <p className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300 lg:col-span-2">
                <Icono nombre="error" size={15} />
                {error}
              </p>
            )}

            <div className="flex flex-col gap-2.5 sm:flex-row lg:col-span-2">
              <button type="submit" disabled={enviando} className="btn-gold">
                <Icono nombre="save" size={16} />
                {enviando ? "GUARDANDO…" : editando ? "GUARDAR CAMBIOS" : "CREAR COACH"}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setAbierto(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {errorBorrado && (
        <p className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          <Icono nombre="error" size={15} />
          {errorBorrado}
        </p>
      )}

      {coaches.length === 0 ? (
        <div className="glass px-6 py-16 text-center">
          <Icono nombre="groups" size={34} className="mx-auto text-muted-dim" />
          <p className="mt-4 text-sm text-muted">
            Todavía no has dado de alta ninguna coach.
          </p>
          <button type="button" className="btn-gold mt-6" onClick={nueva}>
            <Icono nombre="add" size={16} />
            CREAR LA PRIMERA
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {coaches.map((c) => (
            <li key={c.id} className="glass flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-primary/30 bg-gold-gradient font-display text-base font-bold text-ink-900">
                    {inicialesDe(c.nombre)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold uppercase tracking-wide text-white">
                      {c.nombre}
                    </p>
                    {c.especialidad && (
                      <p className="truncate font-mono text-[9.5px] uppercase tracking-[0.16em] text-primary">
                        {c.especialidad}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Editar ${c.nombre}`}
                    onClick={() => editar(c)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-muted transition hover:border-primary/40 hover:text-primary"
                  >
                    <Icono nombre="edit" size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Eliminar ${c.nombre}`}
                    onClick={async () => {
                      setErrorBorrado(null);
                      const r = await eliminarCoach(c.id);
                      if (!r.ok) setErrorBorrado(r.error ?? "No fue posible eliminar la coach.");
                    }}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-muted transition hover:border-red-500/40 hover:text-red-300"
                  >
                    <Icono nombre="delete" size={15} />
                  </button>
                </div>
              </div>

              {c.bio && (
                <p className="mt-4 flex-1 text-[13px] leading-relaxed text-muted">{c.bio}</p>
              )}

              <div className="my-4 hairline" />

              <button
                type="button"
                role="switch"
                aria-checked={c.activa}
                onClick={() => actualizarCoach(c.id, { activa: !c.activa })}
                className={`flex items-center gap-2 self-start rounded-lg border px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.12em] transition ${
                  c.activa
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/[0.02] text-muted-dim hover:text-muted"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${c.activa ? "bg-primary" : "bg-muted-dim"}`}
                />
                {c.activa ? "Activa" : "Inactiva"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
