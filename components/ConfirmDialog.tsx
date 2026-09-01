"use client";

import { Icono } from "@/components/Icono";

export function ConfirmDialog({
  titulo,
  mensaje,
  confirmarTexto = "Sí, confirmar",
  cancelarTexto = "Volver",
  cargando = false,
  onConfirmar,
  onCancelar,
}: {
  titulo: string;
  mensaje: string;
  confirmarTexto?: string;
  cancelarTexto?: string;
  cargando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/80 p-4 backdrop-blur-sm"
      onClick={onCancelar}
    >
      <div className="glass-strong w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-300">
          <Icono nombre="error" size={18} />
        </span>
        <h2 className="mt-4 font-display text-lg font-semibold uppercase tracking-wide text-white">
          {titulo}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{mensaje}</p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse">
          <button
            type="button"
            disabled={cargando}
            onClick={onConfirmar}
            className="btn-danger flex-1"
          >
            {cargando ? "Cancelando…" : confirmarTexto}
          </button>
          <button type="button" disabled={cargando} onClick={onCancelar} className="btn-ghost flex-1">
            {cancelarTexto}
          </button>
        </div>
      </div>
    </div>
  );
}
