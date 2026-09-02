import { NextResponse } from "next/server";
import { clienteServidor } from "@/lib/supabase/servidor";
import { clienteAdmin } from "@/lib/supabase/admin";

/**
 * Borra la cuenta completa de una alumna (auth.users, que en cascada se
 * lleva su perfil, reservas, lista de espera, etc.) — por eso hace falta la
 * llave de servicio, no un simple delete desde el navegador. Solo el staff
 * puede llamarla, y solo si la alumna no tiene ninguna reserva registrada,
 * para no perder el historial de alguien que sí usó el estudio.
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
    return NextResponse.json({ error: "Solo el staff puede eliminar alumnas." }, { status: 403 });
  }

  const datos = await request.json().catch(() => null);
  const usuarioId = datos?.usuarioId as string | undefined;
  if (!usuarioId) {
    return NextResponse.json({ error: "Falta la alumna a eliminar." }, { status: 400 });
  }

  const admin = clienteAdmin();

  const { count, error: errorConteo } = await admin
    .from("reservas")
    .select("id", { count: "exact", head: true })
    .eq("usuario_id", usuarioId);

  if (errorConteo) {
    return NextResponse.json({ error: errorConteo.message }, { status: 500 });
  }
  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "No puedes eliminar esta alumna: todavía tiene clases reservadas." },
      { status: 400 },
    );
  }

  const { error } = await admin.auth.admin.deleteUser(usuarioId);
  if (error) {
    return NextResponse.json({ error: "No fue posible eliminar la alumna." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
