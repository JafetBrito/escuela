# Imágenes de cursos — patrón general

Cada curso guarda sus imágenes en su propia carpeta: `public/course-images/<courseId>/`. Dentro del HTML de `content` de un módulo se referencian como cualquier `<img>` normal:

```html
<img src="/course-images/<courseId>/nombre-del-archivo.jpg" alt="Descripción" style="width:100%;max-width:420px;display:block;margin:0 auto 1rem auto;border-radius:12px;background:#fff" />
```

La ruta siempre empieza en `/course-images/<courseId>/...` — `public/` es la raíz que sirve Vite, así que no se escribe `public/` en el `src`.

Hay dos formas de conseguir esas imágenes, según el caso:

## 1. Arte propio / capturas de pantalla

Para cursos con material propio (ej. `course-ciberseguridad-basica`): fotos, ilustraciones o capturas hechas para ese curso específico. No requieren crédito ni verificación de licencia porque son contenido original de Oliver Academy.

## 2. Fotos/ilustraciones reales de dominio público o Creative Commons (Wikimedia Commons)

Para temas históricos, científicos o médicos donde hace falta una imagen **real** (un retrato, una lámina anatómica, una fotografía de época) — como `course-atlas-cuerpo-humano` y `course-medicina`. Wikimedia Commons es la fuente porque su licencia siempre es verificable por API antes de descargar nada.

**Flujo de trabajo:**

1. Buscar candidatos con la API de búsqueda de Commons (requiere un `User-Agent` propio o Wikimedia bloquea/limita la petición):
   ```
   curl -A "OliverAcademyBot/1.0 (contact: <email>)" \
     "https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=<término>&srnamespace=6&format=json"
   ```
2. Para cada candidato, verificar la licencia antes de descargar (campo `LicenseShortName` en `extmetadata`):
   ```
   curl -A "OliverAcademyBot/1.0 (contact: <email>)" \
     "https://commons.wikimedia.org/w/api.php?action=query&titles=File:<archivo>&prop=imageinfo&iiprop=url|extmetadata&format=json"
   ```
   Solo se aceptan: `Public domain`, `CC0`, `CC BY 3.0/4.0`, `CC BY-SA 3.0/4.0`. Cualquier otra licencia (no comercial, sin derivados, "fair use", o license poco clara) se descarta — no se fuerza una imagen que no se pueda verificar.
3. Descargar solo lo verificado, con el mismo `User-Agent`:
   ```
   curl -A "OliverAcademyBot/1.0 (contact: <email>)" -o <destino> "<url directa de imageinfo.url>"
   ```
4. Confirmar que el archivo descargado es una imagen real (no una página de error HTML disfrazada) con `file <archivo>` antes de darlo por bueno.
5. Insertar en el `content` del módulo el `<img>` + una leyenda de crédito justo debajo (autor y licencia, o "Dominio público — Wikimedia Commons"):
   ```html
   <img src="/course-images/<courseId>/<archivo>" alt="<tema>" style="width:100%;max-width:420px;display:block;margin:0 auto 1rem auto;border-radius:12px;background:#fff" />
   <p style="text-align:center;font-size:0.75rem;opacity:.6;margin-top:-0.75rem;margin-bottom:1.5rem">Autor — Licencia, Wikimedia Commons</p>
   ```

**Después de aplicar la migración**: los archivos nuevos en `public/course-images/` necesitan comitearse y pushearse — el sitio los sirve desde el build de Vercel, no desde Supabase. Sin el push, la imagen referenciada en el HTML del curso da 404/422 aunque la migración ya esté aplicada en la base de datos.

Este flujo (búsqueda → verificar licencia → descargar → crédito) se repite igual para cualquier curso nuevo que necesite imágenes reales — no hace falta inventar nada distinto cada vez.
