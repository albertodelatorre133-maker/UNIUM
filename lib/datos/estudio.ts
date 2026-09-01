"use client";

import { clienteNavegador } from "@/lib/supabase/cliente";
import { aEstudio } from "./comun";
import type { Estudio } from "@/lib/types";

/** configuracion_estudio es una tabla de una sola fila (id fijo en 1). */
export async function leerEstudio(): Promise<Estudio> {
  const { data, error } = await clienteNavegador()
    .from("configuracion_estudio")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) throw new Error(error.message);
  return aEstudio(data);
}

export async function guardarEstudio(cambios: Partial<Estudio>): Promise<void> {
  const { error } = await clienteNavegador()
    .from("configuracion_estudio")
    .update(cambios)
    .eq("id", 1);

  if (error) throw new Error(error.message);
}
