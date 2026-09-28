// Curso "Historia de Linux: del software libre al mundo entero".
// Sin videos todavía (solo texto + consolas + quizzes).
import { cp, quiz, text } from './helpers.mjs'

const cow = [
  ' ______________',
  '< Hola Linux >',
  ' --------------',
  '        \\   ^__^',
  '         \\  (oo)\\_______',
  '            (__)\\       )\\/\\',
  '                ||----w |',
  '                ||     ||',
].join('\n')

export const historia = {
  id: 'course-historia-linux',
  title: 'Historia de Linux: del Software Libre al Mundo Entero',
  description: 'De los mainframes de los años 50 a tu teléfono: Unix, el nacimiento del software libre con Stallman y GNU, Linus Torvalds en 1991, las distribuciones, el código abierto y cómo Linux terminó corriendo internet, Android y hasta un helicóptero en Marte. Con consolas interactivas para probar lo que aprendes.',
  ai_instructions: 'Eres el Mago, profesor de la Academia de Linux de Oliver Academy, guiando el curso "Historia de Linux". Cuenta la historia como una aventura con personas reales (Thompson, Ritchie, Stallman, Torvalds, Murdock) y distingue siempre hechos verificables de anécdotas que se cuentan de una forma u otra. Explica conceptos técnicos (kernel, shell, distribución, licencia) con analogías simples, nunca asumas que el alumno ya usó Linux, y si pregunta por una fecha o cifra que no recuerdas con certeza, dilo en vez de inventarla.',
  icon: '🐧',
  color: '#facc15',
  category: 'Linux',
  subcategory: 'Historia y Cultura',
  difficulty: 'principiante',
  locked: false,
  modules: [
    text('Bienvenida: una historia de 60 años en una terminal',
      'De dónde viene el sistema que corre casi todo internet, y por qué su historia es también la historia de una idea.',
      `
<h2>La historia que casi nadie te cuenta</h2>
<p>Cuando abres una app en tu teléfono Android, cuando ves una película en una plataforma de streaming, cuando buscas algo en Google, cuando un banco procesa una transferencia… casi siempre hay <strong>Linux</strong> trabajando por debajo. Y sin embargo, hace 35 años era el pasatiempo de un estudiante finlandés de 21 años. ¿Cómo pasó?</p>
<p>La respuesta no es solo técnica: es una historia de <strong>personas</strong>, de <strong>ideas sobre quién debe poder usar y cambiar el software</strong>, de demandas, de rivalidades y de una comunidad que aprendió a colaborar a escala mundial.</p>

<h2>El mapa del curso</h2>
<table>
<tr><th>Parte</th><th>Qué vas a ver</th></tr>
<tr><td>1. El mundo antes de Linux</td><td>Mainframes, Multics, el nacimiento de Unix en Bell Labs y las "guerras Unix".</td></tr>
<tr><td>2. El nacimiento del software libre</td><td>Cuando el software empezó a venderse, Richard Stallman, GNU, la GPL y el copyleft.</td></tr>
<tr><td>3. Linux</td><td>Linus Torvalds en 1991, el famoso debate con Tanenbaum, y por qué "Linux" y "GNU/Linux" no son lo mismo.</td></tr>
<tr><td>4. Un ecosistema entero</td><td>Distribuciones, código abierto, empresas, Android, la nube y la comunidad.</td></tr>
</table>

<div class="tip">
💡 Este curso tiene <strong>consolas interactivas</strong> en varias clases: son simuladas y seguras, para que pruebes los comandos que aparecen en la historia (pipes, uname, apt, git…). Cuando termines, prueba lo mismo en una terminal real o en el Laboratorio de terminales de la Academia de Linux.
</div>

<div class="warn">
⚠️ Una nota de honestidad: en la historia del software hay anécdotas que se cuentan de varias formas. Cuando algo sea una versión "que se cuenta" y no un hecho documentado, te lo diremos.
</div>
`,
      quiz('¿Cuál es la idea central de este curso?',
        ['Linux siempre fue un producto de una gran empresa', 'Linux es el resultado de décadas de ideas, personas y una comunidad colaborativa', 'Linux se inventó de la nada en un solo fin de semana', 'Linux solo sirve para servidores'], 1)),

    text('Antes de todo: los mainframes y el software compartido',
      'Cómo era programar en los años 50 y 60, y por qué entonces compartir software era lo normal.',
      `
<h2>Computadoras del tamaño de una habitación</h2>
<p>En los años 50 y 60 una computadora era un <strong>mainframe</strong>: un equipo enorme y carísimo que ocupaba una sala completa, propiedad de una universidad, un gobierno o una gran empresa. No había pantalla ni teclado para cada persona. Se trabajaba así: escribías tu programa en <strong>tarjetas perforadas</strong>, se las entregabas a un operador, esperabas horas (a veces un día) y recibías la salida impresa. Si tenías un error de una sola coma, volvías a empezar. A esto se le llamaba <strong>procesamiento por lotes</strong> (<em>batch</em>).</p>

<h2>El software venía "de regalo"</h2>
<p>Lo que hoy nos parece raro: en esa época el software casi <strong>no se vendía</strong>. El dinero estaba en el hardware, y los programas venían incluidos o se intercambiaban entre usuarios. En 1955 nació <strong>SHARE</strong>, un grupo de usuarios de IBM cuyo propósito era justamente compartir programas y mejoras entre organizaciones. Si alguien arreglaba un error, lo compartía; si alguien necesitaba una función, la pedía. Esa era la cultura: <em>el código circulaba</em>.</p>

<h2>El tiempo compartido: la idea que lo cambió todo</h2>
<p>Un problema era que la computadora pasaba mucho tiempo esperando a los humanos. La solución fue el <strong>tiempo compartido</strong> (<em>time-sharing</em>): que una misma máquina atendiera a <em>muchas personas a la vez</em>, cada una en su terminal, alternando entre ellas tan rápido que cada quien sentía que la máquina era suya. Uno de los primeros sistemas así fue <strong>CTSS</strong>, demostrado en el MIT en 1961. Esa idea — un sistema donde muchos usuarios comparten una máquina — es la semilla directa de Unix y, por herencia, de Linux.</p>

<div class="example">
<strong>Piénsalo así:</strong> el procesamiento por lotes es como dejar tu ropa en una lavandería y volver mañana. El tiempo compartido es como tener tu propia lavadora, aunque en realidad compartas una lavandería enorme con cien personas.
</div>

<h2>El fin de la era "todo compartido"</h2>
<p>En 1969, IBM (presionada, entre otras cosas, por investigaciones antimonopolio en Estados Unidos) anunció que empezaría a cobrar el software por separado del hardware. A esto se le llama <strong>unbundling</strong>. Poco a poco el software dejó de ser algo que se regalaba y se volvió un producto con dueño. Ese cambio, como verás, va a provocar una reacción.</p>
`,
      quiz('¿Qué es el "tiempo compartido" (time-sharing)?',
        ['Guardar el tiempo de uso de una computadora para cobrar más', 'Que una misma computadora atienda a muchas personas a la vez, alternando entre ellas muy rápido', 'Un sistema para apagar las computadoras automáticamente', 'Compartir el código fuente con otras empresas'], 1)),

    text('Multics y el nacimiento de Unix en Bell Labs',
      'Un proyecto ambicioso que fracasó a medias y dos ingenieros que decidieron hacer algo más simple.',
      `
<h2>Multics: la idea grandiosa</h2>
<p>En 1964, el MIT, General Electric y los <strong>Bell Labs</strong> (el laboratorio de investigación de AT&T) empezaron un proyecto ambicioso: <strong>Multics</strong>, un sistema de tiempo compartido con todas las funciones imaginables. Era tan grande y complejo que avanzaba lento. En 1969 Bell Labs se retiró del proyecto.</p>

<h2>Dos ingenieros, una PDP-7 y una idea más simple</h2>
<p>Dos de los investigadores que habían trabajado en Multics, <strong>Ken Thompson</strong> y <strong>Dennis Ritchie</strong>, extrañaban tener un entorno cómodo para programar. En 1969, Thompson encontró una computadora pequeña y poco usada (una <strong>PDP-7</strong>) y empezó a escribir un sistema mucho más sencillo, junto con Ritchie y otros colegas. Su nombre en broma fue <strong>"Unics"</strong> (un juego de palabras con Multics, atribuido a Brian Kernighan), que luego se convirtió en <strong>Unix</strong>.</p>

<h2>El salto decisivo: escribirlo en C</h2>
<p>Al principio Unix estaba escrito en ensamblador, atado a una máquina concreta. Ritchie creó un nuevo lenguaje, <strong>C</strong>, y entre 1972 y 1973 el núcleo de Unix se reescribió en C. Esto fue revolucionario: un sistema operativo escrito en un lenguaje de alto nivel podía <strong>llevarse a otras máquinas</strong> con relativamente poco esfuerzo. Esa portabilidad es una de las razones por las que Unix, y sus descendientes, están en todos lados hoy.</p>

<h2>La filosofía Unix</h2>
<p>Unix se hizo famoso por unas ideas de diseño muy simples, que se atribuyen sobre todo a <strong>Doug McIlroy</strong>:</p>
<ul>
<li>Haz programas pequeños que hagan <strong>una sola cosa</strong> y la hagan bien.</li>
<li>Haz que los programas <strong>trabajen juntos</strong>.</li>
<li>Usa <strong>texto</strong> como formato universal para intercambiar datos.</li>
</ul>
<p>La pieza que hace posible esto es el <strong>pipe</strong> (tubería), el símbolo <code>|</code>: toma la salida de un programa y la conecta como entrada del siguiente. Se implementó en Unix hacia 1973. Es tan buena idea que hoy sigue siendo la forma en que se combinan comandos en cualquier terminal Linux.</p>

<pre><code>cat frutas.txt | sort | uniq -c</code></pre>

<div class="tip">
💡 Lee ese comando de izquierda a derecha: <em>toma el archivo → ordénalo → cuenta las repeticiones</em>. Tres programas simples, un resultado útil. Eso es la filosofía Unix en una línea. Lo vas a practicar en la siguiente clase.
</div>
`,
      quiz('¿Por qué fue tan importante reescribir Unix en C?',
        ['Porque C era más bonito', 'Porque permitía llevar el sistema operativo a otras máquinas con relativamente poco esfuerzo (portabilidad)', 'Porque Multics estaba escrito en C', 'Porque así se podía vender más caro'], 1),
      {
        title: 'Simulador: la filosofía Unix con pipes',
        intro: 'Tienes un archivo frutas.txt con las frutas que se vendieron hoy. Vas a combinar programas pequeños con pipes, como en 1973.',
        checkpoints: [
          cp('Mira el contenido del archivo frutas.txt.', 'cat frutas.txt', String.raw`^cat\s+frutas\.txt\s*$`, 'Usa: cat frutas.txt',
            'cat muestra el archivo tal cual: sin orden y con repeticiones.', 'manzana\nnaranja\nmanzana\nuva\nnaranja\nmanzana'),
          cp('Ordénalo alfabéticamente con el programa sort.', 'sort frutas.txt', String.raw`^sort\s+frutas\.txt\s*$`, 'Usa: sort frutas.txt',
            'sort hace una sola cosa: ordenar líneas.', 'manzana\nmanzana\nmanzana\nnaranja\nnaranja\nuva'),
          cp('Ahora conecta sort con uniq -c usando un pipe (|) para contar cuántas veces aparece cada fruta.', 'sort frutas.txt | uniq -c',
            String.raw`^sort\s+frutas\.txt\s*\|\s*uniq\s+-c\s*$`, 'Usa: sort frutas.txt | uniq -c',
            'Dos programas simples, conectados: la salida de sort es la entrada de uniq.', '      3 manzana\n      2 naranja\n      1 uva'),
          cp('Último reto: agrega otro pipe con "sort -rn" para ordenar de más a menos vendida.', 'sort frutas.txt | uniq -c | sort -rn',
            String.raw`^sort\s+frutas\.txt\s*\|\s*uniq\s+-c\s*\|\s*sort\s+-rn\s*$`, 'Usa: sort frutas.txt | uniq -c | sort -rn',
            'Tres programas encadenados. La manzana es la más vendida. Eso es la filosofía Unix.', '      3 manzana\n      2 naranja\n      1 uva'),
        ],
      }),

    text('Unix se expande: universidades, Berkeley y las "guerras Unix"',
      'Cómo un sistema de un laboratorio llegó a todos lados, se dividió en muchas versiones… y se volvió un negocio.',
      `
<h2>Una casualidad legal: Unix casi gratis para las universidades</h2>
<p>AT&T era un monopolio telefónico, y desde 1956 un acuerdo con el gobierno de Estados Unidos le impedía dedicarse al negocio de las computadoras. Por eso no podía vender Unix como producto: lo <strong>licenciaba a universidades a un costo muy bajo</strong>, con el código fuente incluido. Miles de estudiantes aprendieron sistemas operativos leyendo Unix; un ejemplo famoso es el comentario del código de la versión 6 escrito por John Lions (1976), que circuló por todo el mundo en fotocopias.</p>

<h2>Berkeley: BSD</h2>
<p>En la Universidad de California en Berkeley, un grupo (con figuras como <strong>Bill Joy</strong>) mejoró Unix y empezó a distribuir su propia versión: <strong>BSD</strong> (<em>Berkeley Software Distribution</em>), desde 1977. Añadieron programas que aún usamos, como el editor <code>vi</code>, y con financiamiento de DARPA incorporaron el protocolo <strong>TCP/IP</strong> — el idioma de internet — en la versión 4.2BSD (1983). Esto convirtió a Unix en el sistema natural de internet.</p>

<h2>1984: AT&T se divide… y Unix se vuelve negocio</h2>
<p>En 1984 AT&T fue dividida por el gobierno de EE. UU. y, libre de la restricción, pudo vender Unix comercialmente. Las licencias se encarecieron y el código dejó de compartirse tan libremente. Al mismo tiempo, muchas empresas crearon su propia variante: <strong>SunOS/Solaris</strong> (Sun), <strong>AIX</strong> (IBM), <strong>HP-UX</strong> (HP), <strong>System V</strong> (AT&T)… Todas parecidas, todas ligeramente incompatibles. Se le llamó las <strong>"guerras Unix"</strong>.</p>

<div class="example">
<strong>El resultado:</strong> un mundo lleno de "sabores" de Unix, casi todos <em>propietarios y caros</em>, que solo corrían en el hardware de cada fabricante. Para un estudiante o un aficionado, tener acceso a un Unix real era prácticamente imposible. Esa carencia es el escenario donde va a aparecer Linux.
</div>
`,
      quiz('¿Por qué Unix llegó a tantas universidades al principio?',
        ['Porque AT&T lo regalaba por publicidad', 'Porque un acuerdo legal le impedía a AT&T vender computadoras, así que lo licenciaba barato con el código fuente', 'Porque lo distribuía Microsoft', 'Porque era el único sistema que existía en 1970'], 1)),

    text('Cuando el software se volvió propiedad',
      'La otra mitad del contexto: la carta de Gates, los derechos de autor del software y la cultura hacker.',
      `
<h2>Las computadoras llegan a casa</h2>
<p>A mediados de los 70 aparecieron las primeras computadoras personales y con ellas una nueva generación de aficionados y empresas que empezaron a ver el software como <strong>un negocio</strong>. En febrero de 1976, un joven Bill Gates escribió su famosa <strong>"Carta abierta a los aficionados"</strong>, quejándose de que la gente copiaba su BASIC sin pagar. Era un anuncio del cambio de época: el software ya no era algo que se compartía, sino algo que se vendía y se protegía.</p>

<h2>La ley se adapta</h2>
<p>En 1980, Estados Unidos aprobó una reforma que dejó claro que los programas de computadora estaban protegidos por <strong>derechos de autor</strong> (copyright). Con eso, las empresas empezaron a distribuir software solo como <strong>binarios</strong> (el programa ya compilado), sin el <strong>código fuente</strong>, y con licencias que prohibían copiarlo, modificarlo o estudiarlo.</p>

<table>
<tr><th></th><th>Antes (años 50–70)</th><th>Después (años 80)</th></tr>
<tr><td>¿Quién tiene el código fuente?</td><td>Casi siempre el usuario</td><td>Solo el fabricante</td></tr>
<tr><td>¿Se puede modificar?</td><td>Sí, era normal</td><td>No, prohibido por licencia</td></tr>
<tr><td>¿Se puede compartir?</td><td>Sí, era la cultura</td><td>Copiar se consideraba "piratería"</td></tr>
</table>

<h2>La cultura hacker</h2>
<p>En los laboratorios de universidades como el MIT existía una comunidad de programadores apasionados —los <strong>hackers</strong>, en el sentido original: personas que aman entender cómo funcionan las cosas y mejorarlas—. Su ética se resumía en ideas como "la información debe ser libre" y "el acceso a las computadoras debe ser ilimitado y total". El periodista Steven Levy la describió en su libro <em>Hackers</em> (1984).</p>

<div class="tip">
💡 Ojo con la palabra: "hacker" no significa "criminal informático". Ese es el sentido que le dio la prensa después. En este curso —y en la cultura Linux— un hacker es alguien curioso que construye y mejora cosas.
</div>

<p>Esa comunidad vio cómo su mundo de código compartido se disolvía. Una persona, en particular, decidió responder.</p>
`,
      quiz('¿Qué cambió a principios de los 80 respecto al software?',
        ['Se empezó a regalar más', 'Se volvió propiedad protegida por derechos de autor y se distribuyó sin código fuente', 'Dejó de existir el código fuente', 'Solo las universidades pudieron usarlo'], 1)),

    text('Richard Stallman, GNU y las cuatro libertades',
      'El origen del movimiento del software libre.',
      `
<h2>Un programador del MIT y una impresora</h2>
<p><strong>Richard Stallman</strong> trabajaba en el Laboratorio de Inteligencia Artificial del MIT, justo en esa comunidad hacker. Una anécdota famosa (que él mismo cuenta, con algunos detalles que varían según la versión) dice que a principios de los 80 una impresora nueva del laboratorio fallaba y él quiso arreglarla, como siempre había hecho, pero el fabricante se negó a darle el código fuente del controlador. Para Stallman, no poder arreglar una herramienta que usas todos los días fue el símbolo de lo que estaba mal con el nuevo mundo del software cerrado.</p>

<h2>Septiembre de 1983: el anuncio de GNU</h2>
<p>El <strong>27 de septiembre de 1983</strong> Stallman anunció en internet un proyecto: crear un sistema operativo completo, compatible con Unix, pero <strong>libre</strong>. Lo llamó <strong>GNU</strong>, un acrónimo recursivo (chiste de programadores) que significa <em>"GNU's Not Unix"</em> — "GNU no es Unix". En 1984 dejó el MIT para dedicarse a ello, y en 1985 fundó la <strong>Free Software Foundation</strong> (FSF) y publicó el <em>Manifiesto GNU</em>.</p>

<h2>Qué significa "libre" (no "gratis")</h2>
<p>El software libre trata de <strong>libertad</strong>, no de precio (en inglés, <em>"free as in freedom, not as in free beer"</em>). La FSF lo define con <strong>cuatro libertades</strong>, numeradas desde cero (como hacen los programadores):</p>
<table>
<tr><th>Libertad</th><th>Qué te permite</th></tr>
<tr><td>0</td><td>Ejecutar el programa como quieras, con cualquier propósito.</td></tr>
<tr><td>1</td><td>Estudiar cómo funciona y modificarlo (requiere acceso al código fuente).</td></tr>
<tr><td>2</td><td>Redistribuir copias para ayudar a otras personas.</td></tr>
<tr><td>3</td><td>Distribuir copias de tus versiones modificadas, para que la comunidad se beneficie.</td></tr>
</table>

<h2>Las piezas de GNU</h2>
<p>Stallman y sus colaboradores fueron construyendo, pieza por pieza, un sistema entero:</p>
<ul>
<li><strong>GNU Emacs</strong> (1985): un editor de texto extensible.</li>
<li><strong>GCC</strong> (1987): el compilador de C, que hasta hoy compila casi todo el software libre.</li>
<li><strong>Bash</strong> (1989, Brian Fox): la shell — el intérprete de comandos que usarás en este curso.</li>
<li>Utilidades básicas (<code>ls</code>, <code>cp</code>, <code>grep</code>…), depurador (<code>gdb</code>), bibliotecas…</li>
</ul>
<p>Hacia 1990 GNU tenía casi todo lo necesario. Le faltaba una pieza clave: el <strong>kernel</strong>, el núcleo del sistema. Guarda ese detalle.</p>

<div class="warn">
⚠️ Stallman es una figura importante y también controvertida en la comunidad. Como historia, lo relevante es su idea: que los usuarios deben tener control sobre el software que usan. Puedes estar de acuerdo con la idea o con parte de ella y aun así entender por qué cambió el mundo.
</div>
`,
      quiz('¿Qué significa "software libre" según la Free Software Foundation?',
        ['Que no cuesta nada', 'Que respeta las libertades del usuario de ejecutarlo, estudiarlo, modificarlo y redistribuirlo', 'Que no tiene licencia', 'Que solo lo pueden usar universidades'], 1)),

    text('La GPL y el copyleft: un truco legal brillante',
      'Cómo usar el copyright para proteger la libertad en vez de restringirla.',
      `
<h2>El problema</h2>
<p>Si simplemente publicas tu código "para que todos lo usen", alguien podría tomarlo, mejorarlo y volverlo <strong>cerrado</strong>, sin compartir sus mejoras. Tu obra libre acabaría alimentando software no libre.</p>

<h2>La solución: copyleft</h2>
<p>Stallman inventó (con ayuda de abogados) una licencia que usa las mismas leyes de copyright, pero al revés: la <strong>GNU General Public License</strong> (GPL). Dice, en esencia: <em>"Puedes usar, copiar y modificar este programa, pero si lo distribuyes —modificado o no— debes hacerlo bajo la misma licencia y entregar el código fuente."</em> A esa idea se le llama <strong>copyleft</strong> (un juego de palabras con "copyright").</p>
<p>La GPL versión 1 salió en 1989, la 2 en 1991 (la que usa el kernel Linux) y la 3 en 2007.</p>

<h2>Licencias libres: dos grandes familias</h2>
<table>
<tr><th>Familia</th><th>Ejemplos</th><th>Idea</th></tr>
<tr><td><strong>Copyleft</strong> (protegen que siga siendo libre)</td><td>GPL, LGPL, AGPL</td><td>Si distribuyes una versión modificada, debe seguir siendo libre.</td></tr>
<tr><td><strong>Permisivas</strong> (casi sin condiciones)</td><td>MIT, BSD, Apache 2.0</td><td>Haz lo que quieras, incluso cerrarlo; solo conserva el aviso de autoría.</td></tr>
</table>

<div class="example">
<strong>Ejemplo:</strong> Linux usa GPL v2, por eso cualquier empresa que distribuya un dispositivo con Linux modificado debe ofrecer el código fuente de esas modificaciones. Muchos proyectos web, en cambio, usan MIT para que cualquiera pueda incluirlos en productos cerrados.
</div>

<div class="tip">
💡 Cuando publiques tu propio código, <strong>elige siempre una licencia</strong>. Sin licencia, legalmente nadie puede usar tu código, aunque esté en GitHub. Un sitio útil para decidir es choosealicense.com.
</div>
`,
      quiz('¿Qué hace el copyleft de la GPL?',
        ['Prohíbe usar el software', 'Obliga a que las versiones modificadas que se distribuyan sigan siendo libres y con su código fuente', 'Permite cerrar el código si pagas', 'Solo aplica a software de universidades'], 1),
      {
        title: 'Simulador: lee una licencia',
        intro: 'Estás dentro de la carpeta de un proyecto. Antes de usar el código de otra persona, siempre lees su licencia.',
        checkpoints: [
          cp('Lista los archivos de la carpeta.', 'ls', String.raw`^ls\s*$`, 'Usa: ls', 'Ahí está: un archivo LICENSE junto al código.', 'LICENSE  README.md  main.c'),
          cp('Muestra solo las primeras 3 líneas del archivo LICENSE.', 'head -n 3 LICENSE', String.raw`^head\s+-n\s*3\s+LICENSE\s*$`, 'Usa: head -n 3 LICENSE',
            'Es la licencia MIT, una de las permisivas.', 'MIT License\n\nCopyright (c) 2026 Ada Torres'),
          cp('Busca en la licencia la palabra "permission" (sin importar mayúsculas) con grep -i.', 'grep -i permission LICENSE', String.raw`^grep\s+-i\s+["']?permission["']?\s+LICENSE\s*$`,
            'Usa: grep -i permission LICENSE', 'grep encuentra las líneas que contienen esa palabra: aquí está la parte que te da permiso de usar el código.',
            'Permission is hereby granted, free of charge, to any person obtaining a copy'),
        ],
      }),

    text('BSD libre, la demanda y Minix: el terreno antes de Linux',
      'Por qué a principios de los 90 todavía no existía un Unix libre listo para usar.',
      `
<h2>BSD se libera… y se complica</h2>
<p>Durante los 80, los ingenieros de Berkeley fueron reescribiendo las partes de BSD que aún contenían código de AT&T, hasta que se pudo liberar casi todo. Hacia 1992 existía <strong>386BSD</strong>, una versión para PC. Pero ese año <strong>USL</strong> (la empresa de AT&T dueña de Unix) demandó a <strong>BSDi</strong>, una empresa que vendía un derivado de BSD, alegando que usaba código y secretos de Unix. El caso se resolvió en 1994, pero durante dos años creó <strong>incertidumbre legal</strong> sobre BSD. De esa época salieron <strong>FreeBSD</strong> y <strong>NetBSD</strong> (1993) y <strong>OpenBSD</strong> (1995), que siguen vivos hoy.</p>
<p>Muchas personas piensan que esa nube legal ayudó a que la comunidad mirara hacia otro proyecto que estaba naciendo. Es una explicación popular, no la única.</p>

<h2>Minix: un Unix para enseñar</h2>
<p>En 1987, el profesor holandés <strong>Andrew Tanenbaum</strong> escribió <strong>Minix</strong>, un sistema tipo Unix pequeño, hecho para que sus estudiantes pudieran leer y entender un sistema operativo completo en un semestre (lo explicaba en su libro de texto). Corría en PCs baratos. Su código estaba disponible… pero con una licencia restrictiva: se podía estudiar, no se podía modificar ni redistribuir libremente. (Se liberó bajo una licencia tipo BSD hasta el año 2000.)</p>

<h2>El rompecabezas en 1991</h2>
<table>
<tr><th>Pieza</th><th>Estado</th></tr>
<tr><td>Herramientas (compilador, shell, utilidades)</td><td>✅ GNU las tenía casi todas, libres</td></tr>
<tr><td>Kernel libre listo para usar</td><td>❌ GNU Hurd (empezado en 1990) aún estaba lejos; BSD tenía la nube legal; Minix era limitado y no libre del todo</td></tr>
<tr><td>Un Unix accesible en un PC de casa</td><td>❌ Todavía no</td></tr>
</table>
<p>Faltaba una pieza. En un dormitorio universitario de Helsinki, alguien estaba a punto de escribirla.</p>
`,
      quiz('¿Qué era Minix?',
        ['Un videojuego', 'Un sistema tipo Unix pequeño creado por Tanenbaum para enseñar sistemas operativos', 'Un kernel de Microsoft', 'La primera versión de Linux'], 1)),

    text('1991: Linus Torvalds y "solo un pasatiempo"',
      'El estudiante finlandés que empezó un kernel por curiosidad.',
      `
<h2>Un estudiante en Helsinki</h2>
<p><strong>Linus Torvalds</strong> nació en Helsinki (Finlandia) en 1969. Estudiaba en la Universidad de Helsinki, se había enamorado de Unix a través de Minix, y a principios de 1991 se compró una computadora con procesador <strong>Intel 386</strong>. Quería usarla para explorar cómo funcionaba el hardware… y no le gustaban las limitaciones de Minix. Así que empezó a escribir su propio <strong>kernel</strong>.</p>

<h2>El kernel: el corazón del sistema</h2>
<p>El <strong>kernel</strong> (núcleo) es la parte del sistema operativo que habla directamente con el hardware: administra la memoria, decide qué programa usa el procesador en cada momento, controla el disco, la red, los dispositivos. Todo lo demás —el navegador, la terminal, tus juegos— le pide cosas al kernel.</p>

<h2>El mensaje del 25 de agosto de 1991</h2>
<p>El 25 de agosto de 1991, Linus escribió en un grupo de noticias sobre Minix (<code>comp.os.minix</code>) algo parecido a esto (traducido y resumido): <em>"Estoy haciendo un sistema operativo (gratis) — solo un pasatiempo, no será grande ni profesional como GNU— para clones AT 386/486. Llevo unos meses y ya empieza a estar listo. Me gustaría saber qué cosas les gustan o no les gustan de Minix."</em> Es uno de los mensajes más famosos de la historia de la informática: la promesa de que <em>no sería grande</em> resultó ser una de las predicciones más equivocadas.</p>

<h2>Un nombre que no era el elegido</h2>
<p>Linus pensaba llamarlo <strong>"Freax"</strong> (una mezcla de <em>free</em>, <em>freak</em> y X de Unix). Ari Lemmke, el administrador del servidor FTP de la universidad donde se publicó, creó el directorio con el nombre <strong>"linux"</strong> —de <em>Linus</em> + Unix—, y el nombre se quedó. La versión <strong>0.01</strong> se publicó en septiembre de 1991. A principios de 1992, con la versión 0.12, Linus cambió la licencia a la <strong>GPL</strong> de GNU, decisión clave: desde entonces, cualquiera podía mejorar Linux, pero nadie podía cerrarlo.</p>

<h2>Hitos de versiones</h2>
<table>
<tr><th>Año</th><th>Versión</th><th>Detalle</th></tr>
<tr><td>1991</td><td>0.01</td><td>Primera versión pública</td></tr>
<tr><td>1994</td><td>1.0</td><td>Considerado "estable" por primera vez</td></tr>
<tr><td>1996</td><td>2.0</td><td>Soporte para varios procesadores; llega el pingüino <strong>Tux</strong> como mascota</td></tr>
<tr><td>2003</td><td>2.6</td><td>Salto grande en rendimiento y hardware soportado</td></tr>
<tr><td>2011</td><td>3.0</td><td>Celebra los 20 años</td></tr>
<tr><td>2022</td><td>6.0</td><td>Se sigue publicando una versión nueva cada 9–10 semanas aprox.</td></tr>
</table>
`,
      quiz('¿Qué hace el kernel de un sistema operativo?',
        ['Solo dibuja las ventanas', 'Habla con el hardware y administra memoria, procesador, disco y dispositivos para los demás programas', 'Es solo el navegador de internet', 'Guarda las contraseñas de los usuarios'], 1),
      {
        title: 'Simulador: conoce tu kernel',
        intro: 'Todo sistema Linux te dice qué kernel está corriendo. Vas a preguntarle a la máquina simulada.',
        checkpoints: [
          cp('Pregunta cuál es el nombre del kernel con uname -s.', 'uname -s', String.raw`^uname\s+-s\s*$`, 'Usa: uname -s', 'El kernel se llama Linux — el mismo nombre que le dio Ari Lemmke en 1991.', 'Linux'),
          cp('Ahora pregunta la versión del kernel (release) con uname -r.', 'uname -r', String.raw`^uname\s+-r\s*$`, 'Usa: uname -r',
            'Esa es la versión del kernel (el número exacto en tu computadora será distinto). Recuerda: la 0.01 fue en 1991.', '6.8.0-45-generic'),
          cp('Pide toda la información junta con uname -a.', 'uname -a', String.raw`^uname\s+-a\s*$`, 'Usa: uname -a',
            'Sistema, nombre del equipo, versión del kernel y arquitectura, en una sola línea.', 'Linux mi-laptop 6.8.0-45-generic #45-Ubuntu SMP x86_64 GNU/Linux'),
        ],
      }),

    text('El gran debate: Tanenbaum contra Torvalds',
      'Microkernels contra kernels monolíticos, en la discusión más famosa de la historia de Linux.',
      `
<h2>"Linux es obsoleto"</h2>
<p>En enero de 1992, Andrew Tanenbaum (el creador de Minix) publicó en el mismo grupo de noticias un mensaje titulado <strong>"LINUX is obsolete"</strong>. Argumentaba que el diseño del kernel de Linux ya estaba pasado de moda y que era un error hacerlo dependiente de un solo tipo de procesador. Linus respondió, y se armó una de las discusiones técnicas más famosas de internet.</p>

<h2>El fondo técnico: dos formas de diseñar un kernel</h2>
<table>
<tr><th></th><th>Kernel monolítico</th><th>Microkernel</th></tr>
<tr><td>Idea</td><td>Casi todo (drivers, sistema de archivos, red) corre dentro del kernel.</td><td>El kernel es mínimo; lo demás corre como programas separados.</td></tr>
<tr><td>Ventaja</td><td>Rápido y más sencillo de programar.</td><td>Más limpio, y un fallo en un componente no tumba todo.</td></tr>
<tr><td>Desventaja</td><td>Un error grave en un driver puede tumbar el sistema.</td><td>Comunicarse entre piezas cuesta rendimiento.</td></tr>
<tr><td>Ejemplos</td><td>Linux, BSD clásico</td><td>Minix, GNU Hurd, QNX</td></tr>
</table>
<p>Tanenbaum defendía el microkernel como el futuro; Linus defendía el enfoque monolítico, más práctico. Con los años la historia dio la razón a Linus <em>en el mundo real</em> (Linux dominó), aunque los microkernels siguen siendo importantes en sistemas donde la fiabilidad es crítica.</p>

<h2>La lección para ti</h2>
<p>Tanenbaum tenía razón en algo: Linux estaba muy ligado al procesador x86 <em>en ese momento</em>. La historia demostró después que la portabilidad se podía lograr: hoy Linux corre en más arquitecturas que casi cualquier otro sistema. Las buenas ideas se mejoran discutiendo.</p>

<div class="tip">
💡 Cuando trabajes en equipos, esto se repite todos los días: dos personas competentes que discrepan en el diseño. La clave que muestra esta historia es discutir con argumentos técnicos y quedarse con el resultado que funcione.
</div>
`,
      quiz('¿Cuál es la principal diferencia entre un kernel monolítico y un microkernel?',
        ['El monolítico solo funciona en un tipo de computadora', 'En el monolítico casi todo corre dentro del kernel; en el microkernel el kernel es mínimo y lo demás corre por separado', 'El microkernel es siempre más rápido', 'No hay ninguna diferencia'], 1)),

    text('GNU + Linux: ¿cómo se arma un sistema completo?',
      'El kernel solo no es un sistema operativo. Las capas de un sistema Linux, y el debate del nombre.',
      `
<h2>Linux, estrictamente, es solo el kernel</h2>
<p>Lo que Linus escribió es un kernel. Para tener un sistema que puedas usar, hace falta mucho más. Y esas piezas ya existían: las había construido el proyecto GNU.</p>

<h2>Las capas de un sistema Linux típico</h2>
<table>
<tr><th>Capa</th><th>Qué hace</th><th>Ejemplo (origen)</th></tr>
<tr><td>Kernel</td><td>Habla con el hardware</td><td>Linux (Torvalds y la comunidad)</td></tr>
<tr><td>Biblioteca C</td><td>Lo que usan los programas para pedirle cosas al kernel</td><td>glibc (GNU)</td></tr>
<tr><td>Compilador</td><td>Convierte código en programas</td><td>GCC (GNU)</td></tr>
<tr><td>Shell</td><td>Interpreta los comandos que escribes</td><td>Bash (GNU)</td></tr>
<tr><td>Utilidades básicas</td><td>ls, cp, cat, grep…</td><td>GNU coreutils</td></tr>
<tr><td>Sistema de arranque y servicios</td><td>Arranca la máquina y sus servicios</td><td>systemd u otros</td></tr>
<tr><td>Entorno de escritorio</td><td>Ventanas, iconos, menús</td><td>GNOME, KDE Plasma, Xfce…</td></tr>
</table>

<h2>El debate del nombre</h2>
<p>La FSF y Stallman piden llamar a estos sistemas <strong>GNU/Linux</strong>, porque gran parte del sistema es GNU y sin esas piezas Linux no habría sido usable. La mayoría de la gente dice simplemente <strong>Linux</strong>, por brevedad y porque es la marca que se popularizó. No hay una respuesta oficial correcta: ambas posturas tienen sentido, y conviene saber por qué existe la discusión.</p>

<div class="warn">
⚠️ <strong>Android es la prueba de que el nombre importa.</strong> Android usa el kernel Linux, pero no usa las piezas de GNU (tiene su propia biblioteca C, llamada Bionic, y sus propias herramientas). Por eso Android <em>es Linux</em> (por el kernel) pero <em>no es GNU/Linux</em>.
</div>
`,
      quiz('¿Por qué Android usa Linux pero no se le llama GNU/Linux?',
        ['Porque Google no conoce GNU', 'Porque usa el kernel Linux pero no las herramientas y bibliotecas de GNU', 'Porque no usa kernel', 'Porque es un sistema de Microsoft'], 1),
      {
        title: 'Simulador: encuentra las piezas GNU',
        intro: 'Vas a comprobar en un sistema Linux simulado que muchas herramientas cotidianas vienen del proyecto GNU.',
        checkpoints: [
          cp('Pregunta la versión de Bash con bash --version.', 'bash --version', String.raw`^bash\s+--version\s*$`, 'Usa: bash --version',
            'Fíjate en el texto: "GNU bash" y el copyright de la Free Software Foundation.', 'GNU bash, version 5.2.21(1)-release (x86_64-pc-linux-gnu)\nCopyright (C) 2022 Free Software Foundation, Inc.'),
          cp('Ahora pregunta la versión del compilador con gcc --version.', 'gcc --version', String.raw`^gcc\s+--version\s*$`, 'Usa: gcc --version',
            'GCC significa "GNU Compiler Collection". Lo empezó Stallman en 1987.', 'gcc (Ubuntu 13.2.0-23ubuntu4) 13.2.0\nCopyright (C) 2023 Free Software Foundation, Inc.'),
          cp('Por último, pregunta la versión de la biblioteca C con ldd --version.', 'ldd --version', String.raw`^ldd\s+--version\s*$`, 'Usa: ldd --version',
            'glibc: la biblioteca de C de GNU, por donde pasan casi todos los programas para hablar con el kernel.', 'ldd (Ubuntu GLIBC 2.39-0ubuntu8) 2.39'),
        ],
      }),

    text('Las distribuciones: cientos de sabores de Linux',
      'Slackware, Debian, Red Hat, Ubuntu, Arch… cómo se empaqueta Linux para que una persona pueda instalarlo.',
      `
<h2>El problema de armar todo a mano</h2>
<p>Instalar un sistema Linux "a mano" significaba conseguir el kernel, compilar cada herramienta y configurar todo. Poca gente podía hacerlo. Así nacieron las <strong>distribuciones</strong> (o <em>distros</em>): paquetes que reúnen el kernel, las herramientas GNU, un instalador y un <strong>gestor de paquetes</strong> para instalar programas fácilmente.</p>

<h2>Las distribuciones históricas</h2>
<table>
<tr><th>Año</th><th>Distribución</th><th>Por qué importa</th></tr>
<tr><td>1992–93</td><td>SUSE / Slackware</td><td>Primeras distros muy populares (SUSE en Alemania, Slackware de Patrick Volkerding).</td></tr>
<tr><td>1993</td><td><strong>Debian</strong></td><td>Creada por Ian Murdock (su nombre viene de "Debra" y "Ian"). Comunitaria, sin dueño comercial. Una de las más influyentes.</td></tr>
<tr><td>1994–95</td><td><strong>Red Hat</strong></td><td>Primera empresa en hacer un negocio grande con Linux, vendiendo soporte y servicios.</td></tr>
<tr><td>2002</td><td>Arch Linux</td><td>Minimalista, para quien quiere construir su sistema pieza por pieza.</td></tr>
<tr><td>2003</td><td>Fedora</td><td>Distro comunitaria patrocinada por Red Hat.</td></tr>
<tr><td>2004</td><td><strong>Ubuntu</strong></td><td>Basada en Debian, creada por Mark Shuttleworth (Canonical). Se hizo famosa por ser fácil para principiantes.</td></tr>
<tr><td>2006</td><td>Linux Mint</td><td>Basada en Ubuntu, muy amigable para quienes vienen de Windows.</td></tr>
</table>

<h2>Familias y gestores de paquetes</h2>
<p>La mayoría de distros se agrupan por su "familia", y cada familia tiene su forma de instalar programas:</p>
<table>
<tr><th>Familia</th><th>Ejemplos</th><th>Gestor</th><th>Comando típico</th></tr>
<tr><td>Debian</td><td>Debian, Ubuntu, Mint</td><td>apt</td><td><code>sudo apt install nombre</code></td></tr>
<tr><td>Red Hat</td><td>Fedora, RHEL, Rocky, AlmaLinux</td><td>dnf</td><td><code>sudo dnf install nombre</code></td></tr>
<tr><td>Arch</td><td>Arch, Manjaro</td><td>pacman</td><td><code>sudo pacman -S nombre</code></td></tr>
</table>

<div class="tip">
💡 <strong>¿Cuál elijo?</strong> Para empezar, Ubuntu o Linux Mint: mucha documentación, ayuda de la comunidad y todo funciona "de fábrica". Cuando quieras entender más, prueba Debian o Fedora. Arch es para cuando ya sepas por qué lo quieres.
</div>

<p>Otro dato: ninguna distro es "la correcta". Cada una responde a necesidades distintas: estabilidad para servidores, novedades para escritorio, ligereza para computadoras viejas, seguridad, o control total.</p>
`,
      quiz('¿Qué es una distribución de Linux?',
        ['Un virus que se distribuye por internet', 'Un paquete que reúne el kernel, herramientas, instalador y gestor de paquetes para usar Linux fácilmente', 'Solo el kernel Linux', 'Una tienda de aplicaciones de Google'], 1),
      {
        title: 'Simulador: identifica tu distro e instala un programa',
        intro: 'Vas a descubrir en qué distribución estás y a instalar un programa con el gestor de paquetes apt (familia Debian/Ubuntu).',
        checkpoints: [
          cp('Descubre qué distribución estás usando leyendo el archivo /etc/os-release.', 'cat /etc/os-release', String.raw`^cat\s+/etc/os-release\s*$`, 'Usa: cat /etc/os-release',
            'Ahí dice: Ubuntu, de la familia Debian. Ese archivo existe en casi todas las distros modernas.', 'PRETTY_NAME="Ubuntu 24.04 LTS"\nNAME="Ubuntu"\nID=ubuntu\nID_LIKE=debian'),
          cp('Actualiza la lista de programas disponibles con sudo apt update.', 'sudo apt update', String.raw`^sudo\s+apt(-get)?\s+update\s*$`, 'Usa: sudo apt update',
            'apt consultó los repositorios (servidores con miles de programas libres) para saber qué versiones hay.', 'Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease\nReading package lists... Done'),
          cp('Instala el programa cowsay con sudo apt install cowsay.', 'sudo apt install cowsay', String.raw`^sudo\s+apt(-get)?\s+install\s+(-y\s+)?cowsay\s*$`, 'Usa: sudo apt install cowsay',
            'Instalado. Un solo comando y el programa quedó listo, sin buscar instaladores en páginas web.', 'Setting up cowsay (3.03+dfsg2-8) ...'),
          cp('Pruébalo: cowsay "Hola Linux".', 'cowsay "Hola Linux"', String.raw`^cowsay\s+.+$`, 'Usa: cowsay "Hola Linux" (con comillas)',
            'Un programa inútil pero divertido, y también libre — de eso se trata la cultura Linux.', cow),
        ],
      }),

    text('Software libre vs. código abierto: 1998 y la Catedral y el Bazar',
      'Un cambio de nombre que cambió la conversación.',
      `
<h2>La catedral y el bazar</h2>
<p>En 1997 el programador <strong>Eric S. Raymond</strong> presentó un ensayo llamado <em>"La catedral y el bazar"</em>, que comparaba dos formas de desarrollar software:</p>
<ul>
<li><strong>La catedral:</strong> un pequeño grupo cerrado construye el software con cuidado y lo publica cuando está listo (así se hacía, por ejemplo, GNU Emacs en los 80).</li>
<li><strong>El bazar:</strong> el desarrollo ocurre abiertamente, con muchísima gente aportando, publicando versiones a menudo y corrigiendo errores a la vista de todos. Raymond lo veía en cómo se desarrollaba Linux.</li>
</ul>
<p>Su famosa frase resume la idea: <em>"con suficientes ojos, todos los errores son superficiales"</em> — cuantas más personas miran el código, más rápido se encuentran y corrigen los fallos.</p>

<h2>Netscape abre su código</h2>
<p>En enero de 1998, la empresa <strong>Netscape</strong> (fabricante del navegador más usado de la época) anunció que liberaría el código fuente de su navegador. Fue una noticia enorme: una gran empresa comercial apostaba por abrir su código. De ese código nació después <strong>Mozilla</strong> y, con los años, <strong>Firefox</strong>.</p>

<h2>Nace el término "código abierto"</h2>
<p>Poco después, en febrero de 1998, un grupo de personas (entre ellas Raymond, Bruce Perens y Christine Peterson, a quien se le atribuye la propuesta del término) decidió que la expresión "software libre" asustaba a las empresas por su ambigüedad (¿libre o gratis?). Propusieron <strong>"código abierto"</strong> (<em>open source</em>) y fundaron la <strong>Open Source Initiative (OSI)</strong>.</p>

<h2>Dos filosofías, muchas coincidencias</h2>
<table>
<tr><th></th><th>Software libre</th><th>Código abierto</th></tr>
<tr><td>Enfoque</td><td>Ético: la libertad del usuario</td><td>Práctico: mejor software y mejor desarrollo</td></tr>
<tr><td>Impulsado por</td><td>Free Software Foundation (Stallman)</td><td>Open Source Initiative (Raymond, Perens)</td></tr>
<tr><td>Licencias</td><td>Casi las mismas en la práctica</td><td>Casi las mismas en la práctica</td></tr>
</table>
<p>En la práctica, casi todo el software libre es código abierto y viceversa. Por eso a veces se usa <strong>FOSS</strong> o <strong>FLOSS</strong> (<em>Free/Libre and Open Source Software</em>) para referirse a ambos, sin pelear por el nombre.</p>

<h2>Microsoft y Linux: de enemigo a socio</h2>
<p>En 1998 se filtraron memorandos internos de Microsoft (los <em>"Halloween Documents"</em>) que consideraban al código abierto una amenaza competitiva. En 2001 su director ejecutivo de entonces llegó a llamar a Linux "un cáncer". Años después la postura cambió por completo: en 2016 Microsoft lanzó el <strong>Subsistema de Windows para Linux</strong> (WSL) y se unió a la Linux Foundation, y desde 2019 WSL 2 incluye un kernel Linux real dentro de Windows. La industria entera aprendió que competir contra el código abierto era menos rentable que participar en él.</p>
`,
      quiz('¿Por qué se propuso el término "código abierto" en 1998?',
        ['Porque "software libre" era ilegal', 'Porque el término "libre" se confundía con "gratis" y asustaba a las empresas; se buscaba una etiqueta más práctica', 'Porque Stallman lo pidió', 'Porque era un término de Microsoft'], 1)),

    text('Linux llega a las empresas y conquista los servidores',
      'Cómo un proyecto de aficionados terminó en el centro de la industria.',
      `
<h2>La web nació sobre software libre</h2>
<p>A mediados de los 90 internet crecía y las empresas necesitaban servidores. El servidor web <strong>Apache</strong> (libre) se convirtió en el más usado del mundo, y junto con Linux, MySQL y PHP/Perl/Python formó la famosa pila <strong>LAMP</strong>: cientos de miles de sitios web corrían sobre software libre sin pagar licencias. Empresas como Google, en sus primeros años, construyeron su infraestructura con Linux por costo y control.</p>

<h2>Hitos empresariales</h2>
<table>
<tr><th>Año</th><th>Hecho</th></tr>
<tr><td>1999</td><td>Red Hat sale a bolsa (IPO) con un gran éxito; se vuelve el símbolo de que el código abierto puede ser un negocio.</td></tr>
<tr><td>1999–2001</td><td>IBM anuncia inversiones de alrededor de mil millones de dólares en Linux: una empresa gigante apostando por él.</td></tr>
<tr><td>2003</td><td>La empresa SCO demanda a IBM alegando que Linux contenía código de Unix. Años de pleitos, y los tribunales terminaron dando la razón a la comunidad y a Novell (dueña de los derechos de Unix).</td></tr>
<tr><td>2007</td><td>Se funda la <strong>Linux Foundation</strong>, donde trabaja Linus Torvalds, para sostener el desarrollo del kernel.</td></tr>
<tr><td>2012</td><td>Red Hat supera los mil millones de dólares de ingresos anuales: primera empresa de código abierto en lograrlo.</td></tr>
<tr><td>2019</td><td>IBM completa la compra de Red Hat por unos 34,000 millones de dólares.</td></tr>
</table>

<h2>Supercomputadoras y la nube</h2>
<ul>
<li>Desde <strong>noviembre de 2017</strong>, el 100% de las 500 supercomputadoras más potentes del mundo (lista TOP500) corren Linux.</li>
<li>La <strong>nube</strong> (Amazon AWS desde 2006, y después Google Cloud y Azure) funciona en gran parte sobre máquinas virtuales Linux.</li>
<li>Los <strong>contenedores</strong> (Docker, 2013) y <strong>Kubernetes</strong> (2014), que hoy sostienen millones de aplicaciones, se apoyan en funciones del kernel Linux.</li>
</ul>

<div class="example">
<strong>Un ejemplo cotidiano:</strong> cuando pides un taxi en una app, ves una serie, compras en línea o transfieres dinero, es casi seguro que al menos una parte del camino pasó por servidores Linux.
</div>
`,
      quiz('¿Qué significa el dato de las supercomputadoras TOP500?',
        ['Que Windows domina las supercomputadoras', 'Que desde 2017 todas las 500 más potentes corren Linux', 'Que ya no se usan supercomputadoras', 'Que solo IBM las fabrica'], 1)),

    text('Linux en todos lados: Android, tu casa y hasta Marte',
      'Del bolsillo al espacio, y cómo Torvalds creó también Git.',
      `
<h2>Android: el Linux que casi todos usan sin saberlo</h2>
<p>Android Inc. se fundó en 2003 y Google la compró en 2005. En 2008 llegó el primer teléfono Android comercial (el HTC Dream / T-Mobile G1). Android usa el <strong>kernel Linux</strong> como base, y hoy miles de millones de dispositivos lo ejecutan: probablemente el kernel Linux más usado del planeta está en tu teléfono. (Y como viste, no es "GNU/Linux", porque no usa las herramientas GNU.)</p>

<h2>Más lugares donde vive Linux</h2>
<table>
<tr><th>Dispositivo</th><th>Ejemplo</th></tr>
<tr><td>Casa</td><td>Routers, televisores inteligentes, consolas y decodificadores</td></tr>
<tr><td>Educación / hobby</td><td>Raspberry Pi (2012), una computadora de pocos dólares para aprender</td></tr>
<tr><td>Juegos</td><td>Steam Deck (2022) usa SteamOS, basado en Arch Linux</td></tr>
<tr><td>Laptops</td><td>ChromeOS (Chromebooks) está construido sobre el kernel Linux</td></tr>
<tr><td>Autos y máquinas</td><td>Sistemas de información y entretenimiento de muchos autos, equipos industriales</td></tr>
<tr><td>Espacio</td><td>El helicóptero <em>Ingenuity</em> de la NASA en Marte (2021) corría Linux — el primer Linux en otro planeta</td></tr>
</table>

<h2>Git: la segunda gran obra de Torvalds</h2>
<p>Hasta 2005, los desarrolladores del kernel usaban una herramienta comercial llamada <strong>BitKeeper</strong>, cuya empresa les daba una licencia gratuita. Cuando esa relación se rompió, Torvalds decidió crear su propio sistema de control de versiones en pocas semanas: así nació <strong>Git</strong> (abril de 2005). Hoy Git es la herramienta estándar de casi toda la industria del software, y GitHub se construyó sobre él. Si quieres profundizar, la escuela incluye el curso <em>Git y GitHub: de Cero a Experto</em>.</p>

<h2>El escritorio: el gran pendiente (y no tanto)</h2>
<p>Linux dominó servidores, teléfonos y supercomputadoras, pero durante años se decía que "aún no era el año de Linux en el escritorio". Con Ubuntu, Steam Deck, mejoras en juegos (Proton) y el auge de WSL, su presencia crece, aunque en computadoras de escritorio todavía tiene una fracción pequeña frente a Windows y macOS. La historia sigue abierta.</p>
`,
      quiz('¿Qué relación tiene Android con Linux?',
        ['Ninguna', 'Android usa el kernel Linux como base', 'Android es una distribución Debian', 'Android es de Microsoft'], 1)),

    text('La comunidad: cómo se desarrolla el kernel hoy',
      'Miles de personas, correo electrónico, mantenedores y una versión cada pocas semanas.',
      `
<h2>Cómo se hace Linux</h2>
<p>El kernel Linux es uno de los proyectos colaborativos más grandes de la historia. Miles de personas y empresas contribuyen. La forma de trabajar es sorprendentemente "de la vieja escuela":</p>
<ol>
<li>Alguien detecta un problema o quiere una mejora y escribe un <strong>parche</strong> (un cambio pequeño y concreto).</li>
<li>Lo envía por <strong>correo electrónico</strong> a la lista de correo del kernel y a los <strong>mantenedores</strong> del área correspondiente (redes, sistemas de archivos, controladores…).</li>
<li>Otros lo revisan, comentan y piden cambios, a veces con mucha franqueza.</li>
<li>Si el mantenedor lo aprueba, sube en la cadena hasta Linus Torvalds (o sus lugartenientes), que lo incorpora en la ventana de cada versión.</li>
<li>Cada 9–10 semanas aproximadamente sale una versión nueva.</li>
</ol>

<h2>Un "dictador benevolente"… con reglas</h2>
<p>A Torvalds se le suele describir como "dictador benevolente": tiene la última palabra, pero delega en mantenedores de confianza. En 2018, tras críticas por el tono agresivo de sus revisiones, Linus se disculpó y se tomó un tiempo de descanso; la comunidad adoptó un <strong>Código de Conducta</strong> para que la colaboración fuera más respetuosa. Es un recordatorio de que un proyecto técnico también es un proyecto humano.</p>

<h2>Rust llega al kernel</h2>
<p>Durante más de treinta años el kernel se escribió en C. Desde la versión 6.1 (finales de 2022) se aceptan también componentes escritos en <strong>Rust</strong>, un lenguaje pensado para evitar clases enteras de errores de memoria. Es un cambio histórico, y una muestra de que Linux sigue evolucionando.</p>

<h2>Tú también puedes verlo</h2>
<p>Todo el código del kernel es público. En la consola de esta clase vas a "descargar" el repositorio y mirar su estructura, como haría cualquier persona que quiera aprender leyendo el código real de Linux.</p>
`,
      quiz('¿Cómo se envían normalmente los cambios al kernel Linux?',
        ['Mediante una aplicación móvil', 'Por correo electrónico, como parches, que revisan los mantenedores', 'Solo pagando una licencia', 'Solo Linus puede escribir código'], 1),
      {
        title: 'Simulador: explora el código fuente de Linux',
        intro: 'El kernel vive en un repositorio Git público. Vas a clonarlo (con --depth 1 baja solo la última versión, mucho más rápido) y a mirar su estructura.',
        checkpoints: [
          cp('Clona el repositorio del kernel: git clone --depth 1 https://github.com/torvalds/linux.git', 'git clone --depth 1 https://github.com/torvalds/linux.git',
            String.raw`^git\s+clone\s+(--depth[ =]1\s+)?https://github\.com/torvalds/linux(\.git)?\s*$`, 'Usa: git clone --depth 1 https://github.com/torvalds/linux.git',
            'Ese es el repositorio real. Cualquier persona en el mundo puede descargarlo y leerlo.', "Cloning into 'linux'...\nReceiving objects: 100% done."),
          cp('Entra a la carpeta con cd linux.', 'cd linux', String.raw`^cd\s+linux/?\s*$`, 'Usa: cd linux', 'Ya estás dentro del código fuente del kernel.'),
          cp('Lista las carpetas con ls.', 'ls', String.raw`^ls\s*$`, 'Usa: ls',
            'Fíjate: "drivers" (los controladores, la parte más grande), "fs" (sistemas de archivos), "net" (red), "kernel" (el núcleo), "Documentation"… y el archivo COPYING con la licencia GPL.',
            'arch  block  certs  crypto  Documentation  drivers  fs  include  init  ipc  kernel  lib  LICENSES  mm  net  rust  samples  scripts  security  sound  tools  virt\nCOPYING  CREDITS  Kbuild  Kconfig  MAINTAINERS  Makefile  README'),
        ],
      }),

    text('Cómo participar tú: tu ruta en el mundo Linux',
      'No hace falta ser programador ni experto para ser parte de esta historia.',
      `
<h2>Contribuir no es solo programar</h2>
<p>Cuando la gente piensa en "contribuir al código abierto" imagina escribir código para el kernel. Pero los proyectos libres necesitan mucho más:</p>
<table>
<tr><th>Si sabes hacer…</th><th>Puedes contribuir con…</th></tr>
<tr><td>Usar Linux</td><td>Reportar errores claros (qué hiciste, qué esperabas, qué pasó).</td></tr>
<tr><td>Escribir bien</td><td>Mejorar la documentación y los tutoriales.</td></tr>
<tr><td>Hablar otros idiomas</td><td>Traducir programas y documentación.</td></tr>
<tr><td>Diseñar</td><td>Iconos, temas, interfaces.</td></tr>
<tr><td>Ayudar a otros</td><td>Responder preguntas en foros y comunidades.</td></tr>
<tr><td>Programar</td><td>Corregir errores pequeños en proyectos con la etiqueta "good first issue".</td></tr>
</table>

<h2>Tu plan práctico</h2>
<ol>
<li><strong>Prueba Linux sin arriesgar nada:</strong> usa una máquina virtual, un USB "Live" (arranca sin instalar) o WSL en Windows.</li>
<li><strong>Aprende la terminal:</strong> los cursos <em>Consola de Comandos: Primeros Pasos</em> y <em>Bash desde Cero</em> de esta academia son el siguiente paso natural.</li>
<li><strong>Lleva Linux en tu teléfono:</strong> el curso de <em>Termux</em> te enseña a tener una terminal Linux en tu Android.</li>
<li><strong>Aprende Git:</strong> es el idioma común de toda contribución.</li>
<li><strong>Elige un proyecto pequeño que uses</strong> y lee su guía de contribución.</li>
</ol>

<div class="warn">
⚠️ <strong>Ética y legalidad:</strong> Linux incluye herramientas muy poderosas (redes, seguridad, administración). Úsalas solo en equipos y redes que sean tuyos o con autorización expresa. Aprender es libre; atacar sistemas ajenos, no.
</div>
`,
      quiz('¿Cuál de estas es una forma válida de contribuir al software libre sin escribir código?',
        ['Ninguna: solo se contribuye programando', 'Traducir, documentar, reportar errores o ayudar a otros usuarios', 'Copiar el software y venderlo como propio', 'Cambiar la licencia sin permiso'], 1)),

    text('Línea de tiempo completa y examen final',
      'Repasa la historia entera de un vistazo y demuestra lo que aprendiste.',
      `
<h2>Línea de tiempo</h2>
<table>
<tr><th>Año</th><th>Hecho</th></tr>
<tr><td>1955</td><td>SHARE: usuarios de IBM comparten software.</td></tr>
<tr><td>1961–64</td><td>CTSS (tiempo compartido) y arranque del proyecto Multics.</td></tr>
<tr><td>1969</td><td>Thompson y Ritchie empiezan Unix en Bell Labs. IBM comienza a cobrar el software por separado.</td></tr>
<tr><td>1972–73</td><td>Nace el lenguaje C; Unix se reescribe en C; aparecen los pipes.</td></tr>
<tr><td>1977–83</td><td>BSD en Berkeley; TCP/IP en 4.2BSD.</td></tr>
<tr><td>1983</td><td>Stallman anuncia el proyecto GNU (27 de septiembre).</td></tr>
<tr><td>1984</td><td>AT&T se divide y puede vender Unix.</td></tr>
<tr><td>1985</td><td>Se funda la Free Software Foundation.</td></tr>
<tr><td>1987</td><td>Minix (Tanenbaum) y GCC.</td></tr>
<tr><td>1989–91</td><td>Bash, GPL v1 y v2.</td></tr>
<tr><td>1991</td><td><strong>Linus Torvalds anuncia Linux (25 de agosto).</strong></td></tr>
<tr><td>1992</td><td>Debate Tanenbaum–Torvalds; Linux pasa a la GPL; demanda USL vs. BSDi.</td></tr>
<tr><td>1993</td><td>Nacen Debian y Slackware.</td></tr>
<tr><td>1994–95</td><td>Linux 1.0; Red Hat.</td></tr>
<tr><td>1998</td><td>Netscape abre su código; nace el término "código abierto" y la OSI.</td></tr>
<tr><td>1999–2003</td><td>Red Hat sale a bolsa; IBM invierte en Linux; demanda de SCO.</td></tr>
<tr><td>2004</td><td>Ubuntu.</td></tr>
<tr><td>2005</td><td>Torvalds crea Git.</td></tr>
<tr><td>2007</td><td>Linux Foundation; GPL v3.</td></tr>
<tr><td>2008</td><td>Primer teléfono Android.</td></tr>
<tr><td>2016–19</td><td>WSL de Microsoft; IBM compra Red Hat.</td></tr>
<tr><td>2017</td><td>El 100% del TOP500 corre Linux.</td></tr>
<tr><td>2021–22</td><td>Linux cumple 30 años; Ingenuity vuela en Marte; Rust llega al kernel.</td></tr>
</table>

<h2>Lo que te llevas</h2>
<ul>
<li>Linux no es una obra aislada: se apoya en <strong>Unix</strong> (ideas), <strong>GNU</strong> (herramientas y licencia) y una <strong>comunidad</strong> (código).</li>
<li>Su éxito se explica tanto por lo técnico como por lo humano: una licencia que protege la libertad y una forma abierta de colaborar.</li>
<li>La historia sigue: <strong>tú</strong> puedes ser parte.</li>
</ul>

<div class="tip">
💡 <strong>Siguiente paso recomendado:</strong> el curso <em>Consola de Comandos: Primeros Pasos</em> y después <em>Bash desde Cero</em> — allí empieza la parte práctica. Y si quieres llevar Linux en tu teléfono, el curso de <em>Termux</em>.
</div>
`,
      quiz('¿Quién anunció el proyecto GNU en 1983 con la meta de crear un sistema operativo libre tipo Unix?',
        ['Linus Torvalds', 'Richard Stallman', 'Andrew Tanenbaum', 'Bill Gates'], 1)),
  ],
}
