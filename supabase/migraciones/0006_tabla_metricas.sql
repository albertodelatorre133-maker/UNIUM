-- =============================================================================
-- Migración 0006 · métricas del hero
-- -----------------------------------------------------------------------------
-- Necesaria solo si ya ejecutaste schema.sql antes de esta fecha. En una
-- instalación nueva, schema.sql ya incluye esta tabla y no hace falta correr
-- este archivo.
--
-- Las cifras destacadas del hero de la landing ("12 · Alumnas por clase", "6 ·
-- Días de operación"...) estaban escritas a mano en app/page.tsx. Esta
-- migración crea la tabla que las gestiona desde /admin/configuracion,
-- sembrada con el mismo contenido que ya se veía para que el cambio sea
-- invisible hasta que alguien edite un valor.
-- =============================================================================

create table if not exists public.metricas (
  id         uuid primary key default gen_random_uuid(),
  valor      text not null,
  etiqueta   text not null,
  orden      smallint not null default 0,
  creada_en  timestamptz not null default now()
);

create index if not exists metricas_orden_idx on public.metricas (orden);

alter table public.metricas enable row level security;

drop policy if exists metricas_leer on public.metricas;
create policy metricas_leer on public.metricas
  for select to anon, authenticated using (true);

drop policy if exists metricas_escribir on public.metricas;
create policy metricas_escribir on public.metricas
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

insert into public.metricas (valor, etiqueta, orden)
select * from (values
  ('12', 'Alumnas por clase', 0),
  ('6', 'Días de operación', 1),
  ('45''', 'Sesión promedio', 2),
  ('100%', 'Entrenamiento guiado', 3)
) as nuevas (valor, etiqueta, orden)
where not exists (select 1 from public.metricas m where m.etiqueta = nuevas.etiqueta);
