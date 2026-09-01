"use client";

import { clienteNavegador } from "@/lib/supabase/cliente";
import { aUsuario } from "./comun";
import type { User } from "@/lib/types";

export interface FilaDirectorio {
  alumna: User;
  reservas: number;
  asistencias: number;
  ultimaAsistencia: string | null;
}

/** Directorio del panel de administración, con los contadores ya resueltos. */
export async function listarAlumnas(): Promise<FilaDirectorio[]> {
  const sb = clienteNavegador();

  const { data: perfiles, error } = await sb
    .from("perfiles")
    .select("*")
    .eq("rol", "alumna")
    .order("nombre");

  if (error) throw new Error(error.message);

  const { data: reservas, error: errorReservas } = await sb
    .from("reservas")
    .select("usuario_id, fecha, asistio");

  if (errorReservas) throw new Error(errorReservas.message);

  return (perfiles ?? []).map((perfil) => {
    const suyas = (reservas ?? []).filter((r) => r.usuario_id === perfil.id);
    const asistidas = suyas.filter((r) => r.asistio).map((r) => r.fecha).sort();
    return {
      alumna: aUsuario(perfil),
      reservas: suyas.length,
      asistencias: asistidas.length,
      ultimaAsistencia: asistidas.length ? asistidas[asistidas.length - 1] : null,
    };
  });
}

export async function cambiarEstadoAlumna(usuarioId: string, activa: boolean): Promise<void> {
  const { error } = await clienteNavegador()
    .from("perfiles")
    .update({ activa })
    .eq("id", usuarioId);

  if (error) throw new Error(error.message);
}
