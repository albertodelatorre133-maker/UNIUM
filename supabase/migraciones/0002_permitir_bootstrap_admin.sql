-- =============================================================================
-- Migración 0002 · permitir nombrar al primer staff
-- -----------------------------------------------------------------------------
-- Necesaria solo si ya ejecutaste schema.sql antes de esta fecha. En una
-- instalación nueva, schema.sql ya incluye esta corrección y no hace falta
-- correr este archivo.
--
-- Qué arregla: el disparador que impide que una alumna se ascienda a sí misma
-- también bloqueaba, sin querer, el único UPDATE que convierte la primera
-- cuenta en staff (el que se ejecuta a mano en el SQL Editor). Esa consulta
-- corre sin sesión de Supabase Auth, así que auth.uid() no existe ahí y
-- es_admin() siempre daba falso — la regla se bloqueaba a sí misma.
-- =============================================================================

create or replace function public.proteger_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if not public.es_admin()
     and (new.rol is distinct from old.rol or new.activa is distinct from old.activa) then
    raise exception 'Solo el staff puede cambiar el rol o el estado de una alumna';
  end if;
  return new;
end;
$$;
