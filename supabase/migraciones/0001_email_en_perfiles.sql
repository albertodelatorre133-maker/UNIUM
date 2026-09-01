-- =============================================================================
-- Migración 0001 · correo en perfiles
-- -----------------------------------------------------------------------------
-- Necesaria solo si ya ejecutaste schema.sql antes de esta fecha. En una
-- instalación nueva, schema.sql ya incluye esta columna y no hace falta correr
-- este archivo.
--
-- Por qué: el correo vive en auth.users, una tabla que el cliente no puede
-- leer para cuentas ajenas (ni siquiera el staff). El directorio de alumnas
-- necesita mostrar el correo de cada una, así que se guarda también aquí, en
-- una tabla que sí respeta las políticas de seguridad por filas.
-- =============================================================================

alter table public.perfiles
  add column if not exists email text not null default '';

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
    coalesce(nullif(new.raw_user_meta_data ->> 'nombre', ''), split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'telefono', ''),
    new.email
  );
  return new;
end;
$$;

-- Si ya te registraste antes de correr esta migración, tu perfil quedó con el
-- correo vacío. Esto lo completa a partir de auth.users.
update public.perfiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email = '';
