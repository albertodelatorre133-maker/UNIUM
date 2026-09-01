"use client";

/** Convierte la llave pública VAPID (base64url) al formato que pide la Push API. */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

export function soportaNotificaciones(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export async function notificacionesActivas(): Promise<boolean> {
  if (!soportaNotificaciones()) return false;
  const registro = await navigator.serviceWorker.getRegistration();
  const suscripcion = await registro?.pushManager.getSubscription();
  return Boolean(suscripcion);
}

export async function activarNotificaciones(): Promise<{ ok: boolean; error?: string }> {
  if (!soportaNotificaciones()) {
    return { ok: false, error: "Este navegador no soporta notificaciones." };
  }

  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") {
    return { ok: false, error: "No diste permiso para las notificaciones." };
  }

  const clave = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!clave) {
    return { ok: false, error: "Las notificaciones todavía no están configuradas." };
  }

  try {
    const registro = await navigator.serviceWorker.register("/sw.js");
    const suscripcion = await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(clave),
    });

    const r = await fetch("/api/push/suscribir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(suscripcion.toJSON()),
    });
    if (!r.ok) return { ok: false, error: "No fue posible guardar la suscripción." };
    return { ok: true };
  } catch {
    return { ok: false, error: "No fue posible activar las notificaciones." };
  }
}

export async function desactivarNotificaciones(): Promise<void> {
  if (!soportaNotificaciones()) return;
  const registro = await navigator.serviceWorker.getRegistration();
  const suscripcion = await registro?.pushManager.getSubscription();
  if (!suscripcion) return;

  await fetch("/api/push/desuscribir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: suscripcion.endpoint }),
  }).catch(() => {});

  await suscripcion.unsubscribe();
}

/**
 * Le pide al servidor que mande un push. Se llama después de que la acción
 * principal (crear la promoción, pasar de la lista de espera) ya se guardó
 * bien, así que una falla aquí no debe impedirla ni mostrarse como error.
 */
export async function notificarPush(payload: {
  usuarioId?: string;
  broadcast?: boolean;
  titulo: string;
  cuerpo: string;
  url?: string;
  tipo?: "recordatorio" | "cupo" | "promocion";
}): Promise<void> {
  try {
    await fetch("/api/push/notificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // silencio: es un plus, no debe bloquear el flujo principal.
  }
}
