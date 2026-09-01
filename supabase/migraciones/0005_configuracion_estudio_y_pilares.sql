-- =============================================================================
-- Migración 0005 · configuración del estudio y pilares del método
-- -----------------------------------------------------------------------------
-- Necesaria solo si ya ejecutaste schema.sql antes de esta fecha. En una
-- instalación nueva, schema.sql ya incluye estas dos tablas y no hace falta
-- correr este archivo.
--
-- Hasta ahora los datos del estudio (dirección, teléfono, redes...) y los
-- "cuatro pilares" del método vivían escritos a mano en el código (lib/seed.ts
-- y app/page.tsx). Esta migración crea las tablas que los gestionan desde
-- /admin/configuracion, sembradas con el mismo contenido que ya se veía en la
-- landing para que el cambio sea invisible hasta que alguien edite algo.
-- =============================================================================

create table if not exists public.configuracion_estudio (
  id          smallint primary key default 1 check (id = 1),
  nombre      text not null default '',
  lema        text not null default '',
  direccion   text not null default '',
  ciudad      text not null default '',
  telefono    text not null default '',
  email       text not null default '',
  instagram   text not null default '',
  mapa        text not null default ''
);

create table if not exists public.pilares (
  id         uuid primary key default gen_random_uuid(),
  icono      text not null default 'fitness_center',
  titulo     text not null,
  texto      text not null default '',
  orden      smallint not null default 0,
  creada_en  timestamptz not null default now()
);

create index if not exists pilares_orden_idx on public.pilares (orden);

alter table public.configuracion_estudio enable row level security;
alter table public.pilares               enable row level security;

drop policy if exists configuracion_estudio_leer on public.configuracion_estudio;
create policy configuracion_estudio_leer on public.configuracion_estudio
  for select to anon, authenticated using (true);

drop policy if exists configuracion_estudio_editar on public.configuracion_estudio;
create policy configuracion_estudio_editar on public.configuracion_estudio
  for update to authenticated using (public.es_admin()) with check (public.es_admin());

drop policy if exists pilares_leer on public.pilares;
create policy pilares_leer on public.pilares
  for select to anon, authenticated using (true);

drop policy if exists pilares_escribir on public.pilares;
create policy pilares_escribir on public.pilares
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

insert into public.configuracion_estudio (id, nombre, lema, direccion, ciudad, telefono, email, instagram, mapa)
values (
  1,
  'UNIUM Wellness Training',
  'Unidos somos más fuertes',
  'Calle 93B #13-45, Chicó Norte',
  'Bogotá, Colombia',
  '+57 320 448 9012',
  'hola@unium.fit',
  '@unium.wellness',
  'https://www.openstreetmap.org/export/embed.html?bbox=-74.0530%2C4.6720%2C-74.0400%2C4.6800&layer=mapnik&marker=4.6760%2C-74.0465'
)
on conflict (id) do nothing;

insert into public.pilares (icono, titulo, texto, orden)
select * from (values
  ('fitness_center', 'Fuerza con técnica',
   'Progresiones medidas, cargas conscientes y corrección constante. Cada bloque se construye sobre el anterior.', 0),
  ('self_improvement', 'Movilidad y core',
   'Respiración, control profundo y rangos articulares reales. La base sobre la que se sostiene la fuerza.', 1),
  ('monitor_heart', 'Intensidad medida',
   'Intervalos diseñados con control de ritmo cardiaco y recuperación activa. Intensidad, nunca improvisación.', 2),
  ('diversity_3', 'Grupos reducidos',
   'Máximo 12 alumnas por sesión para que la coach acompañe cada repetición. Unidos somos más fuertes.', 3)
) as nuevas (icono, titulo, texto, orden)
where not exists (select 1 from public.pilares p where p.titulo = nuevas.titulo);
