# Base de datos

La aplicación está preparada para funcionar contra **Supabase** (PostgreSQL más
autenticación). Mientras no existan las credenciales sigue usando el almacén
local del navegador, así que puedes hacer esta puesta en marcha sin prisa y sin
romper nada.

## Puesta en marcha

### 1. Crear el proyecto

En [supabase.com](https://supabase.com) → **New project**. Elige la región más
cercana (para Bogotá, `us-east-1`) y guarda la contraseña de la base de datos
que te pida; no hace falta para la aplicación, pero sí para conectarte por SQL
desde fuera.

### 2. Crear las tablas

En el panel, **SQL Editor** → **New query**. Pega el contenido de
[`schema.sql`](./schema.sql) entero y ejecútalo. Crea las tablas, los índices,
las funciones y las políticas de seguridad.

Después repite la operación con [`semilla.sql`](./semilla.sql), que deja el
horario del estudio, las diez clases de la semana y tres promociones de ejemplo.

> Si ejecutaste `schema.sql` antes del 1 de septiembre de 2026, ejecuta también
> estas migraciones, en orden:
>
> 1. [`migraciones/0001_email_en_perfiles.sql`](./migraciones/0001_email_en_perfiles.sql)
>    — tu tabla `perfiles` no tiene la columna `email`.
> 2. [`migraciones/0002_permitir_bootstrap_admin.sql`](./migraciones/0002_permitir_bootstrap_admin.sql)
>    — sin ella, el paso 4 de más abajo (convertir tu cuenta en staff) falla con
>    `Solo el staff puede cambiar el rol o el estado de una alumna`.
> 3. [`migraciones/0003_tabla_coaches.sql`](./migraciones/0003_tabla_coaches.sql)
>    — crea la tabla de coaches y siembra las tres que ya tenías en el código.
>
> Todas son idempotentes y seguras de correr aunque ya tengas cuentas
> registradas.

### 3. Conectar la aplicación

**Project Settings → API**. Copia estos dos valores:

| En Supabase | Variable |
| --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| Project API keys → `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

Crea el archivo `.env.local` en la raíz del proyecto (usa `.env.example` como
plantilla) y pega ahí los dos valores. En Vercel se ponen en
**Settings → Environment Variables**.

> La clave `service_role` no se usa en este proyecto. Tiene permisos totales y
> se salta la seguridad por filas: nunca va en el cliente ni en el repositorio.

### 4. Crear la cuenta del estudio

Regístrate desde la propia aplicación con el correo del estudio. Después, en el
SQL Editor, conviértela en staff:

```sql
update public.perfiles set rol = 'admin'
where id = (select id from auth.users where email = 'hola@unium.fit');
```

Esa es la única operación que se hace a mano: a partir de ahí el staff gestiona
todo desde el panel.

### 5. Ajustes de autenticación

En **Authentication → Providers → Email**, decide si quieres confirmación por
correo. Con ella activada la alumna debe validar su dirección antes de entrar;
sin ella el registro es inmediato. Para un estudio pequeño suele ser más cómodo
desactivarla al principio.

En **Authentication → URL Configuration** añade la URL de producción para que
los enlaces de recuperación de contraseña apunten al sitio correcto.

## Cómo está organizado

### Tablas

| Tabla | Para qué |
| --- | --- |
| `perfiles` | Nombre, teléfono, rol y estado de cada cuenta. La autenticación vive aparte, en `auth.users`. |
| `configuracion_dias` | Qué días abre el estudio y entre qué horas. Siete filas, una por día. |
| `clases` | Las clases del calendario. Las semanales se repiten; las puntuales llevan fecha. |
| `reservas` | Una alumna en una clase en una fecha. Guarda también si asistió. |
| `promociones` | Promociones con su ventana de fechas y sus tres interruptores. |
| `promociones_leidas` | Qué promociones ha visto cada alumna, para el contador de novedades. |
| `coaches` | El equipo del estudio: nombre, especialidad, biografía y si está activa. Se gestiona desde `/admin/coaches`. |

Los días se numeran **0 = Lunes … 6 = Domingo**, igual que en la aplicación.

### Reglas que vigila la base de datos

No basta con validar en la interfaz: cualquiera puede llamar a la API
directamente. Estas reglas viven en el servidor:

- **El aforo.** Un disparador bloquea la fila de la clase antes de contar, así
  que dos reservas simultáneas no pueden pasarse del cupo.
- **Los días cerrados.** No se puede reservar en un día que el estudio tiene
  desactivado.
- **Una reserva por alumna y sesión**, mediante una restricción de unicidad.
- **Nadie se asciende a staff.** Un disparador impide que una alumna se cambie
  el rol o se reactive sola.

### Quién puede ver qué

Todas las tablas tienen seguridad por filas activada:

- **Sin cuenta** se ven los horarios, las clases y las promociones vigentes, que
  es lo que necesita la página de inicio.
- **Una alumna** ve y gestiona sus propias reservas, y solo su propio perfil.
- **El staff** ve y gestiona todo.

Para que las alumnas sepan cuántos cupos quedan sin ver quién reservó, la
ocupación se consulta con la función `ocupacion(desde, hasta)`, que devuelve
solo el número de reservas por clase y fecha.
