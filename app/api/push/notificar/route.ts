import { NextResponse } from "next/server";
import { clienteServidor } from "@/lib/supabase/servidor";
import { enviarATodos, enviarAUsuario } from "@/lib/servidor/push";

/**
 * Solo el staff puede llamar esto: se usa cuando se publica una promoción
 * marcada para notificar, o cuando se pasa a alguien de la lista de espera a
 * una reserva real. El recordatorio de "tu clase empieza pronto" no pasa por
 * aquí — lo manda directamente el cron en app/api/cron/recordatorios.
 */
export async function POST(request: Request) {
  const sb = await clienteServidor();
  const { data: sesion } = await sb.auth.getUser();
  if (!sesion.user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { data: perfil } = await sb
    .from("perfiles")
    .select("rol")
    .eq("id", sesion.user.id)
    .single();

  if (perfil?.rol !== "admin") {
    return NextResponse.json({ error: "Solo el staff puede enviar notificaciones." }, { status: 403 });
  }

  const datos = await request.json().catch(() => null);
  const titulo = datos?.titulo as string | undefined;
  const cuerpo = datos?.cuerpo as string | undefined;
  const url = datos?.url as string | undefined;
  const usuarioId = datos?.usuarioId as string | undefined;
  const broadcast = Boolean(datos?.broadcast);

  if (!titulo || !cuerpo) {
    return NextResponse.json({ error: "Falta el título o el mensaje." }, { status: 400 });
  }

  try {
    if (broadcast) {
      await enviarATodos({ titulo, cuerpo, url });
    } else if (usuarioId) {
      await enviarAUsuario(usuarioId, { titulo, cuerpo, url });
    } else {
      return NextResponse.json({ error: "Falta el destinatario." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
