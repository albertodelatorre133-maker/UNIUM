# Marca

Archivos originales tal como los entregó el estudio, sin tocar:

| Archivo | Descripción |
| --- | --- |
| `logo-original.jpg` | Logotipo completo, 1024×1024, fondo negro |
| `isotipo-original.png` | Monograma UW, 1024×1024, fondo crema |

## Qué usa la aplicación

- `public/logo.png` — conversión directa del original a PNG. Conserva el fondo
  negro, que forma parte del diseño del emblema.
- `public/isotipo.png` — monograma recortado y con fondo transparente, para que
  se integre sobre cualquier superficie oscura de la interfaz.
- `app/icon.png` — favicon derivado del isotipo.

Si algún día cambia la marca, sustituye los originales y vuelve a generar los
derivados: el fondo crema del isotipo se elimina por saturación (el papel y la
cuadrícula quedan por debajo de 26; el dorado la supera con holgura).

`logo.svg` e `isotipo.svg` son una recreación vectorial que solo se usa como
respaldo si los PNG no existen.
