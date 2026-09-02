# Manual de UNIUM Wellness Training

Manual de referencia de todo el proyecto: qué hace la aplicación, cómo está construida, qué
infraestructura externa se usa y cómo se conecta todo. Pensado para volver a este documento
cuando pase el tiempo y haga falta recordar "¿dónde estaba configurado esto?".

> Última actualización: 2 de septiembre de 2026.

---

## 1. Qué es y qué no es

UNIUM es la plataforma web de un estudio boutique de entrenamiento funcional enfocado en
mujeres. Su único propósito es la **gestión de horarios y reservas de clases**: calendario,
cupos, lista de espera, asistencia, promociones y notificaciones.

**No gestiona pagos, suscripciones ni créditos.** Fue una decisión explícita: el estudio cobra
por fuera de la app (efectivo, transferencia, etc.), así que no hay integración con ninguna
pasarela de pago ni manejo de tarjetas.

## 2. Roles

| Rol | Qué puede hacer |
| --- | --- |
| **Alumna** | Ver el calendario, agendar/cancelar sus propias clases, anotarse a lista de espera, ver su perfil e historial, ver promociones, activar notificaciones push en su celular. |
| **Admin (staff)** | Todo lo de alumna, más: crear/editar/eliminar clases, gestionar coaches, ver el directorio de alumnas, controlar asistencia, quitarle la reserva a cualquier alumna, gestionar promociones, configurar horario y datos del estudio, activar notificaciones push propias. |

Las cuentas de demostración (mientras no haya base de datos conectada, ver sección 4):

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Alumna | `mariana@unium.fit` | `unium123` |
| Admin | `admin@unium.fit` | `unium123` |

---

## 3. Stack técnico

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 3** — diseño "Black & Gold" (fondo oscuro `#121414`, dorado `#d4af37`), estilo
  *glassmorphism*
- **Lucide React** para iconos (los nombres en el código siguen la nomenclatura de Material
  Symbols, ver `components/Icono.tsx`)
- **Supabase** — Postgres + autenticación (opcional, ver sección 4)
- **web-push** (librería npm) — envío de notificaciones push desde el servidor

## 4. El truco central: modo local vs. modo remoto

