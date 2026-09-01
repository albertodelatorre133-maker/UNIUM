-- =============================================================================
-- Migración 0003 · tabla de coaches
-- -----------------------------------------------------------------------------
-- Necesaria solo si ya ejecutaste schema.sql antes de esta fecha. En una
-- instalación nueva, schema.sql ya incluye esta tabla y no hace falta correr
-- este archivo.
--
-- Antes las coaches estaban escritas a mano en el código (lib/seed.ts). Esta
-- migración crea la tabla que las gestiona desde el panel de administración,
-- sin tocar las clases que ya existen: siguen guardando el nombre de la coach
-- como texto, y un disparador nuevo mantiene ese texto al día si alguien
-- renombra a la coach desde el panel.
-- =============================================================================

create table if not exists public.coaches (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  especialidad  text not null default '',
  bio           text not null default '',
  activa        boolean not null default true,
  creada_en     timestamptz not null default now()
);

create index if not exists coaches_activa_idx on public.coaches (activa);

alter table public.coaches enable row level security;

drop policy if exists coaches_leer on public.coaches;
create policy coaches_leer on public.coaches
  for select to anon, authenticated
  using (activa or public.es_admin());

drop policy if exists coaches_escribir on public.coaches;
create policy coaches_escribir on public.coaches
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

create or replace function public.propagar_nombre_coach()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.nombre is distinct from old.nombre then
    update public.clases set coach = new.nombre where coach = old.nombre;
  end if;
  return new;
end;
$$;

drop trigger if exists coaches_propagar_nombre on public.coaches;
create trigger coaches_propagar_nombre
  after update on public.coaches
  for each row execute function public.propagar_nombre_coach();

-- Siembra las tres coaches que ya tenías en el código, para no perderlas.
insert into public.coaches (nombre, especialidad, bio)
select * from (values
  ('Valeria Ortiz', 'Fuerza funcional',
   'Especialista en progresiones de fuerza y técnica. Diseña bloques que respetan el ciclo y la biomecánica femenina.'),
  ('Camila Rueda', 'Movilidad y core',
   'Fisioterapeuta y coach. Trabaja rangos articulares, respiración y control profundo del centro.'),
  ('Daniela Sáenz', 'HIIT y acondicionamiento',
   'Sesiones de alta intensidad medidas al detalle: potencia, ritmo y recuperación activa.')
) as nuevas (nombre, especialidad, bio)
where not exists (select 1 from public.coaches c where c.nombre = nuevas.nombre);
