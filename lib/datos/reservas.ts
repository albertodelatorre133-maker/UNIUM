"use client";

import { clienteNavegador } from "@/lib/supabase/cliente";
import { aReserva, mensajeDeError } from "./comun";
import type { Booking, User } from "@/lib/types";
import type { Resultado } from "./auth";

/** Cuántos cupos hay tomados en cada clase y fecha del rango. */
export async function ocupacionDeSemana(
  desde: string,
  hasta: string,
): Promise<Map<string, number>> {
  const { data, error } = await clienteNavegador().rpc("ocupacion", { desde, hasta });
  if (error) throw new Error(error.message);

  const mapa = new Map<string, number>();
  (data ?? []).forEach((fila) => {
    mapa.set(`${fila.clase_id}|${fila.fecha}`, Number(fila.reservadas));
  });
  return mapa;
}

/** Reservas propias dentro de un rango, para marcar el calendario. */
export async function misReservas(desde: string, hasta: string): Promise<Booking[]> {
  const { data, error } = await clienteNavegador()
    .from("reservas")
    .select("*")
    .gte("fecha", desde)
    .lte("fecha", hasta);

  if (error) throw new Error(error.message);
  return (data ?? []).map(aReserva);
}

/**
 * El cupo y el día cerrado los valida un disparador de la base de datos, así
 * que aquí basta con traducir su error a un mensaje para la alumna.
 */
export async function reservar(claseId: string, fecha: string): Promise<Resultado> {
  const sb = clienteNavegador();
  const { data: sesion } = await sb.auth.getUser();
  if (!sesion.user) return { ok: false, error: "Inicia sesión para agendar." };

  const { error } = await sb
    .from("reservas")
    .insert({ clase_id: claseId, usuario_id: sesion.user.id, fecha });

  return error ? { ok: false, error: mensajeDeError(error) } : { ok: true };
}

export async function cancelar(reservaId: string): Promise<Resultado> {
  const { error } = await clienteNavegador().from("reservas").delete().eq("id", reservaId);
  return error ? { ok: false, error: mensajeDeError(error) } : { ok: true };
}

export async function historialDeUsuario(usuarioId: string): Promise<Booking[]> {
  const { data, error } = await clienteNavegador()
    .from("reservas")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("fecha", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(aReserva);
}

/** Lista de asistencia de una sesión: reserva y datos de cada alumna. */
export async function reservasDeSesion(
  claseId: string,
  fecha: string,
): Promise<Array<{ booking: Booking; alumna: User }>> {
  const sb = clienteNavegador();

  const { data: reservas, error } = await sb
    .from("reservas")
    .select("*")
    .eq("clase_id", claseId)
    .eq("fecha", fecha);

  if (error) throw new Error(error.message);
  if (!reservas?.length) return [];

  const { data: perfiles, error: errorPerfiles } = await sb
    .from("perfiles")
    .select("*")
    .in("id", reservas.map((r) => r.usuario_id));

  if (errorPerfiles) throw new Error(errorPerfiles.message);

  const porId = new Map((perfiles ?? []).map((p) => [p.id, p]));
  return reservas
    .map((fila) => {
      const perfil = porId.get(fila.usuario_id);
      if (!perfil) return null;
      return {
        booking: aReserva(fila),
        alumna: {
          id: perfil.id,
          nombre: perfil.nombre,
          email: "",
          telefono: perfil.telefono,
          role: perfil.rol,
          activa: perfil.activa,
          creadaEn: perfil.creada_en,
        } satisfies User,
      };
    })
    .filter((r): r is { booking: Booking; alumna: User } => r !== null)
    .sort((a, b) => a.alumna.nombre.localeCompare(b.alumna.nombre));
}

export async function marcarAsistencia(reservaId: string, asistio: boolean): Promise<void> {
  const { error } = await clienteNavegador()
    .from("reservas")
    .update({ asistio })
    .eq("id", reservaId);

  if (error) throw new Error(error.message);
}
