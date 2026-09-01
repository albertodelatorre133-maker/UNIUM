import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./tipos";

/** Cliente para componentes de servidor y manejadores de ruta. */
export async function clienteServidor() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !clave) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const almacen = await cookies();

  return createServerClient<Database>(url, clave, {
    cookies: {
      getAll() {
        return almacen.getAll();
      },
      setAll(nuevas) {
        try {
          nuevas.forEach(({ name, value, options }) => {
            almacen.set(name, value, options);
          });
        } catch {
          // En un componente de servidor las cookies son de solo lectura; el
          // middleware se encarga de refrescar la sesión.
        }
      },
    },
  });
}
