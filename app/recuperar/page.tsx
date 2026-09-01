"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Icono } from "@/components/Icono";
import { useStore } from "@/lib/store";

export default function RecuperarPage() {
  const { solicitarRecuperacion } = useStore();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const r = await solicitarRecuperacion(email);
    setEnviando(false);
    if (!r.ok) {
      setError(r.error ?? "No fue posible enviar el correo.");
      return;
    }
    setEnviado(true);
  }

  return (
    <AuthShell
      titulo="Recuperar contraseña"
      subtitulo="Te enviamos un enlace para elegir una contraseña nueva."
      pie={
        <>
          ¿Ya la recordaste?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      {enviado ? (
        <p className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-xs text-primary">
          <Icono nombre="check_circle" size={16} />
          Si existe una cuenta con ese correo, te llegará un enlace para restablecer tu
          contraseña. Revisa también la carpeta de spam.
        </p>
      ) : (
        <form className="space-y-4 corto:space-y-3 sm:space-y-5" onSubmit={enviar}>
          <div>
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu@correo.com"
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <p className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
              <Icono nombre="error" size={16} />
              {error}
            </p>
          )}

          <button type="submit" disabled={enviando} className="btn-gold w-full">
            {enviando ? "ENVIANDO…" : "ENVIAR ENLACE"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
