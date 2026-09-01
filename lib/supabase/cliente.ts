"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./tipos";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLAVE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Indica si el proyecto tiene credenciales configuradas. Mientras no las
 * tenga, la aplicación sigue funcionando con el almacén local del navegador.
 */
export function hayBaseDeDatos(): boolean {
  return Boolean(URL && CLAVE);
}

let instancia: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Cliente de navegador, reutilizado entre componentes. */
export function clienteNavegador() {
  if (!URL || !CLAVE) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Cópialas de tu proyecto de Supabase en el archivo .env.local.",
    );
  }
  if (!instancia) instancia = createBrowserClient<Database>(URL, CLAVE);
  return instancia;
}
