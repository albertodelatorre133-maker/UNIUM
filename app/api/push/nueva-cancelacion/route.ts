import { NextResponse } from "next/server";
import { clienteServidor } from "@/lib/supabase/servidor";
import { clienteAdmin } from "@/lib/supabase/admin";
import { enviarAAdmins } from "@/lib/servidor/push";

/**
 * Lo llama cualquier alumna autenticada justo antes de cancelar su reserva
 * (mientras la clase todavía existe), para avisarle al staff. El título y el
 * cuerpo se arman aquí con datos de la base, no con texto del cliente.
 */
export async function POST(request: Request) {
  const sb = await clienteServidor();
  const { data: sesion } = await sb.auth.getUser();
  if (!sesion.user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const datos = await request.json().catch(() => null);
  const claseId = datos?.claseId as string | undefined;
  const fecha = datos?.fecha as string | undefined;
  if (!claseId || !fecha) {
    return NextResponse.json({ error: "Falta la clase o la fecha." }, { status: 400 });
  }

  const admin = clienteAdmin();
  const [{ data: clase }, { data: perfil }] = await Promise.all([
    admin.from("clases").select("titulo, hora").eq("id", claseId).single(),
    admin.from("perfiles").select("nombre").eq("id", sesion.user.id).single(),
  ]);

  if (!clase) return NextResponse.json({ error: "La clase ya no existe." }, { status: 404 });

  try {
    await enviarAAdmins({
      titulo: "Reserva cancelada",
      cuerpo: `${perfil?.nombre ?? "Una alumna"} canceló ${clase.titulo} · ${fecha} ${clase.hora.slice(0, 5)}.`,
      url: "/admin/asistencia",
      tipo: "cancelacion",
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
