import webpush from "web-push";
import { clienteAdmin } from "@/lib/supabase/admin";
import type { PushSubFila } from "@/lib/supabase/tipos";

/** Servidor únicamente: usa la llave privada VAPID y la llave secreta de Supabase. */

export interface NotificacionPush {
  titulo: string;
  cuerpo: string;
  url?: string;
  /** Define el ícono, la vibración y el botón que usa el service worker al mostrarla. */
  tipo?: "recordatorio" | "cupo" | "promocion" | "reserva" | "cancelacion";
}

function configurarVapid() {
  const clavePublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const clavePrivada = process.env.VAPID_PRIVATE_KEY;
  const sujeto = process.env.VAPID_SUBJECT ?? "mailto:hola@unium.fit";
  if (!clavePublica || !clavePrivada) {
    throw new Error("Faltan NEXT_PUBLIC_VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY.");
  }
  webpush.setVapidDetails(sujeto, clavePublica, clavePrivada);
}

async function enviarASuscripciones(
  sb: ReturnType<typeof clienteAdmin>,
  subs: PushSubFila[],
  notificacion: NotificacionPush,
): Promise<void> {
  const payload = JSON.stringify(notificacion);
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
      } catch (error) {
        // 404/410: el navegador ya no reconoce esa suscripción (se desinstaló,
        // se borraron los datos del sitio, etc.). Se limpia para no reintentar
        // en vano cada vez.
        const codigo = (error as { statusCode?: number }).statusCode;
        if (codigo === 404 || codigo === 410) {
          await sb.from("push_subscripciones").delete().eq("id", s.id);
        }
      }
    }),
  );
}

/** Notifica todos los dispositivos de una alumna en particular. */
export async function enviarAUsuario(usuarioId: string, notificacion: NotificacionPush): Promise<void> {
  configurarVapid();
  const sb = clienteAdmin();
  const { data: subs } = await sb
    .from("push_subscripciones")
    .select("*")
    .eq("usuario_id", usuarioId);
  await enviarASuscripciones(sb, subs ?? [], notificacion);
}

/** Notifica todos los dispositivos suscritos (para avisos generales del estudio). */
export async function enviarATodos(notificacion: NotificacionPush): Promise<void> {
  configurarVapid();
  const sb = clienteAdmin();
  const { data: subs } = await sb.from("push_subscripciones").select("*");
  await enviarASuscripciones(sb, subs ?? [], notificacion);
}

/** Notifica solo a los dispositivos del staff (ej. cuando una alumna agenda una clase). */
export async function enviarAAdmins(notificacion: NotificacionPush): Promise<void> {
  configurarVapid();
  const sb = clienteAdmin();
  const { data: admins } = await sb.from("perfiles").select("id").eq("rol", "admin");
  const ids = (admins ?? []).map((a) => a.id);
  if (ids.length === 0) return;

  const { data: subs } = await sb.from("push_subscripciones").select("*").in("usuario_id", ids);
  await enviarASuscripciones(sb, subs ?? [], notificacion);
}
