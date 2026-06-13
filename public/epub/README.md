# Biblioteca (epubs)

Coloca aquí tus archivos `.epub`.

Para que un libro aparezca como disponible en la sección "Biblioteca":

1. Copia el archivo `.epub` a esta carpeta (`public/epub/`).
2. Abre `src/data/libraryRegistry.js` y, en la entrada correspondiente,
   cambia `file: null` por `file: '/epub/tu-archivo.epub'`.

Los libros se agrupan automáticamente por categoría (las mismas categorías
del Dashboard: Inteligencia Artificial, Productividad, Diseño, Idiomas,
Programación, Pruebas).
