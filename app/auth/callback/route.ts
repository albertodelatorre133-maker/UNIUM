import { NextResponse } from "next/server";
import { clienteServidor } from "@/lib/supabase/servidor";

/**
 * A donde regresa Google (o cualquier otro proveedor OAuth) después de que
 * la alumna da su consentimiento. Supabase manda un "code" en la URL que hay
 * que cambiar por una sesión real antes de mandarla al portal; el rol lo
 * decide el Guard del lado del cliente una vez adentro.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const sb = await clienteServidor();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/alumnas`);
  }

  return NextResponse.redirect(`${origin}/login?error=google`);
}
