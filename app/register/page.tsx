"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Icono } from "@/components/Icono";
import { useStore } from "@/lib/store";

export default function RegisterPage() {
  const { registrar } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const set = (campo: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  return (
    <AuthShell
      titulo="Crear cuenta"
      subtitulo="Regístrate para reservar tus clases en el estudio."
      pie={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          if (form.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
          }
          const res = registrar(form);
          if (!res.ok) {
            setError(res.error ?? "No fue posible crear la cuenta.");
            return;
          }
          router.push("/alumnas");
        }}
      >
        <div>
          <label htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre"
            required
            placeholder="María Fernanda López"
            className="w-full"
            value={form.nombre}
            onChange={set("nombre")}
          />
        </div>

        <div>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            className="w-full"
            value={form.email}
            onChange={set("email")}
          />
        </div>

        <div>
          <label htmlFor="telefono">Teléfono</label>
          <input
            id="telefono"
            required
            inputMode="tel"
            placeholder="+57 300 000 0000"
            className="w-full"
            value={form.telefono}
            onChange={set("telefono")}
          />
        </div>

        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            className="w-full"
            value={form.password}
            onChange={set("password")}
          />
        </div>

        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            <Icono nombre="error" size={16} />
            {error}
          </p>
        )}

        <button type="submit" className="btn-gold w-full">
          CREAR CUENTA
        </button>

        <p className="text-center text-[11px] leading-relaxed text-muted-dim">
          Al registrarte aceptas el reglamento del estudio. UNIUM no gestiona pagos ni planes desde
          la plataforma.
        </p>
      </form>
    </AuthShell>
  );
}
