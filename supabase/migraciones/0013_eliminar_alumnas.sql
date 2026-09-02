-- =============================================================================
-- Migración 0013 · eliminar alumnas sin reservas
-- -----------------------------------------------------------------------------
-- Necesaria solo si ya ejecutaste schema.sql antes de esta fecha. En una
-- instalación nueva, schema.sql ya incluye estos cambios y no hace falta
-- correr este archivo.
--
-- Permite que el staff elimine por completo la cuenta de una alumna (desde
-- Directorio de alumnas, solo en pantallas grandes) cuando no tiene ninguna
-- reserva registrada, para no perder historial por accidente. El borrado en
-- sí lo hace un endpoint de servidor con la llave de servicio (borra
-- auth.users, que en cascada se lleva perfiles/reservas/etc.); esta
-- migración agrega el resguardo del lado de la base y el permiso de RLS.
-- =============================================================================

create or replace function public.validar_borrado_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reservas_activas integer;
begin
  select count(*) into reservas_activas from public.reservas where usuario_id = old.id;
  if reservas_activas > 0 then
    raise exception 'No se puede eliminar: la alumna todavía tiene reservas.';
  end if;
  return old;
end;
$$;

drop trigger if exists perfiles_validar_borrado on public.perfiles;
create trigger perfiles_validar_borrado
  before delete on public.perfiles
  for each row execute function public.validar_borrado_perfil();

drop policy if exists perfiles_borrar on public.perfiles;
create policy perfiles_borrar on public.perfiles
  for delete to authenticated
  using (public.es_admin());
