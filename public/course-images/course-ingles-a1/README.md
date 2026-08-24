# Imágenes — course-ingles-a1

Coloca aquí las imágenes reales de este curso (fotos, ilustraciones, capturas). Formatos: `.jpg`/`.png`/`.webp`, nombre descriptivo en minúsculas con guiones (ej. `familia-vocabulario.jpg`).

**Cómo usarlas en una clase**: dentro del HTML de `content` de un módulo (`scripts/build_english_a1_course.mjs`), como cualquier `<img>` normal:

```html
<img src="/course-images/course-ingles-a1/nombre-del-archivo.jpg" alt="Descripción" class="rounded-xl border border-border" />
```

La ruta siempre empieza en `/course-images/<courseId>/...` — `public/` es la raíz que sirve Vite, así que no se escribe `public/` en el `src`.

`placeholder.svg` en esta carpeta es un marcador de posición genérico (no arte final) — bórralo cuando ya no haga falta.
