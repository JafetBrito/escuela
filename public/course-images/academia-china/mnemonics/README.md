# Mnemotecnias de caracteres chinos

SVG de línea simple, dibujados a mano (código, no descargados de internet —
misma política del resto del proyecto), uno por carácter, mostrando su
origen pictográfico real — no el estilo de ninguna app comercial existente.

**Convención de nombres**: `<codepoint-hex>.svg`, mismo esquema que usa
`public/hanzi-data/` para los datos de trazos (ver su propio `CREDITS.txt`).
Para calcular el hex de un carácter nuevo:

```js
'火'.codePointAt(0).toString(16) // '706b'
```

**Estilo**: `viewBox="0 0 100 100"`, fondo transparente, trazos gruesos
(`stroke-width` 5-6) con `fill="none"` salvo detalles pequeños, un solo color
de acento por carácter (no necesariamente el mismo para todos). Se
referencian por nombre de archivo desde `module.hanziPractice.characters[].mnemonicSvg`
(ver `src/components/learning/HanziPractice.jsx`), resueltos como
`/course-images/academia-china/mnemonics/<archivo>`.
