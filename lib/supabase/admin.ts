import { createClient } from "@supabase/supabase-js";
import type { Database } from "./tipos";

/**
 * Cliente con la llave secreta (service_role): salta la seguridad por filas
 * por completo. SOLO se importa desde manejadores de ruta en app/api/**,
 * que corren en el servidor — nunca desde un componente "use client" ni
 * desde código que termine en el paquete del navegador.
 *
 * Se necesita aquí porque el cron de recordatorios y el envío de
 * notificaciones corren sin una sesión de usuario, y tienen que poder leer
 * las reservas y suscripciones push de cualquier alumna para avisarle.
 */
export function clienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.SUPABASE_SECRET_KEY;

  if (!url || !clave) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY para las notificaciones push.",
    );
  }

  return createClient<Database>(url, clave, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
