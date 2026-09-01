-- =============================================================================
-- Migración 0011 · no permitir reservar clases con horario ya pasado
-- -----------------------------------------------------------------------------
-- Necesaria solo si ya ejecutaste schema.sql antes de esta fecha. En una
-- instalación nueva, schema.sql ya incluye estos cambios y no hace falta
-- correr este archivo.
--
-- Antes solo se validaba el día (fecha), no la hora, así que una alumna
-- podía agendar una clase de un día que ya cursaba pero cuyo horario ya
-- había pasado (ej. una clase de las 8:15 a.m. estando ya casi las 6 p.m.).
-- El staff sí puede seguir agendando clases pasadas si lo necesita.
-- =============================================================================

create or replace function public.validar_reserva()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  limite    smallint;
  dia       smallint;
  hora_clase time;
  ocupados  integer;
  abierto   boolean;
begin
  select cupo, c.day, c.hora into limite, dia, hora_clase
  from public.clases c
  where c.id = new.clase_id
  for update;

  if limite is null then
    raise exception 'La clase no existe';
  end if;

  if not public.es_admin() and (new.fecha + hora_clase) <= now() then
    raise exception 'Esta clase ya pasó';
  end if;

  select activo into abierto from public.configuracion_dias where day = dia;
  if abierto is false then
    raise exception 'El estudio no abre ese día';
  end if;

  select count(*) into ocupados
  from public.reservas r
  where r.clase_id = new.clase_id and r.fecha = new.fecha;

  if ocupados >= limite then
    raise exception 'No quedan cupos disponibles para esta clase';
  end if;

  return new;
end;
$$;
