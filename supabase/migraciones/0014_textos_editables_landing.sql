-- =============================================================================
-- Migración 0014 · textos editables de la landing (estudio y método)
-- -----------------------------------------------------------------------------
-- Necesaria solo si ya ejecutaste schema.sql antes de esta fecha. En una
-- instalación nueva, schema.sql ya incluye estos cambios y no hace falta
-- correr este archivo.
--
-- Antes el párrafo de "El estudio" y el de "Cuatro pilares en cada sesión"
-- estaban fijos en el código. Ahora se editan desde
-- /admin/configuracion → Estudio, igual que el resto de los datos del
-- estudio. Los valores por defecto son el texto que ya se mostraba, para
-- que no cambie nada visualmente hasta que alguien lo edite.
-- =============================================================================

alter table public.configuracion_estudio
  add column if not exists sobre_estudio text not null default '',
  add column if not exists sobre_metodo text not null default '';

update public.configuracion_estudio
set
  sobre_estudio = 'Un espacio pensado al detalle: iluminación cálida, equipamiento premium y aforo limitado. Todo diseñado para que la sesión sea tuya.',
  sobre_metodo = 'No hay dos semanas iguales, pero sí una estructura: fuerza, movilidad, intensidad y acompañamiento. Todo medido, todo con propósito.'
where id = 1 and sobre_estudio = '' and sobre_metodo = '';
