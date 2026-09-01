"use client";

import { clienteNavegador } from "@/lib/supabase/cliente";
import { aPilar } from "./comun";
import type { Pilar } from "@/lib/types";

export async function listarPilares(): Promise<Pilar[]> {
  const { data, error } = await clienteNavegador()
    .from("pilares")
    .select("*")
    .order("orden");

  if (error) throw new Error(error.message);
  return (data ?? []).map(aPilar);
}

export async function crearPilar(pilar: Omit<Pilar, "id">): Promise<Pilar> {
  const { data, error } = await clienteNavegador()
    .from("pilares")
    .insert({
      icono: pilar.icono,
      titulo: pilar.titulo,
      texto: pilar.texto,
      orden: pilar.orden,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "No fue posible crear el pilar.");
  return aPilar(data);
}

export async function actualizarPilar(id: string, cambios: Partial<Pilar>): Promise<void> {
  const { error } = await clienteNavegador()
    .from("pilares")
    .update({
      ...(cambios.icono !== undefined && { icono: cambios.icono }),
      ...(cambios.titulo !== undefined && { titulo: cambios.titulo }),
      ...(cambios.texto !== undefined && { texto: cambios.texto }),
      ...(cambios.orden !== undefined && { orden: cambios.orden }),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function eliminarPilar(id: string): Promise<void> {
  const { error } = await clienteNavegador().from("pilares").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
