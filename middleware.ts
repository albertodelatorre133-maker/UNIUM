import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refresca la sesión de Supabase en cada navegación para que las cookies no
 * caduquen mientras la alumna usa la aplicación.
 *
 * Mientras el proyecto no tenga credenciales, no hace nada: la aplicación
 * sigue funcionando con el almacén local del navegador.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !clave) return NextResponse.next();

  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(url, clave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(nuevas) {
        nuevas.forEach(({ name, value }) => request.cookies.set(name, value));
        respuesta = NextResponse.next({ request });
        nuevas.forEach(({ name, value, options }) =>
          respuesta.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getUser();
  return respuesta;
}

export const config = {
  matcher: [
    // Todo salvo archivos estáticos e imágenes.
    "/((?!_next/static|_next/image|favicon.ico|fotos|marca|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
