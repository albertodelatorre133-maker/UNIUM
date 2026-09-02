"use client";

import { useEffect, useState } from "react";
import { Icono } from "@/components/Icono";
import { activarNotificaciones, notificacionesActivas, soportaNotificaciones } from "@/lib/push";
import { useStore } from "@/lib/store";
import { hayBaseDeDatos } from "@/lib/supabase/cliente";

const CLAVE_PREGUNTADO = "unium.notif.preguntado";

/**
 * Aparece una sola vez (por navegador) apenas entra a su portal, para que
 * decida ahí mismo si quiere notificaciones en vez de tener que encontrar el
 * interruptor escondido en su perfil/configuración.
 */
export function PromptNotificaciones() {
  const { usuario } = useStore();
  const [visible, setVisible] = useState(false);
  const [activando, setActivando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario || !hayBaseDeDatos() || !soportaNotificaciones()) return;
    if (typeof Notification !== "undefined" && Notification.permission === "denied") return;
    if (localStorage.getItem(CLAVE_PREGUNTADO)) return;

    let cancelado = false;
    notificacionesActivas().then((activo) => {
      if (!cancelado && !activo) setVisible(true);
    });
    return () => {
      cancelado = true;
    };
  }, [usuario]);

  function cerrar() {
    localStorage.setItem(CLAVE_PREGUNTADO, "1");
    setVisible(false);
  }

  async function activar() {
    setError(null);
    setActivando(true);
    const r = await activarNotificaciones();
    setActivando(false);
    if (r.ok) {
      cerrar();
    } else {
      setError(r.error ?? "No fue posible activar las notificaciones.");
    }
  }

  if (!visible) return null;

  const esAdmin = usuario?.role === "admin";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Activar notificaciones"
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/80 p-4 backdrop-blur-sm"
    >
      <div className="glass-strong w-full max-w-sm p-6">
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
          <Icono nombre="notifications" size={18} />
        </span>
        <h2 className="mt-4 font-display text-lg font-semibold uppercase tracking-wide text-white">
          Activa las notificaciones
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {esAdmin
            ? "Entérate al instante en tu celular cuando una alumna agende o cancele una clase."
            : "Te avisamos cuando tu clase esté por comenzar, se libere un cupo en la lista de espera que estabas esperando, o el estudio publique una promoción nueva."}
        </p>

        {error && (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            <Icono nombre="error" size={15} />
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse">
          <button type="button" disabled={activando} onClick={activar} className="btn-gold flex-1">
            {activando ? "Activando…" : "Activar notificaciones"}
          </button>
          <button type="button" disabled={activando} onClick={cerrar} className="btn-ghost flex-1">
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
