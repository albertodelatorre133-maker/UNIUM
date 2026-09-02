"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Icono } from "@/components/Icono";
import { BotonGoogle } from "@/components/BotonGoogle";
import { useStore } from "@/lib/store";
import { CUENTA_ADMIN, CUENTA_DEMO } from "@/lib/seed";
import { hayBaseDeDatos } from "@/lib/supabase/cliente";
import { entrarConGoogle } from "@/lib/datos/auth";

function Formulario() {
  const { login } = useStore();
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (search.get("error") === "google") {
      setError("No fue posible continuar con Google. Intenta de nuevo.");
    }
  }, [search]);

  async function conGoogle() {
    setError(null);
    const r = await entrarConGoogle();
    if (!r.ok) setError(r.error ?? "No fue posible continuar con Google.");
  }

  async function entrar(correo: string, clave: string) {
    setEnviando(true);
    const res = await login(correo, clave);
    setEnviando(false);
    if (!res.ok) {
      setError(res.error ?? "No fue posible iniciar sesión.");
      return;
    }
    router.push(res.role === "admin" ? "/admin" : "/alumnas");
  }

  return (
    <AuthShell
      titulo="Iniciar sesión"
      subtitulo="Accede para revisar el calendario y agendar tu clase."
      pie={
        <>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      {hayBaseDeDatos() && (
        <>
          <BotonGoogle onClick={conGoogle} />
          <div className="my-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-dim">
            <span className="h-px flex-1 bg-white/10" />
            o con tu correo
            <span className="h-px flex-1 bg-white/10" />
          </div>
        </>
      )}

      <form
        className="space-y-4 corto:space-y-3 sm:space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          entrar(email, password);
        }}
      >
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

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="!mb-0">
              Contraseña
            </label>
            {hayBaseDeDatos() && (
              <Link
                href="/recuperar"
                className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={verPass ? "text" : "password"}
              required
              autoComplete="current-password"
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
          {enviando ? "ENTRANDO…" : "ENTRAR"}
        </button>
      </form>

      {!hayBaseDeDatos() && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 corto:mt-3.5 corto:p-3 sm:mt-7 sm:p-4">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-dim">
            Acceso de demostración
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="btn-ghost !py-2 text-xs"
              onClick={() => entrar(CUENTA_DEMO.email, CUENTA_DEMO.password)}
            >
              <Icono nombre="person" size={15} />
              Alumna
            </button>
            <button
              type="button"
              className="btn-ghost !py-2 text-xs"
              onClick={() => entrar(CUENTA_ADMIN.email, CUENTA_ADMIN.password)}
            >
              <Icono nombre="shield_person" size={15} />
              Staff
            </button>
          </div>
        </div>
      )}
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Formulario />
    </Suspense>
  );
}
