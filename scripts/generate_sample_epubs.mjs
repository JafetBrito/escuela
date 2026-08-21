// Genera 2 EPUBs de ejemplo (contenido original, escrito para esto — nada
// descargado) para poblar La Estantería. Corre una vez, no forma parte de
// la app. Uso: node scripts/generate_sample_epubs.mjs
import JSZip from 'jszip'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const outDir = path.join(process.cwd(), 'public', 'epub')

async function buildEpub({ id, title, author, language = 'es', coverSvg, chapters }) {
  const zip = new JSZip()
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })

  zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`)

  zip.file('OEBPS/styles.css', `
body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.6; margin: 1.5em; }
h1 { font-size: 1.4em; }
p { margin: 0 0 1em; text-align: justify; }
`)

  zip.file('OEBPS/cover.svg', coverSvg)
  zip.file('OEBPS/cover.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${title}</title></head>
<body style="margin:0;padding:0;">
  <img src="cover.svg" alt="${title}" style="width:100%;height:100%;"/>
</body>
</html>`)

  const manifestItems = chapters
    .map((c, i) => `    <item id="chap${i + 1}" href="chap${i + 1}.xhtml" media-type="application/xhtml+xml"/>`)
    .join('\n')
  const spineItems = chapters.map((c, i) => `    <itemref idref="chap${i + 1}"/>`).join('\n')
  const navPoints = chapters
    .map((c, i) => `    <navPoint id="navpoint-${i + 1}" playOrder="${i + 1}">
      <navLabel><text>${c.title}</text></navLabel>
      <content src="chap${i + 1}.xhtml"/>
    </navPoint>`)
    .join('\n')

  // Portada declarada dos veces a propósito: `properties="cover-image"` es
  // como la busca EPUB3/epubjs moderno, `<meta name="cover">` es el patrón
  // viejo (EPUB2) que algunos lectores todavía esperan — con las dos, la
  // portada se ve sin importar qué lector la abra.
  zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${title}</dc:title>
    <dc:creator>${author}</dc:creator>
    <dc:language>${language}</dc:language>
    <dc:identifier id="BookId">oliver-academy-${id}</dc:identifier>
    <meta name="cover" content="cover-img"/>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="css" href="styles.css" media-type="text/css"/>
    <item id="cover-img" href="cover.svg" media-type="image/svg+xml" properties="cover-image"/>
    <item id="cover-page" href="cover.xhtml" media-type="application/xhtml+xml"/>
${manifestItems}
  </manifest>
  <spine toc="ncx">
    <itemref idref="cover-page"/>
${spineItems}
  </spine>
  <guide>
    <reference type="cover" title="Portada" href="cover.xhtml"/>
  </guide>
</package>`)

  zip.file('OEBPS/toc.ncx', `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="oliver-academy-${id}"/>
  </head>
  <docTitle><text>${title}</text></docTitle>
  <navMap>
${navPoints}
  </navMap>
</ncx>`)

  chapters.forEach((c, i) => {
    zip.file(`OEBPS/chap${i + 1}.xhtml`, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${c.title}</title><link rel="stylesheet" type="text/css" href="styles.css"/></head>
<body>
  <h1>${c.title}</h1>
${c.paragraphs.map((p) => `  <p>${p}</p>`).join('\n')}
</body>
</html>`)
  })

  const buf = await zip.generateAsync({ type: 'nodebuffer', mimeType: 'application/epub+zip' })
  writeFileSync(path.join(outDir, `${id}.epub`), buf)
  console.log(`✓ ${id}.epub`)
}

