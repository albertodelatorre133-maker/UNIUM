"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Icono } from "@/components/Icono";
import { useStore } from "@/lib/store";
import { CUENTA_ADMIN, CUENTA_DEMO } from "@/lib/seed";

export default function LoginPage() {
  const { login } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function entrar(correo: string, clave: string) {
    const res = login(correo, clave);
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
      <form
        className="space-y-5"
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
          <label htmlFor="password">Contraseña</label>
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

        <button type="submit" className="btn-gold w-full">
          ENTRAR
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-dim">
          Acceso de demostración
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="btn-ghost flex-1 !py-2 text-xs"
            onClick={() => entrar(CUENTA_DEMO.email, CUENTA_DEMO.password)}
          >
            <Icono nombre="person" size={16} />
            Alumna
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 !py-2 text-xs"
            onClick={() => entrar(CUENTA_ADMIN.email, CUENTA_ADMIN.password)}
          >
            <Icono nombre="shield_person" size={16} />
            Staff
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
