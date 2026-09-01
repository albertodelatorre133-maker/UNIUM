-- =============================================================================
-- Migración 0009 · notificaciones push
-- -----------------------------------------------------------------------------
-- Necesaria solo si ya ejecutaste schema.sql antes de esta fecha. En una
-- instalación nueva, schema.sql ya incluye estos cambios y no hace falta
-- correr este archivo.
--
-- Agrega lo necesario para mandar notificaciones push (Web Push) a las
-- alumnas que dieron permiso: cuando se les pasa de la lista de espera a un
-- cupo real, cuando se publica una promoción marcada para notificar, y un
-- recordatorio automático una hora antes de cada clase reservada.
-- =============================================================================

alter table public.reservas
  add column if not exists recordatorio_enviado boolean not null default false;

create table if not exists public.push_subscripciones (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null references public.perfiles on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  creada_en   timestamptz not null default now()
);

alter table public.push_subscripciones enable row level security;

drop policy if exists push_subs_propias on public.push_subscripciones;
create policy push_subs_propias on public.push_subscripciones
  for all to authenticated
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

create or replace function public.reservas_por_recordar()
returns table (reserva_id uuid, usuario_id uuid, clase_titulo text, hora time, fecha date)
language sql
stable
security definer
set search_path = public
as $$
  select r.id, r.usuario_id, c.titulo, c.hora, r.fecha
  from public.reservas r
  join public.clases c on c.id = r.clase_id
  where r.recordatorio_enviado = false
    and (r.fecha + c.hora) between (now() + interval '55 minutes') and (now() + interval '65 minutes');
$$;
