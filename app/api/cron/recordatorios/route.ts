import { NextResponse } from "next/server";
import { clienteAdmin } from "@/lib/supabase/admin";
import { enviarAUsuario } from "@/lib/servidor/push";

/**
 * Vercel Cron llama esto cada 10 minutos (ver vercel.json). Busca reservas
 * cuya clase empiece dentro de la próxima hora y todavía no tengan el
 * recordatorio enviado, manda la notificación y marca la reserva.
 */
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (secreto) {
    const encabezado = request.headers.get("authorization");
    if (encabezado !== `Bearer ${secreto}`) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
  }

  const sb = clienteAdmin();
  const { data: pendientes, error } = await sb.rpc("reservas_por_recordar");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  for (const r of pendientes ?? []) {
    await enviarAUsuario(r.usuario_id, {
      titulo: "Tu clase empieza pronto",
      cuerpo: `${r.clase_titulo} a las ${r.hora.slice(0, 5)}. ¡Te esperamos!`,
      url: "/alumnas",
    });
    await sb.from("reservas").update({ recordatorio_enviado: true }).eq("id", r.reserva_id);
  }

  return NextResponse.json({ ok: true, enviados: pendientes?.length ?? 0 });
}
