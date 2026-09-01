"use client";

import { useEffect, useState } from "react";
import { Icono } from "@/components/Icono";
import { activarNotificaciones, desactivarNotificaciones, notificacionesActivas } from "@/lib/push";

export function NotificacionesPush({ descripcion }: { descripcion: string }) {
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
            {descripcion}
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
