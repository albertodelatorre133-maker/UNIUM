/**
 * Tipos de la base de datos, escritos a mano a partir de supabase/schema.sql.
 *
 * Cuando el esquema cambie puedes regenerarlos con la CLI de Supabase:
 *   npx supabase gen types typescript --project-id <id> > lib/supabase/tipos.ts
 */

export type Rol = "alumna" | "admin";

/*
 * Nota: las filas se declaran con `type` y no con `interface`. postgrest-js
 * comprueba que cada fila encaje en Record<string, unknown>, y una interfaz no
 * lo cumple porque TypeScript no le da firma de índice implícita.
 */

export type PerfilFila = {
  id: string;
  nombre: string;
  telefono: string;
  rol: Rol;
  activa: boolean;
  creada_en: string;
};

export type DiaFila = {
  day: number;
  activo: boolean;
  apertura: string;
  cierre: string;
};

export type ClaseFila = {
  id: string;
  titulo: string;
  descripcion: string;
  day: number;
  hora: string;
  duracion: number;
  coach: string;
  cupo: number;
  semanal: boolean;
  fecha: string | null;
  creada_en: string;
};

export type ReservaFila = {
  id: string;
  clase_id: string;
  usuario_id: string;
  fecha: string;
  asistio: boolean;
  creada_en: string;
};

export type PromocionFila = {
  id: string;
  titulo: string;
  descripcion: string;
  etiqueta: string;
  desde: string;
  hasta: string;
  activa: boolean;
  en_inicio: boolean;
  notificar: boolean;
  creada_en: string;
};

export type PromocionLeidaFila = {
  usuario_id: string;
  promocion_id: string;
  leida_en: string;
};

type Tabla<Fila, Insercion = Partial<Fila>, Actualizacion = Partial<Fila>> = {
  Row: Fila;
  Insert: Insercion;
  Update: Actualizacion;
  // postgrest-js exige esta clave; solo la usa para inferir joins.
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      perfiles: Tabla<PerfilFila>;
      configuracion_dias: Tabla<DiaFila>;
      clases: Tabla<ClaseFila>;
      reservas: Tabla<ReservaFila>;
      promociones: Tabla<PromocionFila>;
      promociones_leidas: Tabla<PromocionLeidaFila>;
    };
    Views: Record<string, never>;
    Functions: {
      ocupacion: {
        Args: { desde: string; hasta: string };
        Returns: Array<{ clase_id: string; fecha: string; reservadas: number }>;
      };
      es_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: { rol_usuario: Rol };
    CompositeTypes: Record<string, never>;
  };
};
