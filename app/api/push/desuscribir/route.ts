import { NextResponse } from "next/server";
import { clienteServidor } from "@/lib/supabase/servidor";

export async function POST(request: Request) {
  const sb = await clienteServidor();
  const { data: sesion } = await sb.auth.getUser();
  if (!sesion.user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const cuerpo = await request.json().catch(() => null);
  const endpoint = cuerpo?.endpoint as string | undefined;
  if (!endpoint) return NextResponse.json({ error: "Falta el endpoint." }, { status: 400 });

  await sb
    .from("push_subscripciones")
    .delete()
    .eq("endpoint", endpoint)
    .eq("usuario_id", sesion.user.id);

  return NextResponse.json({ ok: true });
}
