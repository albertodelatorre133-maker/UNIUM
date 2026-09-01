"use client";

import { clienteNavegador } from "@/lib/supabase/cliente";
import { aClase } from "./comun";
import type { ClassSession } from "@/lib/types";

export async function listarClases(): Promise<ClassSession[]> {
  const { data, error } = await clienteNavegador()
    .from("clases")
    .select("*")
    .order("day")
    .order("hora");

  if (error) throw new Error(error.message);
  return (data ?? []).map(aClase);
}

export async function crearClase(clase: Omit<ClassSession, "id">): Promise<ClassSession> {
  const { data, error } = await clienteNavegador()
    .from("clases")
    .insert({
      titulo: clase.titulo,
      descripcion: clase.descripcion,
      day: clase.day,
      hora: clase.hora,
      duracion: clase.duracion,
      coach_id: clase.coachId,
      cupo: clase.cupo,
      semanal: clase.semanal,
      fecha: clase.fecha,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "No fue posible crear la clase.");
  return aClase(data);
}

/** Al borrar la clase se borran también sus reservas (cascada en la base). */
export async function eliminarClase(id: string): Promise<void> {
  const { error } = await clienteNavegador().from("clases").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
