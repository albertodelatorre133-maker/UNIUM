import type {
  Booking,
  Cancelacion,
  ClassSession,
  Coach,
  DayConfig,
  EsperaEntry,
  Estudio,
  Metrica,
  Pilar,
  Promocion,
  User,
} from "@/lib/types";
import type {
  CancelacionFila,
  ClaseFila,
  CoachFila,
  DiaFila,
  EsperaFila,
  EstudioFila,
  MetricaFila,
  PerfilFila,
  PilarFila,
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
    coachId: fila.coach_id,
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

export function aEstudio(fila: EstudioFila): Estudio {
  return {
    nombre: fila.nombre,
    lema: fila.lema,
    direccion: fila.direccion,
    ciudad: fila.ciudad,
    telefono: fila.telefono,
    email: fila.email,
    instagram: fila.instagram,
    mapa: fila.mapa,
  };
}

export function aPilar(fila: PilarFila): Pilar {
  return {
    id: fila.id,
    icono: fila.icono,
    titulo: fila.titulo,
    texto: fila.texto,
    orden: fila.orden,
  };
}

export function aMetrica(fila: MetricaFila): Metrica {
  return {
    id: fila.id,
    valor: fila.valor,
    etiqueta: fila.etiqueta,
    orden: fila.orden,
  };
}

export function aCancelacion(fila: CancelacionFila): Cancelacion {
  return {
    id: fila.id,
    usuarioId: fila.usuario_id,
    usuarioNombre: fila.usuario_nombre,
    claseId: fila.clase_id,
    claseTitulo: fila.clase_titulo,
    fechaClase: fila.fecha_clase,
    canceladaEn: fila.cancelada_en,
    canceladaPorId: fila.cancelada_por_id,
    canceladaPorNombre: fila.cancelada_por_nombre,
  };
}

export function aEspera(fila: EsperaFila): EsperaEntry {
  return {
    id: fila.id,
    classId: fila.clase_id,
    userId: fila.usuario_id,
    fecha: fila.fecha,
    creadaEn: fila.creada_en,
  };
}

/** Convierte el error de Postgres en un mensaje que se puede mostrar. */
export function mensajeDeError(error: { message: string; code?: string } | null): string {
  if (!error) return "";
  if (error.message.includes("No quedan cupos")) return "No quedan cupos disponibles.";
  if (error.message.includes("no abre ese día")) return "El estudio no abre ese día.";
  if (error.code === "23505") return "Ya tienes un cupo en esta clase.";
  if (error.code === "23503")
    return "No puedes eliminar esta coach: todavía tiene clases asignadas. Reasígnalas o elimínalas primero.";
  return error.message;
}
