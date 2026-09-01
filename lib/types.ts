export type Role = "alumna" | "admin";

export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  /** Solo se usa en el modo local; con base de datos la gestiona Supabase. */
  password?: string;
  role: Role;
  activa: boolean;
  creadaEn: string;
}

/** Configuracion operativa de un dia de la semana (0 = Lunes ... 6 = Domingo). */
export interface DayConfig {
  day: number;
  activo: boolean;
  apertura: string; // "06:00"
  cierre: string; // "21:00"
}

export interface ClassSession {
  id: string;
  titulo: string;
  descripcion: string;
  day: number; // 0 = Lunes ... 6 = Domingo
  hora: string; // "07:00"
  duracion: number; // minutos
  coachId: string;
  cupo: number;
  semanal: boolean; // se repite cada semana
  fecha: string | null; // YYYY-MM-DD cuando NO es semanal
}

export interface Booking {
  id: string;
  classId: string;
  userId: string;
  fecha: string; // YYYY-MM-DD de la sesion reservada
  asistio: boolean;
  creadaEn: string;
}

/** Promocion configurable desde el panel de administracion. */
export interface Promocion {
  id: string;
  titulo: string;
  descripcion: string;
  etiqueta: string; // distintivo corto: "2X1", "-30%", "NUEVA"
  desde: string; // YYYY-MM-DD
  hasta: string; // YYYY-MM-DD
  activa: boolean;
  enInicio: boolean; // se muestra en la landing publica
  notificar: boolean; // llega como notificacion a las alumnas
  creadaEn: string;
}

/**
 * Coach del estudio, gestionada desde el panel de administración. Las
 * iniciales del avatar se calculan del nombre con `inicialesDe()` en vez de
 * guardarse aparte, así nunca quedan desincronizadas.
 */
export interface Coach {
  id: string;
  nombre: string;
  especialidad: string;
  bio: string;
  activa: boolean;
  creadaEn: string;
}

/** Datos generales del estudio, editables desde /admin/configuracion. */
export interface Estudio {
  nombre: string;
  lema: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
  instagram: string;
  mapa: string;
}

/** Uno de los "pilares" del método, mostrados en la landing. */
export interface Pilar {
  id: string;
  icono: string;
  titulo: string;
  texto: string;
  orden: number;
}

/** Una de las cifras destacadas del hero de la landing (ej. "12 · Alumnas por clase"). */
export interface Metrica {
  id: string;
  valor: string;
  etiqueta: string;
  orden: number;
}

export interface AppState {
  users: User[];
  config: DayConfig[];
  classes: ClassSession[];
  bookings: Booking[];
  promociones: Promocion[];
  coaches: Coach[];
  estudio: Estudio;
  pilares: Pilar[];
  metricas: Metrica[];
  /** Promociones ya vistas por cada alumna: userId -> ids de promocion. */
  leidas: Record<string, string[]>;
  sessionUserId: string | null;
}
