"use client";

import { clienteNavegador } from "@/lib/supabase/cliente";
import { aCancelacion } from "./comun";
import type { Cancelacion } from "@/lib/types";

/**
 * Un disparador en la base de datos escribe aquí una copia de cada reserva
 * justo antes de borrarla, así que no hay que crear ni actualizar filas desde
 * el cliente: solo se lee el historial.
 */
export async function listarCancelaciones(): Promise<Cancelacion[]> {
  const { data, error } = await clienteNavegador()
    .from("cancelaciones")
    .select("*")
    .order("cancelada_en", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(aCancelacion);
}
