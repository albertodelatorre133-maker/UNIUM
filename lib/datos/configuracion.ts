"use client";

import { clienteNavegador } from "@/lib/supabase/cliente";
import { aDia } from "./comun";
import type { DayConfig } from "@/lib/types";

export async function leerConfiguracion(): Promise<DayConfig[]> {
  const { data, error } = await clienteNavegador()
    .from("configuracion_dias")
    .select("*")
    .order("day");

  if (error) throw new Error(error.message);
  return (data ?? []).map(aDia);
}

/** Guarda el horario operativo completo de la semana. */
export async function guardarConfiguracion(config: DayConfig[]): Promise<void> {
  const { error } = await clienteNavegador()
    .from("configuracion_dias")
    .upsert(
      config.map((d) => ({
        day: d.day,
        activo: d.activo,
        apertura: d.apertura,
        cierre: d.cierre,
      })),
      { onConflict: "day" },
    );

  if (error) throw new Error(error.message);
}
