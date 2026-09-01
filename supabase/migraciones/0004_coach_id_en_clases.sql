-- =============================================================================
-- Migración 0004 · clases.coach_id en lugar de clases.coach (texto)
-- -----------------------------------------------------------------------------
-- Necesaria solo si ya ejecutaste schema.sql antes de esta fecha. En una
-- instalación nueva, schema.sql ya crea clases.coach_id y no hace falta correr
-- este archivo.
--
-- Hasta ahora clases.coach guardaba el nombre de la coach como texto libre, y
-- un disparador (propagar_nombre_coach) se encargaba de reescribirlo en todas
-- las clases cuando alguien renombraba a la coach desde el panel. Con una sola
-- coach y el nombre ya consistente, tiene más sentido una referencia real:
-- clases.coach_id -> coaches.id. Así el nombre siempre se lee actualizado por
-- el join (nada que propagar) y Postgres impide borrar una coach mientras
-- tenga clases asignadas.
-- =============================================================================

-- 1) Por si alguna clase quedó con un nombre de coach que ya no existe en
--    coaches (no debería pasar, pero la migración es defensiva).
insert into public.coaches (nombre)
select distinct c.coach
from public.clases c
where not exists (select 1 from public.coaches co where co.nombre = c.coach);

-- 2) Columna nueva, nullable mientras se rellena.
alter table public.clases add column if not exists coach_id uuid references public.coaches(id);

-- 3) Backfill: cada clase apunta a la coach de su mismo nombre.
update public.clases c
set coach_id = co.id
from public.coaches co
where co.nombre = c.coach and c.coach_id is null;

-- 4) Ya no puede haber nulos: exige la referencia de aquí en adelante.
alter table public.clases alter column coach_id set not null;

-- 5) Fuera la columna de texto libre.
alter table public.clases drop column coach;

create index if not exists clases_coach_idx on public.clases (coach_id);

-- 6) El disparador de propagación ya no tiene sentido: el nombre se lee
--    siempre actualizado a través del join con coaches.
drop trigger if exists coaches_propagar_nombre on public.coaches;
drop function if exists public.propagar_nombre_coach();
