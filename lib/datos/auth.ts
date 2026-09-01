"use client";

import { clienteNavegador } from "@/lib/supabase/cliente";
import { aUsuario } from "./comun";
import type { User } from "@/lib/types";

export interface Resultado {
  ok: boolean;
  error?: string;
}

/** Alta de una alumna. El perfil lo crea un disparador de la base de datos. */
export async function registrar(datos: {
  nombre: string;
  email: string;
  telefono: string;
  password: string;
}): Promise<Resultado> {
  const sb = clienteNavegador();
  const { error } = await sb.auth.signUp({
    email: datos.email.trim().toLowerCase(),
    password: datos.password,
    options: { data: { nombre: datos.nombre.trim(), telefono: datos.telefono.trim() } },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { ok: false, error: "Ya existe una cuenta con ese correo." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function entrar(email: string, password: string): Promise<Resultado> {
  const sb = clienteNavegador();
  const { error } = await sb.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) {
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }
  return { ok: true };
}

export async function salir(): Promise<void> {
  await clienteNavegador().auth.signOut();
}

/** Perfil de la sesión abierta, o null si no hay ninguna. */
export async function perfilActual(): Promise<User | null> {
  const sb = clienteNavegador();
  const { data: sesion } = await sb.auth.getUser();
  if (!sesion.user) return null;

  const { data, error } = await sb
    .from("perfiles")
    .select("*")
    .eq("id", sesion.user.id)
    .single();

  if (error || !data) return null;
  return { ...aUsuario(data), email: sesion.user.email ?? "" };
}
