-- =============================================================================
-- Migración 0008 · lista de espera
-- -----------------------------------------------------------------------------
-- Necesaria solo si ya ejecutaste schema.sql antes de esta fecha. En una
-- instalación nueva, schema.sql ya incluye esta tabla y no hace falta correr
-- este archivo.
--
-- Cuando una clase está llena, una alumna ahora puede anotarse a la espera de
-- un cupo. No reserva nada por sí sola: le avisa al staff que ese horario
-- tiene demanda de más, y desde el panel de admin se puede pasar manualmente
-- a alguien de la lista a una reserva real si se libera un espacio.
-- =============================================================================

create table if not exists public.lista_espera (
  id          uuid primary key default gen_random_uuid(),
  clase_id    uuid not null references public.clases on delete cascade,
  usuario_id  uuid not null references public.perfiles on delete cascade,
  fecha       date not null,
  creada_en   timestamptz not null default now(),
  unique (clase_id, usuario_id, fecha)
);

create index if not exists lista_espera_clase_idx on public.lista_espera (clase_id, fecha);

alter table public.lista_espera enable row level security;

drop policy if exists lista_espera_leer on public.lista_espera;
create policy lista_espera_leer on public.lista_espera
  for select to authenticated
  using (usuario_id = auth.uid() or public.es_admin());

drop policy if exists lista_espera_crear on public.lista_espera;
create policy lista_espera_crear on public.lista_espera
  for insert to authenticated
  with check (
    public.es_admin()
    or (
      usuario_id = auth.uid()
      and exists (select 1 from public.perfiles p where p.id = auth.uid() and p.activa)
    )
  );

drop policy if exists lista_espera_borrar on public.lista_espera;
create policy lista_espera_borrar on public.lista_espera
  for delete to authenticated
  using (usuario_id = auth.uid() or public.es_admin());
