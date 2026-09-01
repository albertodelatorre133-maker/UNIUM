import { NextResponse } from "next/server";
import { clienteServidor } from "@/lib/supabase/servidor";

export async function POST(request: Request) {
  const sb = await clienteServidor();
  const { data: sesion } = await sb.auth.getUser();
  if (!sesion.user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const cuerpo = await request.json().catch(() => null);
  const endpoint = cuerpo?.endpoint as string | undefined;
  const p256dh = cuerpo?.keys?.p256dh as string | undefined;
  const auth = cuerpo?.keys?.auth as string | undefined;

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Suscripción inválida." }, { status: 400 });
  }

  const { error } = await sb
    .from("push_subscripciones")
    .upsert(
      { usuario_id: sesion.user.id, endpoint, p256dh, auth },
      { onConflict: "endpoint" },
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
