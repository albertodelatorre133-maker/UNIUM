# UNIUM · Wellness Training

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

### 2. Portal de alumnas (`/alumnas/*`) — navegación superior
| Ruta | Descripción |
| --- | --- |
| `/alumnas` | Calendario semanal tipo *bento grid*: cupos disponibles, horario, coach y reserva en un clic. |
| `/alumnas/clase/[id]?fecha=YYYY-MM-DD` | Detalle de la clase: descripción, coach, cupos y mapa del estudio. |
| `/alumnas/perfil` | Datos personales, próximas clases agendadas e historial de clases pasadas. |

### 3. Portal de administración (`/admin/*`) — sidebar persistente
| Ruta | Descripción |
| --- | --- |
| `/admin` | Calendario semanal (grid de 7 días): crea clases con formulario en línea, restringido al horario operativo del día; marca los días inactivos y permite repetición semanal. |
| `/admin/configuracion` | Motor del calendario: días de apertura y horario operativo (apertura/cierre) por día. |
| `/admin/alumnas` | Directorio CRM: nombre, contacto, estado (Activo/Inactivo), última asistencia, búsqueda y filtros. |
| `/admin/asistencia` | Control de asistencia de una sesión: lista de reservas, marcado en tiempo real y contadores *Reservadas* vs *Presentes*. |

## Stack técnico

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 3** con tokens de color propios (`primary`, `ink`, `muted`)
- **Lucide React** para la iconografía (los nombres siguen la nomenclatura de Material Symbols)
- Diseño responsivo: móvil (menú hamburguesa / drawer) y escritorio (top nav y sidebar)

## Estado y persistencia

Esta versión es una aplicación *front-end* completa y funcional: el estado (usuarios,
configuración del estudio, clases, reservas y asistencia) vive en un `StoreProvider` de React y
se persiste en `localStorage` bajo la clave `unium.state.v1`, con datos semilla realistas. Para
llevarlo a producción basta con sustituir las acciones de `lib/store.tsx` por llamadas a una API.

## Cuentas de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Alumna | `mariana@unium.fit` | `unium123` |
| Staff (admin) | `admin@unium.fit` | `unium123` |

El login incluye botones de acceso rápido para ambos perfiles. Para reiniciar los datos, borra la
clave `unium.state.v1` de `localStorage`.

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
  admin/                      portal de administración (layout con sidebar)
    page.tsx                  calendario semanal
    configuracion/            horario operativo del estudio
    alumnas/                  directorio CRM
    asistencia/               control de asistencia
components/                   Marca, Icono, Guard, navegación y shell de auth
lib/                          tipos, utilidades de fecha, datos semilla y store
public/                       logo.svg e isotipo.svg
```
