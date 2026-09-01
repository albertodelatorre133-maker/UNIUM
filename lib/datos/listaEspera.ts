"use client";

import { clienteNavegador } from "@/lib/supabase/cliente";
import { aEspera, mensajeDeError } from "./comun";
import type { Resultado } from "./auth";
import type { EsperaEntry } from "@/lib/types";

export async function listarListaEspera(): Promise<EsperaEntry[]> {
  const { data, error } = await clienteNavegador().from("lista_espera").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []).map(aEspera);
}

export async function unirseListaEspera(claseId: string, fecha: string): Promise<Resultado> {
  const sb = clienteNavegador();
  const { data: sesion } = await sb.auth.getUser();
  if (!sesion.user) return { ok: false, error: "Inicia sesión para anotarte." };

  const { error } = await sb
    .from("lista_espera")
    .insert({ clase_id: claseId, usuario_id: sesion.user.id, fecha });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ya estás en la lista de espera de esta clase." };
    }
    return { ok: false, error: mensajeDeError(error) };
  }
  return { ok: true };
}

export async function salirListaEspera(entryId: string): Promise<void> {
  const { error } = await clienteNavegador().from("lista_espera").delete().eq("id", entryId);
  if (error) throw new Error(error.message);
}

/** Solo el staff: convierte un registro de la lista de espera en una reserva real. */
export async function promoverDesdeEspera(entryId: string): Promise<Resultado> {
  const sb = clienteNavegador();
  const { data: entrada, error: errorLectura } = await sb
    .from("lista_espera")
    .select("*")
    .eq("id", entryId)
    .single();

  if (errorLectura || !entrada) return { ok: false, error: "No se encontró el registro." };

  const { error: errorReserva } = await sb
    .from("reservas")
    .insert({ clase_id: entrada.clase_id, usuario_id: entrada.usuario_id, fecha: entrada.fecha });

  if (errorReserva) return { ok: false, error: mensajeDeError(errorReserva) };

  await sb.from("lista_espera").delete().eq("id", entryId);
  return { ok: true };
}
