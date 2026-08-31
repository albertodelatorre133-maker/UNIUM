export type Role = "alumna" | "admin";

export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  password: string;
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
  coach: string;
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

export interface Coach {
  nombre: string;
  especialidad: string;
  bio: string;
  iniciales: string;
}

export interface AppState {
  users: User[];
  config: DayConfig[];
  classes: ClassSession[];
  bookings: Booking[];
  sessionUserId: string | null;
}
