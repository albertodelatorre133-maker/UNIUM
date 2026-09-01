-- =============================================================================
-- Migración 0007 · registro de cancelaciones
-- -----------------------------------------------------------------------------
-- Necesaria solo si ya ejecutaste schema.sql antes de esta fecha. En una
-- instalación nueva, schema.sql ya incluye esta tabla y no hace falta correr
-- este archivo.
--
-- Hasta ahora cancelar una reserva la borraba sin dejar rastro: no había
-- forma de ver quién canceló, qué clase ni a qué hora. Esta migración agrega
-- una tabla de historial que un disparador llena automáticamente justo antes
-- de borrar cada reserva, así que funciona sin importar desde dónde se
-- cancele (la app de la alumna, el panel de admin, o directo en la base).
-- =============================================================================

create table if not exists public.cancelaciones (
  id                    uuid primary key default gen_random_uuid(),
  usuario_id            uuid,
  usuario_nombre        text not null,
  clase_id              uuid,
  clase_titulo          text not null,
  fecha_clase           date not null,
  cancelada_en          timestamptz not null default now(),
  cancelada_por_id      uuid,
  cancelada_por_nombre  text not null default 'Sistema'
);

create index if not exists cancelaciones_fecha_idx on public.cancelaciones (cancelada_en desc);

alter table public.cancelaciones enable row level security;

drop policy if exists cancelaciones_leer on public.cancelaciones;
create policy cancelaciones_leer on public.cancelaciones
  for select to authenticated using (public.es_admin());

create or replace function public.registrar_cancelacion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  nombre_alumna text;
  titulo_clase  text;
  nombre_quien  text;
begin
  select nombre into nombre_alumna from public.perfiles where id = old.usuario_id;
  select titulo into titulo_clase  from public.clases   where id = old.clase_id;
  if auth.uid() is not null then
    select nombre into nombre_quien from public.perfiles where id = auth.uid();
  end if;

  insert into public.cancelaciones (
    usuario_id, usuario_nombre, clase_id, clase_titulo, fecha_clase,
    cancelada_por_id, cancelada_por_nombre
  ) values (
    old.usuario_id,
    coalesce(nombre_alumna, 'Alumna eliminada'),
    old.clase_id,
    coalesce(titulo_clase, 'Clase eliminada'),
    old.fecha,
    auth.uid(),
    coalesce(nombre_quien, 'Sistema')
  );
  return old;
end;
$$;

drop trigger if exists reservas_registrar_cancelacion on public.reservas;
create trigger reservas_registrar_cancelacion
  before delete on public.reservas
  for each row execute function public.registrar_cancelacion();
