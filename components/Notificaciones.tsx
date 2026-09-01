"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icono } from "./Icono";
import { useStore } from "@/lib/store";
import { formatoCorto } from "@/lib/date";

/** Campana con el contador de promociones nuevas y su panel de detalle. */
export function Notificaciones() {
  const { notificaciones, sinLeer, marcarPromocionesLeidas } = useStore();
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const lista = notificaciones();

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      const objetivo = e.target as Node;
      const dentro =
        (boton.current && boton.current.contains(objetivo)) ||
        (panel.current && panel.current.contains(objetivo));
      if (!dentro) setAbierto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, [abierto]);

  function alternar() {
    const siguiente = !abierto;
    if (siguiente && boton.current) {
      const r = boton.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
    setAbierto(siguiente);
    if (siguiente && sinLeer > 0) window.setTimeout(marcarPromocionesLeidas, 900);
  }

  return (
    <div className="relative">
      <button
        ref={boton}
        type="button"
        onClick={alternar}
        aria-label={sinLeer ? `Novedades: ${sinLeer} sin leer` : "Novedades"}
        aria-expanded={abierto}
        className={`relative grid h-10 w-10 place-items-center rounded-xl border transition ${
          abierto
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-white/10 bg-white/[0.03] text-muted hover:text-primary"
        }`}
      >
        <Icono nombre="notifications" size={17} />
        {sinLeer > 0 && (
          <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold-gradient px-1 font-mono text-[9px] font-semibold text-ink-900">
            {sinLeer}
          </span>
        )}
      </button>

      {abierto &&
        createPortal(
          <>
            {/*
              El panel se monta en <body> con un portal: el header usa
              backdrop-blur, y cualquier ancestro con filter/backdrop-filter
              se vuelve el "contenedor" de un elemento fixed, así que sin el
              portal el panel quedaba atrapado dentro del header en vez de
              posicionarse respecto a toda la pantalla.
            */}
            <button
              type="button"
              aria-label="Cerrar novedades"
              onClick={() => setAbierto(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
            />
            <div
              ref={panel}
              style={{ "--panel-top": `${pos.top}px`, "--panel-right": `${pos.right}px` } as React.CSSProperties}
              className="fixed left-3 right-3 bottom-3 z-50 max-h-[72vh] overflow-y-auto rounded-2xl border border-primary/20 bg-ink-900/95 p-4 shadow-gold backdrop-blur-xl sm:left-auto sm:bottom-auto sm:top-[var(--panel-top)] sm:right-[var(--panel-right)] sm:max-h-[70vh] sm:w-[360px] sm:p-5"
              role="dialog"
              aria-label="Novedades del estudio"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold uppercase tracking-[0.12em]">
                  Novedades
                </h2>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  aria-label="Cerrar"
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted-dim transition hover:text-white"
                >
                  <Icono nombre="close" size={16} />
                </button>
              </div>
              <div className="my-4 hairline" />

              {lista.length === 0 ? (
                <div className="py-10 text-center">
                  <Icono nombre="campaign" size={30} className="mx-auto text-muted-dim" />
                  <p className="mt-3 text-[13px] text-muted">No hay novedades por ahora.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {lista.map(({ promocion, leida }) => (
                    <li
                      key={promocion.id}
                      className={`rounded-xl border p-4 ${
                        leida
                          ? "border-white/8 bg-white/[0.02]"
                          : "border-primary/30 bg-primary/[0.07]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="chip-gold">{promocion.etiqueta}</span>
                        {!leida && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <h3 className="mt-3 font-display text-base font-semibold uppercase tracking-wide text-white">
                        {promocion.titulo}
                      </h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                        {promocion.descripcion}
                      </p>
                      <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-dim">
                        Vigente hasta el {formatoCorto(promocion.hasta)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