const CAT_COVER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fdba74"/>
      <stop offset="1" stop-color="#c2410c"/>
    </linearGradient>
  </defs>
  <rect width="400" height="600" fill="url(#bg)"/>
  <rect x="60" y="190" width="280" height="170" rx="14" fill="#1e1b16" opacity="0.9"/>
  <circle cx="84" cy="212" r="6" fill="#f87171"/>
  <circle cx="104" cy="212" r="6" fill="#fbbf24"/>
  <circle cx="124" cy="212" r="6" fill="#4ade80"/>
  <text x="80" y="256" font-family="Menlo, Consolas, monospace" font-size="16" fill="#4ade80">$ print("miau")</text>
  <text x="80" y="282" font-family="Menlo, Consolas, monospace" font-size="16" fill="#e2e8f0">miau</text>
  <text x="80" y="308" font-family="Menlo, Consolas, monospace" font-size="16" fill="#fbbf24">$ _</text>
  <g>
    <ellipse cx="200" cy="150" rx="70" ry="60" fill="#fed7aa"/>
    <polygon points="140,120 155,58 175,115" fill="#fed7aa"/>
    <polygon points="260,120 245,58 225,115" fill="#fed7aa"/>
    <polygon points="148,111 158,80 170,109" fill="#fb923c"/>
    <polygon points="252,111 242,80 230,109" fill="#fb923c"/>
    <circle cx="175" cy="150" r="9" fill="#1e1b16"/>
    <circle cx="225" cy="150" r="9" fill="#1e1b16"/>
    <path d="M195 168 Q200 175 205 168" stroke="#1e1b16" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M120 160 L165 168 M120 178 L165 172 M235 168 L280 160 M235 172 L280 178" stroke="#1e1b16" stroke-width="2" stroke-linecap="round"/>
  </g>
  <rect x="0" y="492" width="400" height="108" fill="rgba(0,0,0,0.38)"/>
  <text x="200" y="534" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="26" font-weight="bold" fill="#ffffff">El Gato que</text>
  <text x="200" y="568" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="26" font-weight="bold" fill="#ffffff">Aprendió a Programar</text>
