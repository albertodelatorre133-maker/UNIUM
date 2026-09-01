"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Icono } from "@/components/Icono";
import { useStore } from "@/lib/store";
import { clienteNavegador, hayBaseDeDatos } from "@/lib/supabase/cliente";

/**
 * Página a la que llega el enlace del correo de recuperación. El cliente de
 * Supabase detecta el token en la URL y abre una sesión de recuperación
 * automáticamente; aquí solo esperamos ese evento antes de mostrar el
 * formulario.
 */
export default function RestablecerPage() {
  const router = useRouter();
  const { restablecerPassword } = useStore();
  const [estado, setEstado] = useState<"verificando" | "listo" | "invalido">("verificando");
  const [password, setPassword] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (!hayBaseDeDatos()) {
      setEstado("invalido");
      return;
    }

    const sb = clienteNavegador();
    let activo = true;

    const { data: suscripcion } = sb.auth.onAuthStateChange((evento) => {
      if (evento === "PASSWORD_RECOVERY" && activo) setEstado("listo");
    });

    sb.auth.getSession().then(({ data }) => {
      if (activo && data.session) setEstado("listo");
    });

    const tope = setTimeout(() => {
      if (activo) setEstado((e) => (e === "verificando" ? "invalido" : e));
    }, 4000);

    return () => {
      activo = false;
      clearTimeout(tope);
      suscripcion.subscription.unsubscribe();
    };
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setEnviando(true);
    const r = await restablecerPassword(password);
    setEnviando(false);
    if (!r.ok) {
      setError(r.error ?? "No fue posible actualizar la contraseña.");
      return;
    }
    setExito(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <AuthShell
      titulo="Nueva contraseña"
      subtitulo="Elige la contraseña con la que vas a entrar de ahora en adelante."
      pie={
        <>
          ¿Recordaste tu contraseña?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      {estado === "verificando" && (
        <p className="py-4 text-center text-sm text-muted">Verificando el enlace…</p>
      )}

      {estado === "invalido" && (
        <p className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          <Icono nombre="error" size={16} />
          Este enlace ya no es válido o expiró.{" "}
          <Link href="/recuperar" className="font-semibold underline">
            Solicita uno nuevo
          </Link>
          .
        </p>
      )}

      {estado === "listo" &&
        (exito ? (
          <p className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-xs text-primary">
            <Icono nombre="check_circle" size={16} />
            Contraseña actualizada. Te llevamos a iniciar sesión…
          </p>
        ) : (
          <form className="space-y-4 corto:space-y-3 sm:space-y-5" onSubmit={guardar}>
            <div>
              <label htmlFor="password">Nueva contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  type={verPass ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={verPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setVerPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-dim transition hover:text-primary"
                >
                  <Icono nombre={verPass ? "visibility_off" : "visibility"} />
                </button>
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                <Icono nombre="error" size={16} />
                {error}
              </p>
            )}

            <button type="submit" disabled={enviando} className="btn-gold w-full">
              {enviando ? "GUARDANDO…" : "GUARDAR CONTRASEÑA"}
            </button>
          </form>
        ))}
    </AuthShell>
  );
}
