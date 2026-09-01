-- =============================================================================
-- Migración 0010 · validar cancelación con una hora de anticipación
-- -----------------------------------------------------------------------------
-- Necesaria solo si ya ejecutaste schema.sql antes de esta fecha. En una
-- instalación nueva, schema.sql ya incluye estos cambios y no hace falta
-- correr este archivo.
--
-- Una alumna ya no puede cancelar su propia reserva si la clase ya empezó o
-- si falta menos de una hora. El staff sí puede, para liberar cupos a
-- último momento por su cuenta.
-- =============================================================================

create or replace function public.validar_cancelacion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  hora_clase time;
begin
  if public.es_admin() then
    return old;
  end if;

  select c.hora into hora_clase from public.clases c where c.id = old.clase_id;

  if hora_clase is not null and (old.fecha + hora_clase) < (now() + interval '60 minutes') then
    raise exception 'Ya no se puede cancelar: falta menos de una hora para la clase.';
  end if;

  return old;
end;
$$;

drop trigger if exists reservas_cancelacion_validar on public.reservas;
create trigger reservas_cancelacion_validar
  before delete on public.reservas
  for each row execute function public.validar_cancelacion();
