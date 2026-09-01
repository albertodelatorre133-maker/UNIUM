-- =============================================================================
-- UNIUM · esquema de base de datos
-- -----------------------------------------------------------------------------
-- Ejecuta este archivo entero en el editor SQL de Supabase.
-- Convención de días: 0 = Lunes ... 6 = Domingo (la misma que usa la aplicación).
-- =============================================================================

-- ----------------------------------------------------------------- tipos ----
do $$
begin
  if not exists (select 1 from pg_type where typname = 'rol_usuario') then
    create type public.rol_usuario as enum ('alumna', 'admin');
  end if;
end
$$;

-- ---------------------------------------------------------------- tablas ----

-- Datos de perfil de cada cuenta. La autenticación vive en auth.users; aquí
-- solo guardamos lo que el estudio necesita ver y gestionar.
create table if not exists public.perfiles (
  id         uuid primary key references auth.users on delete cascade,
  nombre     text not null,
  telefono   text not null default '',
  -- Duplicado de auth.users.email: el cliente no puede leer esa tabla para
  -- cuentas ajenas, y el directorio de alumnas necesita mostrar el correo.
  email      text not null default '',
  rol        public.rol_usuario not null default 'alumna',
  activa     boolean not null default true,
  creada_en  timestamptz not null default now()
);

-- Horario operativo del estudio: qué días abre y entre qué horas.
create table if not exists public.configuracion_dias (
  day       smallint primary key check (day between 0 and 6),
  activo    boolean not null default true,
  apertura  time not null default '06:00',
  cierre    time not null default '21:00',
  constraint rango_horario_valido check (apertura < cierre)
);

-- Coaches del estudio. clases.coach_id referencia esta tabla, así que
-- renombrar una coach aquí se refleja de inmediato en sus clases.
create table if not exists public.coaches (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  especialidad  text not null default '',
  bio           text not null default '',
  activa        boolean not null default true,
  creada_en     timestamptz not null default now()
);

-- Clases del calendario. Las semanales se repiten cada semana en su día;
-- las puntuales llevan una fecha concreta.
create table if not exists public.clases (
  id           uuid primary key default gen_random_uuid(),
  titulo       text not null,
  descripcion  text not null default '',
  day          smallint not null check (day between 0 and 6),
  hora         time not null,
  duracion     smallint not null default 60 check (duracion between 15 and 240),
  coach_id     uuid not null references public.coaches(id),
  cupo         smallint not null default 12 check (cupo between 1 and 60),
  semanal      boolean not null default true,
  fecha        date,
  creada_en    timestamptz not null default now(),
  constraint fecha_coherente check (
    (semanal and fecha is null) or (not semanal and fecha is not null)
  )
);

-- Una reserva es una alumna en una clase en una fecha concreta.
create table if not exists public.reservas (
  id          uuid primary key default gen_random_uuid(),
  clase_id    uuid not null references public.clases on delete cascade,
  usuario_id  uuid not null references public.perfiles on delete cascade,
  fecha       date not null,
  asistio     boolean not null default false,
  creada_en   timestamptz not null default now(),
  unique (clase_id, usuario_id, fecha)
);

create table if not exists public.promociones (
  id           uuid primary key default gen_random_uuid(),
  titulo       text not null,
  descripcion  text not null default '',
  etiqueta     text not null default 'PROMO',
  desde        date not null default current_date,
  hasta        date not null,
  activa       boolean not null default true,
  en_inicio    boolean not null default true,
  notificar    boolean not null default true,
  creada_en    timestamptz not null default now(),
  constraint vigencia_valida check (hasta >= desde)
);

-- Qué promociones ha visto ya cada alumna, para el contador de novedades.
create table if not exists public.promociones_leidas (
  usuario_id    uuid references public.perfiles on delete cascade,
  promocion_id  uuid references public.promociones on delete cascade,
  leida_en      timestamptz not null default now(),
  primary key (usuario_id, promocion_id)
);

-- --------------------------------------------------------------- índices ----
create index if not exists coaches_activa_idx       on public.coaches (activa);
create index if not exists clases_coach_idx         on public.clases (coach_id);
create index if not exists clases_dia_hora_idx      on public.clases (day, hora);
create index if not exists reservas_fecha_idx       on public.reservas (fecha);
create index if not exists reservas_clase_fecha_idx on public.reservas (clase_id, fecha);
create index if not exists reservas_usuario_idx     on public.reservas (usuario_id, fecha desc);
create index if not exists promociones_vigencia_idx on public.promociones (activa, desde, hasta);

-- -------------------------------------------------------------- funciones ---

-- Se consulta en casi todas las políticas. Va en SECURITY DEFINER para poder
-- leer public.perfiles sin que la propia política de perfiles se llame a sí
-- misma en bucle.
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol = 'admin'
  );
$$;

