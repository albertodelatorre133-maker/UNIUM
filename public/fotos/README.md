# Fotografías del estudio

Copia aquí las fotos con estos nombres exactos. Las rutas están declaradas en
`lib/seed.ts` (constante `FOTOS`) y se consumen con el componente `<Foto>`, que
dibuja un marcador con el isotipo mientras el archivo no exista.

| Archivo | Dónde aparece | Encuadre recomendado |
| --- | --- | --- |
| `clase-grupal.jpg` | Hero de la landing | Vertical u horizontal, grupo entrenando |
| `entrenamiento-fuerza.jpg` | Sección "El método UNIUM" | Vertical, una alumna trabajando |
| `sala-estudio.jpg` | Sección "El estudio" (opcional) | Horizontal, sala vacía o ambiente |

## Logotipo original

Si tienes el archivo original del logo (PNG con fondo negro), súbelo a `public/`
como `logo.png` y, si quieres, una versión sin texto como `isotipo.png`. Los
componentes de marca los usan de forma automática y solo recurren a la
recreación en SVG cuando esos archivos no existen.

Recomendaciones para las fotos: JPG o WebP, lado largo de 1600–2000 px y menos de 400 KB por
archivo. Las imágenes se recortan con `object-cover`, así que deja aire
alrededor del motivo principal.
