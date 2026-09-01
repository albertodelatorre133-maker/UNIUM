# Migración del almacén local a la base de datos

Hoy todo el estado vive en `lib/store.tsx`, dentro de un contexto de React que
se persiste en `localStorage`. Las pantallas nunca hablan con el almacén
directamente: piden funciones al contexto. Eso es lo que hace posible el cambio
sin tocar la interfaz.

Este documento es el mapa de esa sustitución. **Todavía no está aplicada**: el
paso siguiente es cambiar el cuerpo de cada función del contexto por la consulta
correspondiente, ya escrita en `lib/datos/`.

## Estado de la preparación

| Pieza | Dónde | Estado |
| --- | --- | --- |
| Esquema, índices, disparadores y políticas | `supabase/schema.sql` | Listo |
| Datos iniciales | `supabase/semilla.sql` | Listo |
| Clientes de Supabase | `lib/supabase/` | Listo |
| Consultas de cada área | `lib/datos/` | Listo |
| Refresco de sesión | `middleware.ts` | Listo |
| Sustitución dentro del contexto | `lib/store.tsx` | Pendiente |
| Guardas de ruta con sesión real | `components/Guard.tsx` | Pendiente |

## Correspondencia función por función

### Sesión y cuentas

| Contexto actual | Sustituir por |
| --- | --- |
| `login(email, password)` | `entrar()` de `lib/datos/auth.ts` |
| `registrar(datos)` | `registrar()` de `lib/datos/auth.ts` |
| `salir()` | `salir()` de `lib/datos/auth.ts` |
| `usuario` | `perfilActual()`, más `onAuthStateChange` para reaccionar al cierre de sesión |

### Calendario

| Contexto actual | Sustituir por |
| --- | --- |
| `state.config` | `leerConfiguracion()` |
| `guardarConfig(config)` | `guardarConfiguracion(config)` |
| `state.classes` | `listarClases()` |
| `crearClase(clase)` | `crearClase(clase)` |
| `eliminarClase(id)` | `eliminarClase(id)` |
| `sesionesDeLaSemana(offset)` | `listarClases()` + `ocupacionDeSemana(desde, hasta)` + `misReservas(desde, hasta)` |

`sesionesDeLaSemana` es la función que más cambia: hoy calcula la ocupación
recorriendo las reservas en memoria. Con base de datos son tres consultas que se
combinan igual que ahora, pero el conteo lo hace Postgres.

### Reservas y asistencia

| Contexto actual | Sustituir por |
| --- | --- |
| `reservar(classId, fecha)` | `reservar(claseId, fecha)` |
| `cancelar(bookingId)` | `cancelar(reservaId)` |
| `reservasDeUsuario(userId)` | `historialDeUsuario(usuarioId)` |
| `reservasDeSesion(classId, fecha)` | `reservasDeSesion(claseId, fecha)` |
| `marcarAsistencia(id, valor)` | `marcarAsistencia(reservaId, asistio)` |
| `ultimaAsistencia(userId)` | Ya viene resuelto en `listarAlumnas()` |

La comprobación de cupo desaparece del cliente: la hace un disparador y llega
como error, que `mensajeDeError()` traduce al mensaje que ya se muestra hoy.

### Directorio y promociones

| Contexto actual | Sustituir por |
| --- | --- |
| `alumnas` | `listarAlumnas()` |
| `cambiarEstadoAlumna(id)` | `cambiarEstadoAlumna(id, activa)` |
| `state.promociones` | `listarPromociones()` |
| `promocionesDeInicio()` | `promocionesDeInicio()` |
| `crearPromocion` / `actualizarPromocion` / `eliminarPromocion` | Las de `lib/datos/promociones.ts` |
| `notificaciones()` y `sinLeer` | `promocionesLeidas(usuarioId)` cruzado con `listarPromociones()` |
| `marcarPromocionesLeidas()` | `marcarLeidas(usuarioId, ids)` |

## Lo que hay que resolver al aplicarlo

**Todo pasa a ser asíncrono.** Hoy las funciones del contexto devuelven el
resultado en el acto. Con base de datos devuelven promesas, así que las
pantallas necesitan estados de carga y de error. Conviene hacerlo área por área
—primero el calendario, luego reservas, después promociones— y no todo de una
vez.

**Actualización optimista.** Reservar y cancelar deben seguir sintiéndose
instantáneos: pinta el cambio primero y revierte si el servidor lo rechaza. Es
lo que hace que la aplicación no se sienta más lenta que ahora.

**Las guardas de ruta.** `components/Guard.tsx` decide hoy con el usuario del
almacén local. Debe pasar a la sesión de Supabase, y conviene reforzarla en el
servidor: aunque las políticas ya impiden leer datos ajenos, el panel no debería
ni pintarse para quien no es staff.

**La landing.** `PromocionesInicio` es un componente de cliente. Con base de
datos gana bastante si pasa a componente de servidor: las promociones se
consultan al renderizar y llegan ya dentro del HTML, sin parpadeo.

**Los datos de ejemplo.** `lib/seed.ts` deja de sembrar el estado, pero se
queda: de ahí salen las coaches, los datos del estudio y las rutas de las fotos,
que no viven en la base de datos.
