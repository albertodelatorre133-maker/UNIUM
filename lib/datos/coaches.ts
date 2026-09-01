"use client";

import { clienteNavegador } from "@/lib/supabase/cliente";
import { aCoach, mensajeDeError } from "./comun";
import type { Coach } from "@/lib/types";

/**
 * La política de la tabla ya filtra: fuera del staff solo llegan las coaches
 * activas.
 */
export async function listarCoaches(): Promise<Coach[]> {
  const { data, error } = await clienteNavegador()
    .from("coaches")
    .select("*")
    .order("nombre");

  if (error) throw new Error(error.message);
  return (data ?? []).map(aCoach);
}

export async function crearCoach(
  coach: Omit<Coach, "id" | "creadaEn">,
): Promise<Coach> {
  const { data, error } = await clienteNavegador()
    .from("coaches")
    .insert({
      nombre: coach.nombre,
      especialidad: coach.especialidad,
      bio: coach.bio,
      activa: coach.activa,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "No fue posible crear la coach.");
  return aCoach(data);
}

export async function actualizarCoach(id: string, cambios: Partial<Coach>): Promise<void> {
  const { error } = await clienteNavegador()
    .from("coaches")
    .update({
      ...(cambios.nombre !== undefined && { nombre: cambios.nombre }),
      ...(cambios.especialidad !== undefined && { especialidad: cambios.especialidad }),
      ...(cambios.bio !== undefined && { bio: cambios.bio }),
      ...(cambios.activa !== undefined && { activa: cambios.activa }),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

/** `clases.coach_id` referencia a esta tabla: no se puede borrar una coach con clases asignadas. */
export async function eliminarCoach(id: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await clienteNavegador().from("coaches").delete().eq("id", id);
  if (error) return { ok: false, error: mensajeDeError(error) };
  return { ok: true };
}
