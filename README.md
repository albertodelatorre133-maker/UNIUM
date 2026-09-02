# UNIUM · Wellness Training

> 📖 Para un recorrido completo del proyecto — funcionalidades, infraestructura (Vercel,
> Supabase, Cloudflare, cron-job.org), notificaciones push y migraciones de base de datos — ver
> [`docs/MANUAL.md`](docs/MANUAL.md).

Plataforma web para la gestión de un estudio de entrenamiento funcional enfocado en mujeres.
El sistema **no gestiona pagos, suscripciones ni créditos**: su único objetivo es la gestión
eficiente de **horarios y reservas de clases**.

> Unidos somos más fuertes.

## Filosofía de diseño

| Token | Valor |
| --- | --- |
| Fondo | `#121414` (`ink-800`) |
| Acento | `#d4af37` (`primary`) |
| Títulos | Archivo Narrow (`font-display`) |
| Cuerpo | Hanken Grotesk (`font-sans`) |
| Etiquetas / datos | JetBrains Mono (`font-mono`) |

Estética premium y oscura (Black & Gold), *glassmorphism* (paneles semitransparentes con
desenfoque), bordes finos, iconografía minimalista y separación total entre la vista
pública/alumnas y la de administración.

## Arquitectura de rutas

### 1. Flujo público y autenticación
| Ruta | Descripción |
| --- | --- |
| `/` | Landing page: propuesta de valor, método, horarios, coaches, ubicación y CTA *AGENDAR CLASE*. |
| `/login` | Inicio de sesión con correo y contraseña (incluye accesos de demostración). |
| `/register` | Registro con nombre completo, correo, teléfono y contraseña. |

### 2. Portal de alumnas (`/alumnas/*`) — navegación superior en escritorio, pestañas inferiores en móvil
| Ruta | Descripción |
| --- | --- |
| `/alumnas` | Calendario semanal tipo *bento grid*: cupos disponibles, horario, coach y reserva en un clic. |
| `/alumnas/clase/[id]?fecha=YYYY-MM-DD` | Detalle de la clase: descripción, coach, cupos y mapa del estudio. |
| `/alumnas/perfil` | Datos personales, próximas clases agendadas e historial de clases pasadas. |
| `/alumnas/novedades` | Promociones y avisos vigentes publicados por el estudio. |

### 3. Portal de administración (`/admin/*`) — sidebar persistente
| Ruta | Descripción |
| --- | --- |
| `/admin` | Calendario semanal (grid de 7 días): crea clases con formulario en línea, restringido al horario operativo del día; marca los días inactivos y permite repetición semanal. |
| `/admin/configuracion` | Motor del calendario: días de apertura y horario operativo (apertura/cierre) por día. |
| `/admin/alumnas` | Directorio CRM: nombre, contacto, estado (Activo/Inactivo), última asistencia, búsqueda y filtros. |
| `/admin/asistencia` | Control de asistencia de una sesión: lista de reservas, marcado en tiempo real y contadores *Reservadas* vs *Presentes*. |
| `/admin/promociones` | Alta, edición y programación de promociones, con interruptores para publicarlas en la landing y notificar a las alumnas. |

## Stack técnico

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 3** con tokens de color propios (`primary`, `ink`, `muted`)
- **Lucide React** para la iconografía (los nombres siguen la nomenclatura de Material Symbols)
- Diseño *mobile first*: barra de pestañas inferior en móvil, top nav y sidebar en escritorio

## Calendario

`components/CalendarioSemanal.tsx` es el componente compartido por el portal de alumnas y el de
administración. En escritorio dibuja una rejilla de siete columnas con la cabecera de cada día
(abreviatura, número y horario operativo), marcando el día actual con subrayado dorado y los días
cerrados como inactivos. En móvil cambia a una tira horizontal de días seleccionables más la lista
del día elegido, que es la forma cómoda de operar con una mano. Cada portal aporta su propia
tarjeta de clase mediante la prop `renderClase`, y el administrador añade el formulario de nueva
clase con `pieDia`.

## Promociones

El staff crea promociones en `/admin/promociones` indicando título, descripción, distintivo
(`2X1`, `-30%`…) y ventana de fechas. Tres interruptores deciden su alcance:

- **Activa** — la promoción está publicada.
- **En la landing** — aparece en la sección "Promociones vigentes" de la página de inicio.
- **Notificar** — llega a las alumnas como novedad: contador en la campana del portal, insignia en
  la pestaña inferior y detalle en `/alumnas/novedades`. El contador se limpia al leerlas.

Una promoción solo se muestra si está activa y la fecha de hoy cae dentro de su ventana, así que
las campañas se pueden dejar programadas con antelación.

## Fotografías

Copia las fotos del estudio en `public/fotos/` con los nombres documentados en
`public/fotos/README.md`. Mientras un archivo no exista, el componente `<Foto>` dibuja un marcador
con el isotipo y el nombre del archivo que falta, de modo que la maquetación nunca se rompe.

## Estado y persistencia

Hoy el estado (usuarios, configuración del estudio, clases, reservas, asistencia y promociones)
vive en un `StoreProvider` de React y se persiste en `localStorage` bajo la clave
`unium.state.v2`, con datos semilla realistas. Eso significa que **cada navegador guarda sus
propios datos**: sirve para probar la aplicación entera, no para operar el estudio.

## Base de datos

El proyecto está preparado para funcionar contra **Supabase** (PostgreSQL más autenticación).
La preparación ya está en el repositorio:

- `supabase/schema.sql` — tablas, índices, disparadores y seguridad por filas.
- `supabase/semilla.sql` — horario, clases y promociones iniciales.
- `supabase/README.md` — puesta en marcha paso a paso.
- `lib/supabase/` — clientes de navegador y de servidor, más los tipos de la base.
- `lib/datos/` — las consultas de cada área, listas para usar.
- `middleware.ts` — refresco de la sesión en cada navegación.
- `docs/migracion-base-de-datos.md` — qué función del contexto sustituye a cuál.

Mientras no existan `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, la aplicación
sigue funcionando con el almacén local: nada se rompe por no tener el proyecto creado todavía.

## Cuentas de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Alumna | `mariana@unium.fit` | `unium123` |
| Staff (admin) | `admin@unium.fit` | `unium123` |

El login incluye botones de acceso rápido para ambos perfiles. Para reiniciar los datos, borra la
clave `unium.state.v2` de `localStorage`.

## Puesta en marcha

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de producción
npm start
```

## Estructura del proyecto

```
app/
  page.tsx                    landing pública
  login/ · register/          autenticación
  alumnas/                    portal de alumnas (layout con top nav)
    page.tsx                  reserva de clases
    clase/[id]/page.tsx       detalle de clase
    perfil/page.tsx           mi perfil
    novedades/page.tsx        promociones vigentes
  admin/                      portal de administración (layout con sidebar)
    page.tsx                  calendario semanal
    configuracion/            horario operativo del estudio
    alumnas/                  directorio CRM
    asistencia/               control de asistencia
    promociones/              gestor de promociones y avisos
components/                   Marca, Icono, Foto, Guard, calendario, navegación y notificaciones
lib/
  store.tsx                   estado en React persistido en localStorage
  supabase/                   clientes y tipos de la base de datos
  datos/                      consultas por área (sesión, clases, reservas, promociones)
supabase/                     esquema, semilla y guía de puesta en marcha
docs/                         mapa de migración del almacén local a la base
public/                       marca, logotipo, isotipo y carpeta fotos/
```