Toda la app funciona en dos modos posibles, decididos por una sola función:
`hayBaseDeDatos()` en `lib/supabase/cliente.ts`, que revisa si existen las variables de entorno
`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

- **Sin esas variables** → **modo local**: todo el estado (usuarios, clases, reservas, etc.) vive
  en un `StoreProvider` de React y se guarda en `localStorage` del navegador bajo la clave
  `unium.state.v2`, con datos de ejemplo. Cada navegador tiene sus propios datos. Sirve para
  probar la app, no para operar el estudio de verdad.
- **Con esas variables** → **modo remoto**: todo pasa por Supabase (base de datos real,
  compartida entre todos los dispositivos).

Este interruptor está metido en **un solo archivo central**, `lib/store.tsx` (el "cerebro" de
toda la app): cada acción (reservar, cancelar, crear clase, etc.) revisa `if (remoto)` y decide
si habla con Supabase (`lib/datos/*.ts`) o con el estado local. El resto de la aplicación
(páginas y componentes) nunca sabe en qué modo está — solo llama a funciones como `reservar()`
o `cancelar()` a través de `useStore()`.

**En producción (uniumstudio.com) siempre está en modo remoto**, porque esas variables sí están
configuradas en Vercel.

---

## 5. Mapa de rutas

### Público / autenticación
| Ruta | Qué es |
| --- | --- |
| `/` | Landing: propuesta de valor, método, horario, coaches, ubicación. |
| `/login` | Inicio de sesión. |
| `/register` | Registro de alumna nueva. |
| `/recuperar` | Pedir link de recuperación de contraseña. |
| `/restablecer` | Poner contraseña nueva (llega desde el link del correo). |

### Portal de alumnas (`/alumnas/*`)
| Ruta | Qué es |
| --- | --- |
| `/alumnas` | Calendario semanal, agendar/cancelar clases. |
| `/alumnas/clase/[id]?fecha=YYYY-MM-DD` | Detalle de una clase concreta. |
| `/alumnas/perfil` | Datos personales, próximas clases, historial, interruptor de notificaciones. |
| `/alumnas/novedades` | Promociones y avisos vigentes. |

### Portal de administración (`/admin/*`)
| Ruta | Qué es |
| --- | --- |
| `/admin` | Calendario semanal: crear, editar y eliminar clases. |
| `/admin/configuracion` | Horario operativo, datos del estudio, "el método", cifras del hero, notificaciones del staff. |
| `/admin/alumnas` | Directorio de alumnas (CRM básico). |
| `/admin/asistencia` | Control de asistencia por sesión: marcar presentes, quitar reservas, gestionar lista de espera. |
| `/admin/promociones` | Crear y programar promociones/avisos. |
| `/admin/coaches` | Alta, edición y baja de coaches. |
| `/admin/cancelaciones` | Historial de reservas canceladas (quién, cuándo, quién la canceló). |

---

## 6. Modelo de datos (Supabase / Postgres)

Todas las tablas viven en el esquema `public` y tienen seguridad por filas (RLS) activada — cada
política decide qué puede leer/escribir una alumna vs. el staff. Definidas en
`supabase/schema.sql`.

| Tabla | Para qué |
| --- | --- |
| `perfiles` | Datos de cada cuenta (nombre, teléfono, correo, rol, activa). Se referencia a `auth.users` de Supabase. |
| `configuracion_dias` | Horario operativo del estudio por día de la semana. |
| `configuracion_estudio` | Datos generales del estudio (fila única). |
| `pilares` | Los "cuatro pilares del método" de la landing. |
| `metricas` | Cifras destacadas del hero de la landing. |
| `coaches` | Coaches del estudio. |
| `clases` | Clases del calendario (semanales o puntuales). |
| `reservas` | Una alumna en una clase en una fecha. Incluye `recordatorio_enviado` para el push de recordatorio. |
| `push_subscripciones` | Suscripciones a notificaciones push, una fila por dispositivo/navegador. |
| `lista_espera` | Alumnas esperando cupo en una clase llena. |
| `cancelaciones` | Historial de reservas canceladas (lo llena un trigger automáticamente). |
| `promociones` | Promociones/avisos. |
| `promociones_leidas` | Qué promoción ya vio cada alumna (para el contador de novedades). |

### Reglas de negocio que viven en la base de datos (no solo en la interfaz)

Estas validaciones están en *triggers* de Postgres, así que aplican aunque alguien intente
saltarse la interfaz:

- **No se puede reservar un cupo que ya no existe** (`validar_reserva`): valida cupo disponible
  y que el estudio abra ese día.
- **No se puede reservar una clase cuyo horario ya pasó** (`validar_reserva`, agregado en la
  migración 0011): compara fecha + hora contra el momento actual. El staff está exento (puede
  agendar manualmente si lo necesita).
- **No se puede cancelar una reserva si falta menos de una hora para la clase (o ya empezó)**
  (`validar_cancelacion`, migración 0010): igual, el staff está exento.
- **Toda cancelación queda registrada** (`registrar_cancelacion`): antes de borrar una reserva,
  guarda una copia en `cancelaciones` con quién era, qué clase, y quién la canceló.

---

## 7. Funcionalidades completas

### Reservas
- Calendario semanal con cupos en tiempo real.
- Reservar y cancelar clases (con confirmación antes de cancelar).
- No se puede reservar una clase cuyo horario ya pasó, ni cancelar si falta menos de una hora.
- Lista de espera automática cuando una clase está llena; el staff pasa manualmente a alguien de
  la lista a un cupo real cuando se libera uno.

### Asistencia
- El staff selecciona una sesión y marca presente/ausente a cada alumna en tiempo real.
- Puede quitarle la reserva a cualquier alumna desde ahí (con confirmación), sin la restricción
  de la hora que sí aplica a las alumnas.

### Clases y coaches
- Crear, editar y eliminar clases desde el calendario de admin (semanales o puntuales).
- CRUD de coaches, con especialidad y biografía.

### Promociones y avisos
- El staff crea promociones con título, descripción, distintivo (`2X1`, `-30%`...) y ventana de
  fechas.
- Tres interruptores: **Activa** (publicada), **En la landing** (aparece en la home pública),
  **Notificar** (manda push a todas las alumnas suscritas y aparece en "Novedades").

### Directorio de alumnas
- Listado con búsqueda, estado activo/inactivo, última asistencia.
- Activar/desactivar una cuenta.

### Notificaciones push (Web Push)
Ver detalle completo en la sección 8.

---

## 8. Sistema de notificaciones push

Usa el estándar **Web Push** del navegador (no es una app nativa, no usa Firebase): cualquier
alumna o admin puede activar notificaciones desde un interruptor en su perfil (alumnas) o en
Configuración → Notificaciones (admin), y recibe avisos en su celular/computador aunque tenga el
navegador cerrado, siempre que haya dado permiso.

### Piezas técnicas
- `public/sw.js` — el *service worker*: código que corre en segundo plano en el navegador y
  muestra la notificación cuando llega.
- Un par de llaves **VAPID** (identifican al servidor ante los navegadores): la pública vive en
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (Vercel), la privada en `VAPID_PRIVATE_KEY` (Vercel, nunca en
  el código). **No se deben regenerar** — invalidaría todas las suscripciones existentes.
- `lib/push.ts` — funciones del navegador para activar/desactivar y pedir el envío.
- `lib/servidor/push.ts` — el que realmente manda las notificaciones (usa `web-push` +
  `VAPID_PRIVATE_KEY`). Solo se importa desde rutas de servidor.
- `app/api/push/*` — rutas que reciben la suscripción, la borran, o piden un envío.

### Los cinco disparadores (con estilo/vibración propios por tipo)
| Evento | Quién lo recibe | Ruta que lo dispara |
| --- | --- | --- |
| Recordatorio: "tu clase empieza pronto" (1h antes) | La alumna con la reserva | Cron externo → `app/api/cron/recordatorios` |
| "¡Tienes cupo!" (se le pasó de la lista de espera) | La alumna beneficiada | `lib/store.tsx` → `registrarDesdeEspera` |
| Promoción/aviso nuevo | Todas las alumnas suscritas | `lib/store.tsx` → `crearPromocion` (si "Notificar" está activo) |
| "Nueva reserva" | El staff | `lib/store.tsx` → `reservar` (cuando una alumna agenda) |
| "Reserva cancelada" | El staff | `lib/store.tsx` → `cancelar` (solo si cancela la alumna, no si lo quita el propio staff) |

El recordatorio es el único que depende de un **cron job externo** (ver sección 9.4), porque
Vercel (plan gratuito) no permite tareas programadas más frecuentes que una vez al día.

---

## 9. Infraestructura y servicios externos

Resumen de "qué vive dónde". Ninguna de estas cuentas está en el código — son configuraciones
externas que hay que recordar.

### 9.1 GitHub
- Repositorio: `albertodelatorre133-maker/UNIUM`.
- Rama de trabajo/producción: `claude/unium-class-management-platform-pzp7jc`.
- Cada cambio de código se sube (`git push`) a esta rama, y Vercel lo despliega automáticamente.

### 9.2 Vercel (hosting)
- Aloja la aplicación Next.js y la despliega automáticamente en cada push a la rama de arriba.
- **Dominio**: `uniumstudio.com` (y `www.uniumstudio.com`, que es el destino real —
  `uniumstudio.com` sin `www` redirige ahí con un 308). El dominio original de Vercel
  (`unium.vercel.app`) se mantiene activo en paralelo, funciona igual.
- **Variables de entorno** (Project Settings → Environment Variables):

| Variable | Para qué |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase. Actica el modo remoto. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave pública de Supabase (segura de exponer al navegador). |
| `SUPABASE_SECRET_KEY` | Llave `service_role` de Supabase — acceso total, **solo se usa en rutas de servidor** (`app/api/**`), nunca llega al navegador. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Llave pública VAPID para suscribirse a notificaciones push. |
| `VAPID_PRIVATE_KEY` | Llave privada VAPID para firmar los envíos. Nunca se expone. |
| `VAPID_SUBJECT` | Contacto asociado a las llaves VAPID (`mailto:...`). |
| `CRON_SECRET` | Token que debe mandar el cron externo para poder llamar `/api/cron/recordatorios`. |

  Importante: las que empiezan con `NEXT_PUBLIC_` quedan "horneadas" en el código del navegador
  en el momento del *build* — si se cambia el valor en Vercel hay que volver a desplegar para
  que tenga efecto, no basta con guardarlo.

- No hay Cron Jobs nativos de Vercel configurados (el plan gratuito solo permite una vez al día,
  insuficiente para recordatorios cada 10 minutos) — se usa un servicio externo, ver 9.4.

### 9.3 Supabase (base de datos + autenticación)
- Proyecto Postgres administrado, con autenticación de correo/contraseña integrada.
- **Authentication → URL Configuration**:
  - Site URL: `https://www.uniumstudio.com`
  - Redirect URLs permitidas: `https://www.uniumstudio.com/**`, `https://uniumstudio.com/**`,
    `https://unium.vercel.app/**` — necesarias para que el link de "olvidé mi contraseña"
    funcione.
- **SQL Editor**: ahí se corrieron `schema.sql` (una vez, al crear el proyecto) y cada migración
  nueva de `supabase/migraciones/` a medida que se agregaban funciones (ver sección 10).
- Seguridad por filas (RLS) activada en todas las tablas: una alumna solo ve/edita lo suyo, el
  staff ve y gestiona todo (función `es_admin()` usada en casi todas las políticas).

### 9.4 Cloudflare (dominio)
- `uniumstudio.com` se compró/registra a través de **Cloudflare Registrar**.
- DNS del dominio configurado en Cloudflare → DNS → Records, con dos registros **CNAME**
  apuntando a Vercel:
  - `@` (raíz) → `ce6dddef1d5b6416.vercel-dns-017.com`
  - `www` → `ce6dddef1d5b6416.vercel-dns-017.com`
  - Ambos en modo **"DNS only"** (nube gris, no proxied) — importante dejarlos así, si se activa
    el proxy naranja de Cloudflare puede interferir con el certificado SSL de Vercel y con
    peticiones automatizadas como el cron job.

### 9.5 cron-job.org (recordatorios automáticos)
- Servicio gratuito externo que llama a la API cada 10 minutos, porque Vercel no lo permite
  gratis con esa frecuencia.
- Job llamado **"Recordatorios Unium"**:
  - URL: `https://www.uniumstudio.com/api/cron/recordatorios` (con `www`; sin `www` da error
    308 porque redirige y cron-job.org no sigue el redirect).
  - Método: `GET`.
  - Frecuencia: cada 10 minutos.
  - Header personalizado (pestaña "Avanzado" → "Encabezados"): `Authorization: Bearer
    <CRON_SECRET>` — debe coincidir exactamente con la variable `CRON_SECRET` configurada en
    Vercel.
- Se puede revisar el historial de ejecuciones ahí mismo (columna "Últimos eventos") para
  confirmar que sigue respondiendo `200 OK`.

---

## 10. Migraciones de base de datos

`supabase/schema.sql` es el estado completo y actual — sirve para crear el proyecto desde cero.
Como el proyecto ya existe y tiene datos reales, cada cambio posterior al esquema se guarda
además como un archivo numerado en `supabase/migraciones/`, para correrlo una sola vez en el
SQL Editor de Supabase sobre la base ya existente:

| Migración | Qué agrega |
| --- | --- |
| 0001 | Correo en `perfiles`. |
| 0002 | Permite crear el primer admin manualmente. |
| 0003 | Tabla de coaches. |
| 0004 | Relaciona clases con coach. |
| 0005 | Datos del estudio y "los pilares" del método. |
| 0006 | Tabla de cifras del hero. |
| 0007 | Registro automático de cancelaciones. |
| 0008 | Lista de espera. |
| 0009 | Notificaciones push (suscripciones, recordatorio automático). |
| 0010 | No cancelar con menos de una hora de anticipación. |
| 0011 | No reservar clases con horario ya pasado. |

Si alguna vez se recrea el proyecto de Supabase desde cero, con correr `schema.sql` una sola vez
ya queda todo — las migraciones numeradas son solo para ponerse al día un proyecto que ya
existía antes de cada cambio.

---

## 11. Seguridad — cosas que nunca deben pasar

- `SUPABASE_SECRET_KEY` y `VAPID_PRIVATE_KEY` **nunca** se ponen en `.env.example` con un valor
  real, ni se importan desde un archivo `"use client"` — solo desde rutas de servidor
  (`app/api/**`).
- Las llaves VAPID no se regeneran una vez en uso: invalidaría todas las suscripciones push
  existentes, obligando a todo el mundo a reactivarlas.
- Los mensajes de las notificaciones push que involucran a otra persona (nueva reserva, nueva
  cancelación) se arman **en el servidor** a partir de datos de la base, nunca confiando en
  texto mandado por quien hace la llamada — para que una alumna no pueda inyectar un mensaje
  falso a los admins.

## 12. Puesta en marcha local (para desarrollo)

```bash
npm install
npm run dev     # http://localhost:3000, modo local (sin Supabase) si no hay .env.local
npm run build   # build de producción
npm start
```

Sin un archivo `.env.local` con las variables de Supabase, todo funciona en modo local con datos
de ejemplo — es la forma normal de probar cambios antes de subirlos.

## 13. Dónde está cada cosa en el código (mapa rápido)

```
app/
  page.tsx                       landing pública
  login/ · register/             autenticación
  recuperar/ · restablecer/      recuperación de contraseña
  alumnas/                       portal de alumnas
  admin/                         portal de administración
  api/push/                      suscribir, desuscribir, notificar, nueva-reserva, nueva-cancelacion
  api/cron/recordatorios         lo llama el cron externo cada 10 min

components/
  ConfirmDialog.tsx              diálogo de confirmación reutilizable (cancelar reserva, etc.)
  NotificacionesPush.tsx         interruptor de notificaciones (alumnas y admin)
  CalendarioSemanal.tsx          calendario compartido por ambos portales

lib/
  store.tsx                      el "cerebro": todas las acciones, modo local/remoto
  date.ts                        utilidades de fecha/hora (incluye reglas de "ya pasó" / "puede cancelarse")
  push.ts                        notificaciones push del lado del navegador
  servidor/push.ts               notificaciones push del lado del servidor (privado)
  supabase/                      clientes (navegador, servidor, admin) y tipos de la base
  datos/                         una consulta por área (reservas, clases, promociones...)

supabase/
  schema.sql                     esquema completo, para un proyecto nuevo
  migraciones/                   cambios incrementales, para un proyecto ya existente
  semilla.sql                    horario y clases iniciales de ejemplo

public/
  sw.js                          service worker de notificaciones push
```
