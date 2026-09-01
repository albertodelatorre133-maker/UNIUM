# Conexión con la base de datos

`lib/store.tsx` habla con Supabase cuando existen `NEXT_PUBLIC_SUPABASE_URL` y
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, y con el almacén local cuando no existen. La
misma función decide en cada caso, así que ninguna pantalla necesita saber
contra qué está hablando el estado.

```ts
const remoto = hayBaseDeDatos();
```

## Cómo se carga el estado

Al montar, `cargarEstadoRemoto()` pide de una vez el horario, las clases, las
promociones, los perfiles, las reservas y las promociones ya leídas, y arma con
eso el mismo objeto `AppState` que antes vivía en `localStorage`. Las políticas
de seguridad por filas ya deciden qué llega en cada consulta:

- Sin sesión: horario, clases y promociones vigentes. Perfiles y reservas
  llegan vacíos.
- Con sesión de alumna: lo mismo, más su propio perfil y sus propias reservas.
- Con sesión de staff: todo.

Con eso, **las funciones puras que ya existían —`sesionesDeLaSemana`,
`sesion`, `reservasDeUsuario`, `reservasDeSesion`, `ultimaAsistencia`,
`notificaciones`, `promocionesVigentes`, `promocionesDeInicio`— no cambiaron ni
una línea**: siguen calculando sobre `state` en memoria, igual que en el modo
local. Es la simplificación que hizo posible conectar la base de datos sin
tocar casi ninguna pantalla.

Se vuelve a llamar a `cargarEstadoRemoto()`:

- Al montar la aplicación.
- Cuando `onAuthStateChange` reporta un inicio o cierre de sesión.
- Después de cada acción que escribe en la base (reservar, cancelar, crear una
  clase, guardar la configuración, publicar una promoción…).

Ese último punto es una decisión deliberada: en vez de parchear el estado en
memoria tras cada mutación (rápido de escribir, fácil de dejar un caso sin
cubrir), se vuelve a pedir todo. Para el volumen de datos de un estudio
boutique —decenas de alumnas, un puñado de clases por semana— el costo es
insignificante y la garantía de que la pantalla siempre refleja lo que hay en
la base vale más que ahorrarse una consulta. Si el estudio creciera mucho
(miles de reservas acumuladas), valdría la pena paginar o filtrar por rango de
fechas en vez de traer las tablas completas; hoy no hace falta.

## Qué cambió en cada función

Todas las acciones que escriben pasaron a devolver una promesa. Las que ya
devolvían un resultado (`login`, `registrar`, `reservar`) ahora hay que
esperarlas con `await` para leer `ok`/`error`; las demás (`cancelar`,
`crearClase`, `marcarAsistencia`…) siguen sin devolver nada útil y se pueden
llamar sin esperar donde no hace falta bloquear la interfaz por su resultado.

| Función | En modo local | En modo remoto |
| --- | --- | --- |
| `login` | Busca en `state.users` | `entrar()` + `perfilActual()` de `lib/datos/auth.ts` |
| `registrar` | Añade a `state.users` | `registrar()` de `lib/datos/auth.ts`; ver nota sobre confirmación por correo |
| `salir` | Limpia `sessionUserId` | `salir()` + recarga |
| `guardarConfig` | Reemplaza `state.config` | `guardarConfiguracion()` de `lib/datos/configuracion.ts` |
| `crearClase` / `eliminarClase` | Edita `state.classes` | `lib/datos/clases.ts` |
| `reservar` / `cancelar` | Valida cupo en memoria | `lib/datos/reservas.ts` — el cupo lo valida un disparador en Postgres |
| `marcarAsistencia` | Edita `state.bookings` | `lib/datos/reservas.ts` |
| `cambiarEstadoAlumna` | Invierte el estado en memoria | `lib/datos/alumnas.ts`, con el valor actual leído de `state.users` |
| `crearPromocion` / `actualizarPromocion` / `eliminarPromocion` | Edita `state.promociones` | `lib/datos/promociones.ts` |
| `marcarPromocionesLeidas` | Edita `state.leidas` | `lib/datos/promociones.ts`, solo para las que aún no estaban marcadas |

### El registro con confirmación por correo

Si el proyecto de Supabase tiene activada la confirmación por correo
(configuración por omisión), `registrar()` crea la cuenta pero no abre sesión
hasta que la alumna confirme. `registrar` distingue ese caso devolviendo
`sesionActiva: false`, y `app/register/page.tsx` muestra un aviso de "revisa tu
correo" en vez de llevarla directo al calendario. Con la confirmación
desactivada (ver `supabase/README.md`), el registro entra de inmediato, igual
que en el modo local.

### Lo único que toca la base de datos directamente desde `store.tsx`

Por simplicidad, la carga de perfiles, reservas y promociones leídas se hace
con `select("*")` directo desde `cargarEstadoRemoto()`, en vez de pasar por
funciones dedicadas en `lib/datos/`. Es intencional: como cada una de esas
tablas ya viene filtrada por las políticas de seguridad, un `select` simple es
exactamente lo que hace falta y no había necesidad de una capa intermedia.
`lib/datos/alumnas.ts` sí expone un `listarAlumnas()` con los contadores ya
calculados en SQL — no lo usa `store.tsx` porque `state.bookings` completo ya
permite calcular esos mismos contadores en el cliente (así lo hace
`app/admin/alumnas/page.tsx` desde el principio), pero queda disponible si más
adelante conviene mover ese cálculo al servidor.

## Lo que no necesitó ningún cambio

- **`components/Guard.tsx`** — decide con `hidratado` y `usuario`, y los dos
  se calculan igual sin importar de dónde vino el dato.
- **Casi todas las pantallas de solo lectura** — calendario de alumnas y de
  administración, perfil, asistencia, novedades, CRM: todas leen `state` o
  llaman a las funciones puras de arriba, ninguna sabe que el dato puede venir
  de Supabase.

## Verificado

- El modo local (sin variables de entorno) sigue funcionando exactamente
  igual: reservar, cancelar, crear una clase, guardar el horario, publicar una
  promoción — probado de punta a punta tras el cambio.
- Con las variables de entorno presentes pero sin poder llegar a Supabase
  (red bloqueada), la aplicación falla con gracia: la landing se sigue viendo,
  y las rutas privadas redirigen a `/login` en vez de quedarse colgadas o
  lanzar un error sin capturar.
- **Pendiente de tu parte**: probar el flujo completo contra el proyecto real
  (registrar una alumna, convertir una cuenta en staff, reservar, marcar
  asistencia) desde un entorno con salida a internet normal — este entorno de
  trabajo remoto tiene bloqueada la salida a `supabase.co`, así que esa prueba
  no se pudo hacer aquí.
