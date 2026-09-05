"use client";

import { clienteNavegador } from "@/lib/supabase/cliente";
import { aEstudio } from "./comun";
import type { Estudio } from "@/lib/types";
import type { EstudioFila } from "@/lib/supabase/tipos";

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
  // La tabla usa snake_case; casi todos los campos coinciden con el nombre
  // de la app, salvo estos dos que hay que traducir.
  const { sobreEstudio, sobreMetodo, ...resto } = cambios;
  const fila: Partial<EstudioFila> = { ...resto };
  if (sobreEstudio !== undefined) fila.sobre_estudio = sobreEstudio;
  if (sobreMetodo !== undefined) fila.sobre_metodo = sobreMetodo;

  const { error } = await clienteNavegador()
    .from("configuracion_estudio")
    .update(fila)
    .eq("id", 1);

  if (error) throw new Error(error.message);
}
