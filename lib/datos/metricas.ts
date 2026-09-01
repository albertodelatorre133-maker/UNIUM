"use client";

import { clienteNavegador } from "@/lib/supabase/cliente";
import { aMetrica } from "./comun";
import type { Metrica } from "@/lib/types";

export async function listarMetricas(): Promise<Metrica[]> {
  const { data, error } = await clienteNavegador()
    .from("metricas")
    .select("*")
    .order("orden");

  if (error) throw new Error(error.message);
  return (data ?? []).map(aMetrica);
}

export async function crearMetrica(metrica: Omit<Metrica, "id">): Promise<Metrica> {
  const { data, error } = await clienteNavegador()
    .from("metricas")
    .insert({
      valor: metrica.valor,
      etiqueta: metrica.etiqueta,
      orden: metrica.orden,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "No fue posible crear la métrica.");
  return aMetrica(data);
}

export async function actualizarMetrica(id: string, cambios: Partial<Metrica>): Promise<void> {
  const { error } = await clienteNavegador()
    .from("metricas")
    .update({
      ...(cambios.valor !== undefined && { valor: cambios.valor }),
      ...(cambios.etiqueta !== undefined && { etiqueta: cambios.etiqueta }),
      ...(cambios.orden !== undefined && { orden: cambios.orden }),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function eliminarMetrica(id: string): Promise<void> {
  const { error } = await clienteNavegador().from("metricas").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
