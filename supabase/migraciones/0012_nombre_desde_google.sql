-- =============================================================================
-- Migración 0012 · nombre por defecto para cuentas creadas con Google
-- -----------------------------------------------------------------------------
-- Necesaria solo si ya ejecutaste schema.sql antes de esta fecha. En una
-- instalación nueva, schema.sql ya incluye estos cambios y no hace falta
-- correr este archivo.
--
-- Al entrar con Google no se pasa por el formulario de registro propio, así
-- que raw_user_meta_data no trae la clave "nombre" (la manda nuestro
-- formulario), sino "full_name"/"name" (las manda Google). Antes de este
-- cambio, esas cuentas quedaban con el nombre igual a la parte del correo
-- antes de la @.
-- =============================================================================

create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, telefono, email)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nombre', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data ->> 'telefono', ''),
    new.email
  );
  return new;
end;
$$;