</svg>`

await buildEpub({
  id: 'el-gato-que-aprendio-a-programar',
  title: 'El Gato que Aprendió a Programar',
  author: 'Oliver Academy',
  coverSvg: CAT_COVER,
  chapters: [
    {
      title: '1. El teclado misterioso',
      paragraphs: [
        'Oliver era un gato naranja curioso que vivía en un campus lleno de estudiantes. Un día, sobre un escritorio olvidado, encontró un teclado que brillaba tenuemente cada vez que alguien tecleaba cerca.',
        'Al principio pensó que era un juguete extraño. Pisó una tecla con su patita y, para su sorpresa, en la pantalla apareció una letra. Pisó otra, y apareció otra más. "¿Esto es magia?", pensó Oliver, con la cola erizada de emoción.',
      ],
    },
    {
      title: '2. La primera línea',
      paragraphs: [
        'Un estudiante llamado Jafet lo encontró jugando con el teclado y, en vez de espantarlo, sonrió. "¿Quieres aprender de verdad?", le preguntó, aunque sabía que un gato no podía responder con palabras.',
        'Jafet escribió una línea sencilla: <code>print("¡Miau!")</code>. Al presionar Enter, la pantalla mostró "¡Miau!" en letras grandes. Oliver saltó hacia atrás, sorprendido, y luego se acercó de nuevo, fascinado. Había entendido algo importante: escribir instrucciones exactas hacía que la computadora hiciera cosas exactas.',
      ],
    },
    {
      title: '3. Bucles y curiosidad',
      paragraphs: [
        'Con el tiempo, Oliver aprendió que repetir una instrucción muchas veces no significaba escribirla muchas veces — existían los bucles. "Diez maullidos" ya no requerían escribir "miau" diez veces, bastaba con pedirle a la computadora que lo repitiera.',
        'Eso le recordó a la vida misma: aprender una cosa bien, una sola vez, y poder repetirla cuantas veces hiciera falta. Desde entonces, Oliver no volvió a ver el teclado como un juguete extraño, sino como una puerta hacia todo lo que aún no sabía.',
      ],
    },
    {
      title: '4. El campus entero',
      paragraphs: [
        'Con el paso de las semanas, Oliver empezó a acompañar a otros estudiantes en sus propios teclados, sentado a su lado mientras ellos también aprendían sus primeras líneas de código.',
        'No enseñaba con palabras, pero su sola presencia parecía recordarle a cada quien que equivocarse, borrar, e intentar de nuevo era parte normal de aprender a programar — igual que había sido para él la primera vez que pisó aquel teclado misterioso.',
      ],
    },
  ],
})

const WISDOM_COVER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4c1d95"/>
      <stop offset="1" stop-color="#1e1b4b"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="35%">
      <stop offset="0" stop-color="#fde68a" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#fde68a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="400" height="600" fill="url(#bg2)"/>
  <circle cx="70" cy="90" r="2.5" fill="#ffffff" opacity="0.8"/>
  <circle cx="330" cy="70" r="2" fill="#ffffff" opacity="0.6"/>
  <circle cx="300" cy="150" r="1.5" fill="#ffffff" opacity="0.7"/>
  <circle cx="60" cy="200" r="1.8" fill="#ffffff" opacity="0.6"/>
  <circle cx="340" cy="230" r="2.2" fill="#ffffff" opacity="0.7"/>
  <circle cx="110" cy="60" r="1.5" fill="#ffffff" opacity="0.5"/>
  <rect width="400" height="600" fill="url(#glow)"/>
  <rect x="175" y="330" width="50" height="150" rx="6" fill="#fef3c7"/>
  <ellipse cx="200" cy="330" rx="25" ry="7" fill="#fde68a"/>
  <path d="M200 330 C 195 300 200 290 200 275" stroke="#78716c" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M200 290 C 185 270 190 240 200 220 C 210 240 215 270 200 290 Z" fill="#f59e0b"/>
  <path d="M200 280 C 193 268 196 250 200 238 C 204 250 207 268 200 280 Z" fill="#fef08a"/>
  <rect x="0" y="492" width="400" height="108" fill="rgba(0,0,0,0.32)"/>
  <text x="200" y="534" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="24" font-weight="bold" fill="#ffffff">Cuentos Breves</text>
  <text x="200" y="566" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="24" font-weight="bold" fill="#ffffff">de Sabiduría</text>
</svg>`

await buildEpub({
  id: 'cuentos-breves-de-sabiduria',
  title: 'Cuentos Breves de Sabiduría',
  author: 'Oliver Academy',
  coverSvg: WISDOM_COVER,
  chapters: [
    {
      title: 'El río y la piedra',
      paragraphs: [
        'Una piedra se quejaba con el río: "Llevas años pasando sobre mí y no has logrado moverme ni un centímetro." El río respondió, sin detenerse: "No intento moverte. Solo sigo mi curso, un poco cada día. Vuelve a preguntarme en cien años."',
        'Cien años después, la piedra era arena, y el río seguía siendo río. La constancia rara vez se nota día a día — se nota cuando se le da tiempo.',
      ],
    },
    {
      title: 'El aprendiz impaciente',
      paragraphs: [
        'Un aprendiz le preguntó a su maestra cuánto tardaría en dominar su oficio. "Diez años", respondió ella. "¿Y si estudio el doble de horas cada día?", insistió él. "Veinte años", contestó la maestra.',
        'El aprendiz no entendió al principio. Con el tiempo comprendió que la prisa por llegar rápido a menudo hace que uno se salte justo lo que hacía falta aprender en el camino.',
      ],
    },
    {
      title: 'La vela que temía apagarse',
      paragraphs: [
        'Una vela nueva temía que, al encender a otra vela con su llama, su propia luz se debilitara. Una vela más vieja le dijo: "Enciéndeme. Verás que tu luz no disminuye por compartirla — al final del salón habrá más luz, no menos."',
        'La vela nueva encendió a la siguiente, y esa a otra más. Ninguna perdió su llama. El salón entero quedó iluminado.',
      ],
    },
  ],
})
