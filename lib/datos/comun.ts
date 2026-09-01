import type { Booking, ClassSession, Coach, DayConfig, Promocion, User } from "@/lib/types";
import type {
  ClaseFila,
  CoachFila,
  DiaFila,
  PerfilFila,
  PromocionFila,
  ReservaFila,
} from "@/lib/supabase/tipos";

/** Postgres devuelve las horas como "06:00:00"; la aplicación usa "06:00". */
export function hhmm(hora: string): string {
  return hora.slice(0, 5);
}

export function aDia(fila: DiaFila): DayConfig {
  return {
    day: fila.day,
    activo: fila.activo,
    apertura: hhmm(fila.apertura),
    cierre: hhmm(fila.cierre),
  };
}

export function aClase(fila: ClaseFila): ClassSession {
  return {
    id: fila.id,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    day: fila.day,
    hora: hhmm(fila.hora),
    duracion: fila.duracion,
    coach: fila.coach,
    cupo: fila.cupo,
    semanal: fila.semanal,
    fecha: fila.fecha,
  };
}

export function aReserva(fila: ReservaFila): Booking {
  return {
    id: fila.id,
    classId: fila.clase_id,
    userId: fila.usuario_id,
    fecha: fila.fecha,
    asistio: fila.asistio,
    creadaEn: fila.creada_en,
  };
}

export function aUsuario(fila: PerfilFila): User {
  return {
    id: fila.id,
    nombre: fila.nombre,
    email: fila.email,
    telefono: fila.telefono,
    role: fila.rol,
    activa: fila.activa,
    creadaEn: fila.creada_en,
  };
}

export function aPromocion(fila: PromocionFila): Promocion {
  return {
    id: fila.id,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    etiqueta: fila.etiqueta,
    desde: fila.desde,
    hasta: fila.hasta,
    activa: fila.activa,
    enInicio: fila.en_inicio,
    notificar: fila.notificar,
    creadaEn: fila.creada_en,
  };
}

export function aCoach(fila: CoachFila): Coach {
  return {
    id: fila.id,
    nombre: fila.nombre,
    especialidad: fila.especialidad,
    bio: fila.bio,
    activa: fila.activa,
    creadaEn: fila.creada_en,
  };
}

/** Convierte el error de Postgres en un mensaje que se puede mostrar. */
export function mensajeDeError(error: { message: string; code?: string } | null): string {
  if (!error) return "";
  if (error.message.includes("No quedan cupos")) return "No quedan cupos disponibles.";
  if (error.message.includes("no abre ese día")) return "El estudio no abre ese día.";
  if (error.code === "23505") return "Ya tienes un cupo en esta clase.";
  return error.message;
}
