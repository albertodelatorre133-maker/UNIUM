"use client";

import { useState } from "react";
import { Icono } from "@/components/Icono";
import { useStore } from "@/lib/store";
import { addDays, formatoCorto, hoyISO, toISODate } from "@/lib/date";
import type { Promocion } from "@/lib/types";

type Borrador = Omit<Promocion, "id" | "creadaEn">;

function borradorNuevo(): Borrador {
  return {
    titulo: "",
    descripcion: "",
    etiqueta: "PROMO",
    desde: hoyISO(),
    hasta: toISODate(addDays(new Date(), 30)),
    activa: true,
    enInicio: true,
    notificar: true,
  };
}

const SUGERENCIAS = ["2X1", "-30%", "NUEVA CLASE", "BENEFICIO", "CUPOS LIMITADOS"];

export default function PromocionesPage() {
  const { state, crearPromocion, actualizarPromocion, eliminarPromocion, promocionesVigentes } =
    useStore();

  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [borrador, setBorrador] = useState<Borrador>(borradorNuevo());
  const [error, setError] = useState<string | null>(null);

  const promos = state.promociones;
  const vigentes = promocionesVigentes();
  const hoy = hoyISO();

  function nueva() {
    setBorrador(borradorNuevo());
    setEditando(null);
    setError(null);
    setAbierto(true);
  }

  function editar(p: Promocion) {
    const { id: _id, creadaEn: _creadaEn, ...resto } = p;
    setBorrador(resto);
    setEditando(p.id);
    setError(null);
    setAbierto(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!borrador.titulo.trim()) {
      setError("Ponle un título a la promoción.");
      return;
    }
    if (borrador.hasta < borrador.desde) {
      setError("La fecha de fin debe ser posterior a la de inicio.");
      return;
    }
    const limpio: Borrador = {
      ...borrador,
      titulo: borrador.titulo.trim(),
      descripcion: borrador.descripcion.trim(),
      etiqueta: (borrador.etiqueta.trim() || "PROMO").toUpperCase(),
    };
    if (editando) await actualizarPromocion(editando, limpio);
    else await crearPromocion(limpio);
    setAbierto(false);
    setEditando(null);
  }

  function estado(p: Promocion): { texto: string; tono: "viva" | "programada" | "vencida" | "off" } {
    if (!p.activa) return { texto: "Pausada", tono: "off" };
    if (p.desde > hoy) return { texto: "Programada", tono: "programada" };
    if (p.hasta < hoy) return { texto: "Vencida", tono: "vencida" };
    return { texto: "Vigente", tono: "viva" };
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow hidden sm:block">Comunicación</span>
          <h1 className="font-display text-[28px] font-bold uppercase tracking-tight sm:mt-2 sm:text-4xl lg:text-5xl">
            Promociones y <span className="gold-text">avisos</span>
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] text-muted sm:text-sm">
            Lo que publiques aquí aparece en la página de inicio y le llega a las alumnas como
            novedad dentro de su portal.
          </p>
        </div>
        <button type="button" className="btn-gold shrink-0" onClick={nueva}>
          <Icono nombre="add" size={16} />
          NUEVA PROMOCIÓN
        </button>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icono: "campaign", valor: String(promos.length), etiqueta: "Creadas" },
          { icono: "check_circle", valor: String(vigentes.length), etiqueta: "Vigentes" },
          {
            icono: "home",
            valor: String(vigentes.filter((p) => p.enInicio).length),
            etiqueta: "En inicio",
          },
          {
            icono: "notifications",
            valor: String(vigentes.filter((p) => p.notificar).length),
            etiqueta: "Notificando",
          },
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
              {editando ? "Editar promoción" : "Nueva promoción"}
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
            <div className="lg:col-span-2">
              <label htmlFor="p-titulo">Título</label>
              <input
                id="p-titulo"
                required
                placeholder="Trae a una amiga"
                className="w-full"
                value={borrador.titulo}
                onChange={(e) => setBorrador({ ...borrador, titulo: e.target.value })}
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="p-desc">Descripción</label>
              <textarea
                id="p-desc"
                rows={3}
                placeholder="Explica el beneficio y las condiciones."
                className="w-full"
                value={borrador.descripcion}
                onChange={(e) => setBorrador({ ...borrador, descripcion: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="p-etiqueta">Distintivo</label>
              <input
                id="p-etiqueta"
                maxLength={18}
                placeholder="2X1"
                className="w-full uppercase"
                value={borrador.etiqueta}
                onChange={(e) => setBorrador({ ...borrador, etiqueta: e.target.value })}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setBorrador({ ...borrador, etiqueta: s })}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted transition hover:border-primary/40 hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="p-desde">Desde</label>
                <input
                  id="p-desde"
                  type="date"
                  className="w-full"
                  value={borrador.desde}
                  onChange={(e) => setBorrador({ ...borrador, desde: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="p-hasta">Hasta</label>
                <input
                  id="p-hasta"
                  type="date"
                  className="w-full"
                  value={borrador.hasta}
                  onChange={(e) => setBorrador({ ...borrador, hasta: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2.5 lg:col-span-2 sm:grid-cols-3">
              {[
                { campo: "activa" as const, label: "Activa", ayuda: "Publicada" },
                { campo: "enInicio" as const, label: "En la landing", ayuda: "Página de inicio" },
                { campo: "notificar" as const, label: "Notificar", ayuda: "Aviso a las alumnas" },
              ].map((o) => (
                <button
                  key={o.campo}
                  type="button"
                  role="switch"
                  aria-checked={borrador[o.campo]}
                  onClick={() => setBorrador({ ...borrador, [o.campo]: !borrador[o.campo] })}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    borrador[o.campo]
                      ? "border-primary/40 bg-primary/10"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <span
                    className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
                      borrador[o.campo]
                        ? "border-primary/50 bg-primary/25"
                        : "border-white/15 bg-white/[0.05]"
                    }`}
                  >
                    <span
                      className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all ${
                        borrador[o.campo] ? "left-[25px] bg-gold-gradient" : "left-1 bg-muted-dim"
                      }`}
                    />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-[13px] font-semibold ${
                        borrador[o.campo] ? "text-primary" : "text-muted-soft"
                      }`}
                    >
                      {o.label}
                    </span>
                    <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-muted-dim">
                      {o.ayuda}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {error && (
              <p className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300 lg:col-span-2">
                <Icono nombre="error" size={15} />
                {error}
              </p>
            )}

            <div className="flex flex-col gap-2.5 sm:flex-row lg:col-span-2">
              <button type="submit" className="btn-gold">
                <Icono nombre="save" size={16} />
                {editando ? "GUARDAR CAMBIOS" : "PUBLICAR PROMOCIÓN"}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setAbierto(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {promos.length === 0 ? (
        <div className="glass px-6 py-16 text-center">
          <Icono nombre="campaign" size={34} className="mx-auto text-muted-dim" />
          <p className="mt-4 text-sm text-muted">
            Todavía no has creado promociones. La primera aparecerá en la landing y en el portal de
            las alumnas.
          </p>
          <button type="button" className="btn-gold mt-6" onClick={nueva}>
            <Icono nombre="add" size={16} />
            CREAR LA PRIMERA
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {promos.map((p) => {
            const est = estado(p);
            return (
              <li key={p.id} className="glass flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip-gold">{p.etiqueta}</span>
                    <span
                      className={`chip ${
                        est.tono === "viva"
                          ? "border-emerald-400/30 text-emerald-300"
                          : est.tono === "programada"
                            ? "border-sky-400/30 text-sky-300"
                            : est.tono === "vencida"
                              ? "border-white/10 text-muted-dim"
                              : "border-white/10 text-muted-dim"
                      }`}
                    >
                      {est.texto}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Editar ${p.titulo}`}
                      onClick={() => editar(p)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-muted transition hover:border-primary/40 hover:text-primary"
                    >
                      <Icono nombre="edit" size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Eliminar ${p.titulo}`}
                      onClick={() => eliminarPromocion(p.id)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-muted transition hover:border-red-500/40 hover:text-red-300"
                    >
                      <Icono nombre="delete" size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="mt-4 font-display text-xl font-semibold uppercase tracking-wide text-white">
                  {p.titulo}
                </h3>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-muted">
                  {p.descripcion || "Sin descripción."}
                </p>

                <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-dim">
                  {formatoCorto(p.desde)} → {formatoCorto(p.hasta)}
                </p>

                <div className="my-4 hairline" />

                <div className="flex flex-wrap gap-2">
                  {[
                    { campo: "activa" as const, label: "Activa" },
                    { campo: "enInicio" as const, label: "En inicio" },
                    { campo: "notificar" as const, label: "Notificar" },
                  ].map((o) => (
                    <button
                      key={o.campo}
                      type="button"
                      role="switch"
                      aria-checked={p[o.campo]}
                      onClick={() => actualizarPromocion(p.id, { [o.campo]: !p[o.campo] })}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.12em] transition ${
                        p[o.campo]
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-white/10 bg-white/[0.02] text-muted-dim hover:text-muted"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          p[o.campo] ? "bg-primary" : "bg-muted-dim"
                        }`}
                      />
                      {o.label}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
