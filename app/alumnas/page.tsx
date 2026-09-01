"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Icono } from "@/components/Icono";
import { CalendarioSemanal } from "@/components/CalendarioSemanal";
import { useStore, type SesionDelDia } from "@/lib/store";

type Filtro = "todas" | "cupo" | "mias";

const FILTROS: Array<{ id: Filtro; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "cupo", label: "Con cupo" },
  { id: "mias", label: "Mis clases" },
];

export default function ReservaClasesPage() {
  const { reservar, cancelar, usuario, sesionesDeLaSemana } = useStore();
  const [offset, setOffset] = useState(0);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const semana = sesionesDeLaSemana(offset);
  const misReservas = semana.flat().filter((s) => s.reservaPropia).length;

  async function onReservar(s: SesionDelDia) {
    const res = await reservar(s.clase.id, s.fecha);
    setAviso(
      res.ok
        ? { tipo: "ok", texto: `Cupo reservado en ${s.clase.titulo}.` }
        : { tipo: "error", texto: res.error ?? "No fue posible reservar." },
    );
    window.setTimeout(() => setAviso(null), 3200);
  }

  const filtrar = useCallback(
    (s: SesionDelDia) => {
      if (filtro === "mias") return Boolean(s.reservaPropia);
      if (filtro === "cupo") return s.disponibles > 0 || Boolean(s.reservaPropia);
      return true;
    },
    [filtro],
  );

  const renderClase = useMemo(
    () =>
      function Tarjeta(s: SesionDelDia) {
        const lleno = s.disponibles === 0 && !s.reservaPropia;
        const bloqueada = lleno || s.pasada;

        return (
          <article
            className={`rounded-xl border p-3 transition ${
              s.reservaPropia
                ? "border-primary/40 bg-primary/[0.08]"
                : "border-white/8 bg-white/[0.03] hover:border-white/20"
            } ${s.pasada ? "opacity-55" : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-md bg-primary/12 px-2 py-0.5 font-mono text-[10.5px] tracking-wider text-primary">
                {s.clase.hora}
              </span>
              <span
                className={`font-mono text-[10px] tracking-wider ${
                  lleno ? "text-red-300" : "text-muted-dim"
                }`}
              >
                {s.reservadas}/{s.clase.cupo}
              </span>
            </div>

            <Link
              href={`/alumnas/clase/${s.clase.id}?fecha=${s.fecha}`}
              className="mt-2 block outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <h4
                className={`font-display text-[15px] font-semibold uppercase leading-tight tracking-wide ${
                  lleno ? "text-muted-dim line-through" : "text-white"
                }`}
              >
                {s.clase.titulo}
              </h4>
              <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-muted">
                <Icono nombre="person" size={12} />
                {s.clase.coach}
              </p>
            </Link>

            {s.pasada ? (
              <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-dim">
                Finalizada
              </p>
            ) : s.reservaPropia ? (
              <div className="mt-3 flex items-center gap-1.5">
                <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/35 bg-primary/10 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-primary">
                  <Icono nombre="check_circle" size={12} />
                  Agendada
                </span>
                <button
                  type="button"
                  aria-label={`Cancelar ${s.clase.titulo}`}
                  onClick={() => cancelar(s.reservaPropia!.id)}
                  className="grid h-[34px] w-[34px] place-items-center rounded-lg border border-white/10 text-muted transition hover:border-red-500/40 hover:text-red-300"
                >
                  <Icono nombre="close" size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={bloqueada}
                onClick={() => onReservar(s)}
                className="btn-gold mt-3 w-full !rounded-lg !py-2 text-[11px]"
              >
                {lleno ? "SIN CUPOS" : "AGENDAR"}
              </button>
            )}
          </article>
        );
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cancelar],
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow hidden sm:block">Calendario de clases</span>
          <h1 className="font-display text-[28px] font-bold uppercase tracking-tight sm:mt-2 sm:text-4xl lg:text-5xl">
            Hola, <span className="gold-text">{usuario?.nombre.split(" ")[0]}</span>
          </h1>
          <p className="mt-2 text-[13px] text-muted sm:text-sm">
            <span className="font-semibold text-primary">{misReservas}</span>{" "}
            {misReservas === 1 ? "clase agendada" : "clases agendadas"} esta semana.
          </p>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              aria-pressed={filtro === f.id}
              className={`whitespace-nowrap rounded-xl border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
                filtro === f.id
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/[0.03] text-muted hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {aviso && (
        <div
          className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[13px] ${
            aviso.tipo === "ok"
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          <Icono nombre={aviso.tipo === "ok" ? "check_circle" : "error"} size={15} />
          {aviso.texto}
        </div>
      )}

      <CalendarioSemanal
        offset={offset}
        onOffset={setOffset}
        renderClase={renderClase}
        filtrar={filtrar}
        vacio={filtro === "mias" ? "Nada agendado" : "Sin clases"}
      />
    </div>
  );
}
