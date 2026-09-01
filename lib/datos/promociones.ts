"use client";

import { clienteNavegador } from "@/lib/supabase/cliente";
import { aPromocion } from "./comun";
import type { Promocion } from "@/lib/types";

/**
 * La política de la tabla ya filtra: fuera del staff solo llegan las
 * promociones activas y dentro de su ventana de fechas.
 */
export async function listarPromociones(): Promise<Promocion[]> {
  const { data, error } = await clienteNavegador()
    .from("promociones")
    .select("*")
    .order("creada_en", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(aPromocion);
}

export async function promocionesDeInicio(): Promise<Promocion[]> {
  const hoy = new Date().toISOString().slice(0, 10);
  const { data, error } = await clienteNavegador()
    .from("promociones")
    .select("*")
    .eq("activa", true)
    .eq("en_inicio", true)
    .lte("desde", hoy)
    .gte("hasta", hoy)
    .order("creada_en", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(aPromocion);
}

export async function crearPromocion(
  promo: Omit<Promocion, "id" | "creadaEn">,
): Promise<Promocion> {
  const { data, error } = await clienteNavegador()
    .from("promociones")
    .insert({
      titulo: promo.titulo,
      descripcion: promo.descripcion,
      etiqueta: promo.etiqueta,
      desde: promo.desde,
      hasta: promo.hasta,
      activa: promo.activa,
      en_inicio: promo.enInicio,
      notificar: promo.notificar,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "No fue posible crear la promoción.");
  return aPromocion(data);
}

export async function actualizarPromocion(
  id: string,
  cambios: Partial<Promocion>,
): Promise<void> {
  const { error } = await clienteNavegador()
    .from("promociones")
    .update({
      ...(cambios.titulo !== undefined && { titulo: cambios.titulo }),
      ...(cambios.descripcion !== undefined && { descripcion: cambios.descripcion }),
      ...(cambios.etiqueta !== undefined && { etiqueta: cambios.etiqueta }),
      ...(cambios.desde !== undefined && { desde: cambios.desde }),
      ...(cambios.hasta !== undefined && { hasta: cambios.hasta }),
      ...(cambios.activa !== undefined && { activa: cambios.activa }),
      ...(cambios.enInicio !== undefined && { en_inicio: cambios.enInicio }),
      ...(cambios.notificar !== undefined && { notificar: cambios.notificar }),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function eliminarPromocion(id: string): Promise<void> {
  const { error } = await clienteNavegador().from("promociones").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Ids de las promociones que la alumna ya vio. */
export async function promocionesLeidas(usuarioId: string): Promise<string[]> {
  const { data, error } = await clienteNavegador()
    .from("promociones_leidas")
    .select("promocion_id")
    .eq("usuario_id", usuarioId);

  if (error) throw new Error(error.message);
  return (data ?? []).map((f) => f.promocion_id);
}

export async function marcarLeidas(usuarioId: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await clienteNavegador()
    .from("promociones_leidas")
    .upsert(
      ids.map((promocion_id) => ({ usuario_id: usuarioId, promocion_id })),
      { onConflict: "usuario_id,promocion_id", ignoreDuplicates: true },
    );

  if (error) throw new Error(error.message);
}