-- Al registrarse una cuenta se crea su perfil con los datos del formulario.
create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, telefono, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nombre', ''), split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'telefono', ''),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- Nadie se asciende a sí mismo a staff ni se reactiva por su cuenta.
create or replace function public.proteger_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() solo existe cuando la petición llega con una sesión de
  -- Supabase Auth (la aplicación, autenticada). El SQL Editor, las
  -- migraciones y cualquier acceso directo a la base no llevan esa sesión,
  -- así que auth.uid() da null ahí: es el camino para nombrar al primer
  -- staff, y quien tiene acceso directo a la base ya podía saltarse esta
  -- regla de todos modos (podría borrar el disparador). Esto no debilita la
  -- protección real, que es impedir que una alumna se ascienda a sí misma
  -- desde la aplicación.
  if auth.uid() is null then
    return new;
  end if;

  if not public.es_admin()
     and (new.rol is distinct from old.rol or new.activa is distinct from old.activa) then
    raise exception 'Solo el staff puede cambiar el rol o el estado de una alumna';
  end if;
  return new;
end;
$$;

drop trigger if exists perfiles_proteger on public.perfiles;
create trigger perfiles_proteger
  before update on public.perfiles
  for each row execute function public.proteger_perfil();

-- El aforo se valida en la base de datos, no solo en la interfaz: bloquea la
-- fila de la clase para que dos reservas simultáneas no puedan pasarse del cupo.
create or replace function public.validar_reserva()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  limite    smallint;
  dia       smallint;
  ocupados  integer;
  abierto   boolean;
begin
  select cupo, c.day into limite, dia
  from public.clases c
  where c.id = new.clase_id
  for update;

  if limite is null then
    raise exception 'La clase no existe';
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

drop trigger if exists reservas_validar on public.reservas;
create trigger reservas_validar
  before insert on public.reservas
  for each row execute function public.validar_reserva();

-- Ocupación por clase y fecha. Las alumnas necesitan saber cuántos cupos
-- quedan sin poder ver quién reservó, así que se expone solo el agregado.
create or replace function public.ocupacion(desde date, hasta date)
returns table (clase_id uuid, fecha date, reservadas bigint)
language sql
stable
security definer
set search_path = public
as $$
  select r.clase_id, r.fecha, count(*)::bigint
  from public.reservas r
  where r.fecha between desde and hasta
  group by r.clase_id, r.fecha;
$$;

grant execute on function public.ocupacion(date, date) to anon, authenticated;

-- ------------------------------------------------- seguridad por filas -----
alter table public.perfiles            enable row level security;
alter table public.configuracion_dias  enable row level security;
alter table public.coaches             enable row level security;
alter table public.clases              enable row level security;
alter table public.reservas            enable row level security;
alter table public.promociones         enable row level security;
alter table public.promociones_leidas  enable row level security;

-- perfiles: cada quien ve el suyo; el staff los ve todos.
drop policy if exists perfiles_leer on public.perfiles;
create policy perfiles_leer on public.perfiles
  for select to authenticated
  using (id = auth.uid() or public.es_admin());

drop policy if exists perfiles_editar on public.perfiles;
create policy perfiles_editar on public.perfiles
  for update to authenticated
  using (id = auth.uid() or public.es_admin())
  with check (id = auth.uid() or public.es_admin());

-- configuración y clases: lectura pública (la landing muestra los horarios),
-- escritura solo del staff.
drop policy if exists configuracion_leer on public.configuracion_dias;
create policy configuracion_leer on public.configuracion_dias
  for select to anon, authenticated using (true);

drop policy if exists configuracion_escribir on public.configuracion_dias;
create policy configuracion_escribir on public.configuracion_dias
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- coaches: la landing solo ve a las activas; el staff las ve y gestiona todas.
drop policy if exists coaches_leer on public.coaches;
create policy coaches_leer on public.coaches
  for select to anon, authenticated
  using (activa or public.es_admin());

drop policy if exists coaches_escribir on public.coaches;
create policy coaches_escribir on public.coaches
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

drop policy if exists clases_leer on public.clases;
create policy clases_leer on public.clases
  for select to anon, authenticated using (true);

drop policy if exists clases_escribir on public.clases;
create policy clases_escribir on public.clases
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- reservas: la alumna gestiona las suyas; el staff, todas.
drop policy if exists reservas_leer on public.reservas;
create policy reservas_leer on public.reservas
  for select to authenticated
  using (usuario_id = auth.uid() or public.es_admin());

drop policy if exists reservas_crear on public.reservas;
create policy reservas_crear on public.reservas
  for insert to authenticated
  with check (
    public.es_admin()
    or (
      usuario_id = auth.uid()
      and exists (select 1 from public.perfiles p where p.id = auth.uid() and p.activa)
    )
  );

drop policy if exists reservas_borrar on public.reservas;
create policy reservas_borrar on public.reservas
  for delete to authenticated
  using (usuario_id = auth.uid() or public.es_admin());

-- Marcar asistencia es cosa del staff.
drop policy if exists reservas_editar on public.reservas;
create policy reservas_editar on public.reservas
  for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- promociones: fuera solo se ven las vigentes; el staff ve y edita todas.
drop policy if exists promociones_leer on public.promociones;
create policy promociones_leer on public.promociones
  for select to anon, authenticated
  using (public.es_admin() or (activa and current_date between desde and hasta));

drop policy if exists promociones_escribir on public.promociones;
create policy promociones_escribir on public.promociones
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

drop policy if exists promociones_leidas_propias on public.promociones_leidas;
create policy promociones_leidas_propias on public.promociones_leidas
  for all to authenticated
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
