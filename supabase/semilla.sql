-- =============================================================================
-- UNIUM · datos iniciales
-- -----------------------------------------------------------------------------
-- Ejecuta este archivo después de schema.sql. Es idempotente: puedes volver a
-- lanzarlo sin duplicar nada.
-- =============================================================================

-- Horario operativo (0 = Lunes ... 6 = Domingo)
insert into public.configuracion_dias (day, activo, apertura, cierre) values
  (0, true,  '05:30', '20:00'),
  (1, true,  '05:30', '20:00'),
  (2, true,  '05:30', '20:00'),
  (3, true,  '05:30', '20:00'),
  (4, true,  '06:00', '18:00'),
  (5, true,  '07:00', '12:00'),
  (6, false, '08:00', '11:00')
on conflict (day) do nothing;

-- Datos generales del estudio (fila única).
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

-- Los cuatro pilares del método
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

-- Coaches
insert into public.coaches (nombre, especialidad, bio)
select * from (values
  ('Cecilia De La Torre', 'Entrenamiento funcional integral',
   'Fundadora y entrenadora principal de UNIUM. Diseña y guía cada sesión del estudio.')
) as nuevas (nombre, especialidad, bio)
where not exists (select 1 from public.coaches c where c.nombre = nuevas.nombre);

-- Clases semanales. coach_id se resuelve por nombre contra la coach recién
-- creada arriba (no hay UUIDs fijos que insertar a mano).
insert into public.clases (titulo, descripcion, day, hora, duracion, coach_id, cupo, semanal)
select nuevas.titulo, nuevas.descripcion, nuevas.day, nuevas.hora, nuevas.duracion,
       (select id from public.coaches where nombre = nuevas.coach), nuevas.cupo, nuevas.semanal
from (values
  ('Fuerza Total',      'Bloque de fuerza con barra y mancuernas. Patrones de empuje, tracción y bisagra de cadera con progresión semanal.', 0, '06:00'::time, 60, 'Cecilia De La Torre', 12, true),
  ('Core & Movilidad',  'Trabajo de control profundo, respiración y rangos articulares. Ideal como sesión de recuperación activa.',            0, '18:30'::time, 50, 'Cecilia De La Torre',  10, true),
  ('HIIT Premium',      'Intervalos de alta intensidad con control de ritmo cardiaco. Potencia, resistencia y recuperación medida.',          1, '07:00'::time, 45, 'Cecilia De La Torre', 14, true),
  ('Fuerza Total',      'Bloque de fuerza con barra y mancuernas. Patrones de empuje, tracción y bisagra de cadera con progresión semanal.', 1, '19:00'::time, 60, 'Cecilia De La Torre', 12, true),
  ('Glúteo & Pierna',   'Sesión enfocada en cadena posterior: sentadilla, peso muerto, hip thrust y accesorios de estabilidad.',             2, '06:00'::time, 60, 'Cecilia De La Torre', 12, true),
  ('Core & Movilidad',  'Trabajo de control profundo, respiración y rangos articulares. Ideal como sesión de recuperación activa.',           2, '18:00'::time, 50, 'Cecilia De La Torre',  10, true),
  ('HIIT Premium',      'Intervalos de alta intensidad con control de ritmo cardiaco. Potencia, resistencia y recuperación medida.',          3, '07:00'::time, 45, 'Cecilia De La Torre', 14, true),
  ('Fuerza Total',      'Bloque de fuerza con barra y mancuernas. Patrones de empuje, tracción y bisagra de cadera con progresión semanal.', 3, '19:00'::time, 60, 'Cecilia De La Torre', 12, true),
  ('Full Body Express', 'Circuito completo de 45 minutos para cerrar la semana. Intensidad moderada y mucho trabajo de patrón global.',       4, '06:30'::time, 45, 'Cecilia De La Torre', 14, true),
  ('Sábado Comunidad',  'Entrenamiento en parejas y equipos. La sesión más social de la semana, abierta a invitadas.',                        5, '09:00'::time, 60, 'Cecilia De La Torre',  16, true)
) as nuevas (titulo, descripcion, day, hora, duracion, coach, cupo, semanal)
where not exists (
  select 1 from public.clases c
  where c.titulo = nuevas.titulo and c.day = nuevas.day and c.hora = nuevas.hora
);

-- Promociones de ejemplo
insert into public.promociones (titulo, descripcion, etiqueta, desde, hasta, activa, en_inicio, notificar)
select * from (values
  ('Trae a una amiga',
   'Durante este mes puedes invitar a una amiga a cualquier clase de la semana sin costo. Solo reserva tu cupo y avísanos en recepción.',
   '2X1', current_date - 3, current_date + 25, true, true, true),
  ('Semana de movilidad',
   'Sumamos una sesión extra de Core & Movilidad los miércoles a las 07:00. Cupos limitados a 10 alumnas.',
   'NUEVA CLASE', current_date - 1, current_date + 12, true, true, true),
  ('Madrugadoras',
   'Las clases de 05:30 y 06:00 tienen prioridad de reserva para quienes asistan tres veces por semana.',
   'BENEFICIO', current_date - 10, current_date + 40, true, false, false)
) as nuevas (titulo, descripcion, etiqueta, desde, hasta, activa, en_inicio, notificar)
where not exists (select 1 from public.promociones p where p.titulo = nuevas.titulo);

-- -----------------------------------------------------------------------------
-- Convertir una cuenta en staff
-- -----------------------------------------------------------------------------
-- Regístrate primero desde la aplicación con el correo del estudio y después
-- ejecuta esta línea cambiando el correo:
--
--   update public.perfiles set rol = 'admin'
--   where id = (select id from auth.users where email = 'hola@unium.fit');
