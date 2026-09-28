// Curso "Termux: Linux en tu bolsillo". Solo texto + consolas + quizzes.
import { cp, quiz, text } from './helpers.mjs'

export const termux = {
  id: 'course-termux',
  title: 'Termux: Linux en tu Bolsillo',
  description: 'Convierte tu teléfono Android en una terminal Linux de verdad, sin root: instala Termux bien, aprende pkg, scripts, Python, Git, SSH, la API del teléfono, automatizaciones y hasta una distro Debian completa con proot-distro. Con consolas interactivas para practicar cada paso.',
  ai_instructions: 'Eres el Mago, profesor de la Academia de Linux de Oliver Academy, guiando el curso "Termux: Linux en tu Bolsillo". Explica con paciencia y sin asumir experiencia previa en terminal; recuerda siempre que Termux NO requiere root, que hay que instalarlo desde F-Droid o GitHub (no de versiones antiguas de tiendas) y que las herramientas de red o seguridad solo se usan en dispositivos y redes propios o con autorización expresa. Si el alumno tiene un error concreto de su teléfono, pídele el mensaje exacto y la versión de Android antes de suponer la causa.',
  icon: '📱',
  color: '#22c55e',
  category: 'Linux',
  subcategory: 'Linux en Móvil',
  difficulty: 'principiante',
  locked: false,
  modules: [
    text('Bienvenida: qué es Termux y qué puedes hacer con él',
      'Una terminal Linux completa en tu Android, sin root ni computadora.',
      `
<h2>Una terminal de verdad en tu bolsillo</h2>
<p><strong>Termux</strong> es una aplicación para Android que te da una <strong>terminal</strong> y un <strong>entorno Linux</strong> con miles de programas instalables: Python, Git, editores, servidores, herramientas de red… Todo dentro de tu teléfono, <strong>sin necesidad de root</strong> (no tienes que "desbloquear" ni modificar el sistema de tu teléfono). Es software libre, creado por Fredrik Fornwall y mantenido por una comunidad abierta.</p>

<h2>¿Por qué funciona?</h2>
<p>Recuerda el curso de <em>Historia de Linux</em>: Android está construido sobre el <strong>kernel Linux</strong>. Termux aprovecha eso: como Android ya es Linux "por debajo", puede correr programas de Linux normales, compilados para tu teléfono, dentro de su propia carpeta protegida (tu aplicación no puede tocar lo demás del sistema).</p>

<h2>¿Qué NO es Termux?</h2>
<table>
<tr><th>Mito</th><th>Realidad</th></tr>
<tr><td>"Es una herramienta para hackear"</td><td>Es una terminal. Incluye herramientas de todo tipo (desarrollo, redes, seguridad); lo que hagas con ellas es tu responsabilidad y solo es legal en sistemas propios o con permiso.</td></tr>
<tr><td>"Necesita root"</td><td>No. Funciona con un teléfono normal.</td></tr>
<tr><td>"Es un emulador de Linux"</td><td>No emula nada: los programas corren de forma nativa en el procesador de tu teléfono.</td></tr>
<tr><td>"Es Ubuntu/Debian"</td><td>No exactamente. Es su propio entorno (usa la biblioteca de Android). Puedes instalar una distro completa dentro con <code>proot-distro</code>, como verás al final.</td></tr>
</table>

<h2>Lo que vas a poder hacer al terminar</h2>
<ul>
<li>Usar los comandos de Linux desde tu teléfono.</li>
<li>Escribir y ejecutar <strong>scripts</strong> y programas en <strong>Python</strong>.</li>
<li>Usar <strong>Git</strong> y conectarte por <strong>SSH</strong> a servidores (o convertir tu teléfono en uno).</li>
<li>Controlar funciones del teléfono (batería, notificaciones, portapapeles, voz…) con <strong>Termux:API</strong>.</li>
<li>Automatizar tareas y acceder rápido con <strong>widgets</strong>.</li>
<li>Instalar <strong>Debian o Ubuntu</strong> completo con <code>proot-distro</code>.</li>
</ul>

<div class="tip">
💡 Este curso es perfecto para complementar <em>Consola de Comandos: Primeros Pasos</em> y <em>Bash desde Cero</em>: lo aprendido allí funciona igual aquí.
</div>
`,
      quiz('¿Por qué Termux puede correr programas de Linux en un teléfono Android?',
        ['Porque instala Windows por debajo', 'Porque Android está construido sobre el kernel Linux', 'Porque necesita root obligatoriamente', 'Porque emula un procesador de PC'], 1)),

    text('Instalar Termux bien (y evitar el error más común)',
      'De dónde bajarlo, qué complementos existen y por qué importa que sean de la misma fuente.',
      `
<h2>Dónde instalarlo</h2>
<p>El proyecto Termux recomienda instalarlo desde <strong>F-Droid</strong> (una tienda de aplicaciones libres) o desde las <strong>versiones oficiales en GitHub</strong> (<code>github.com/termux/termux-app</code>). Durante años, la versión de Google Play estuvo sin mantenimiento y tenía repositorios de paquetes obsoletos, lo que causaba errores como "no se pueden instalar paquetes". Por eso la recomendación general sigue siendo F-Droid o GitHub.</p>

<div class="warn">
⚠️ <strong>El error más común:</strong> mezclar fuentes. Termux y sus complementos (Termux:API, Termux:Boot, Termux:Widget…) deben venir <strong>de la misma fuente</strong> (todos F-Droid, o todos GitHub). Si mezclas, Android los ve firmados por autores distintos y los complementos no funcionan.
</div>

<h2>Las aplicaciones de la familia</h2>
<table>
<tr><th>App</th><th>Para qué sirve</th></tr>
<tr><td><strong>Termux</strong></td><td>La terminal principal (obligatoria).</td></tr>
<tr><td>Termux:API</td><td>Permite que tus comandos usen funciones del teléfono (batería, notificaciones, sensores…).</td></tr>
<tr><td>Termux:Widget</td><td>Widgets en la pantalla de inicio para ejecutar tus scripts con un toque.</td></tr>
<tr><td>Termux:Boot</td><td>Ejecuta scripts cuando el teléfono se enciende.</td></tr>
<tr><td>Termux:Styling</td><td>Colores y fuentes.</td></tr>
</table>

<h2>Requisitos y consejos</h2>
<ul>
<li>Necesitas una versión de Android razonablemente reciente (en general, Android 7 o superior para las versiones actuales); revisa la página del proyecto para tu caso.</li>
<li>Con unos <strong>500 MB libres</strong> tienes para empezar; los paquetes ocupan espacio.</li>
<li>La primera vez que abras Termux, espera a que termine de configurarse antes de escribir.</li>
<li>Si el teléfono tiene "optimización de batería" agresiva (Xiaomi, Huawei, Samsung…), desactívala para Termux si vas a dejar procesos corriendo.</li>
</ul>

<div class="example">
<strong>Regla de oro para este curso:</strong> instala <em>solo</em> Termux al principio. Los complementos los instalarás más adelante, cuando los necesites, y siempre de la misma fuente.
</div>
`,
      quiz('¿Por qué es importante instalar Termux y sus complementos de la misma fuente?',
        ['Por estética', 'Porque si mezclas fuentes las firmas de las apps no coinciden y los complementos no funcionan', 'Porque F-Droid es más rápido', 'Porque Termux:API es de pago'], 1)),

    text('Primer arranque: tu casa dentro de Termux',
      'El prompt, la carpeta HOME, actualizar los paquetes y entender que Android no es una distro de PC.',
      `
<h2>Actualiza antes de hacer cualquier cosa</h2>
<p>Al abrir Termux verás un símbolo <code>$</code>: es el <strong>prompt</strong>, donde escribes comandos. Lo primero que se hace siempre:</p>
<pre><code>pkg update && pkg upgrade</code></pre>
<p><code>pkg update</code> descarga la lista más reciente de paquetes disponibles y <code>pkg upgrade</code> actualiza los que ya tienes. El <code>&amp;&amp;</code> significa "y si eso salió bien, entonces ejecuta lo siguiente". Si te pregunta algo (Y/n), responde <code>y</code>. Si tarda o falla, prueba con <code>termux-change-repo</code> para elegir un espejo (servidor) más cercano.</p>

<h2>Dónde estás parado</h2>
<table>
<tr><th>Comando</th><th>Qué te dice</th></tr>
<tr><td><code>pwd</code></td><td>Tu carpeta actual (al inicio: tu HOME, <code>/data/data/com.termux/files/home</code>).</td></tr>
<tr><td><code>echo $PREFIX</code></td><td>Dónde están instalados los programas de Termux (<code>/data/data/com.termux/files/usr</code>).</td></tr>
<tr><td><code>uname -o</code></td><td>El sistema operativo: dirá <strong>Android</strong>.</td></tr>
<tr><td><code>whoami</code></td><td>Tu usuario (algo como <code>u0_a215</code>: un usuario de Android, no "root").</td></tr>
</table>

<h2>Una diferencia importante con Linux de PC</h2>
<p>En un Linux normal existen rutas como <code>/bin</code>, <code>/usr</code> o <code>/etc</code>. En Termux <strong>todo vive dentro de su propia carpeta</strong>, y esas rutas están bajo <code>$PREFIX</code> (por ejemplo, <code>$PREFIX/bin</code> y <code>$PREFIX/etc</code>). Por eso, cuando siguas tutoriales de Linux para PC, a veces tendrás que traducir la ruta. Es normal: Android no es una distro de escritorio.</p>

<div class="tip">
💡 Los comandos que aprendiste en el curso de Bash (<code>ls</code>, <code>cd</code>, <code>cat</code>, <code>grep</code>, pipes…) funcionan exactamente igual aquí.
</div>
`,
      quiz('¿Para qué sirve $PREFIX en Termux?',
        ['Guarda tu contraseña', 'Indica dónde están instalados los programas y archivos de sistema de Termux (equivale a "/usr")', 'Es el nombre de tu teléfono', 'Es un comando para reiniciar'], 1),
      {
        title: 'Simulador: tu primer arranque en Termux',
        intro: 'Acabas de abrir Termux por primera vez. Vas a actualizarlo y a explorar dónde estás.',
        checkpoints: [
          cp('Actualiza la lista de paquetes y los paquetes instalados con: pkg update && pkg upgrade', 'pkg update && pkg upgrade',
            String.raw`^pkg\s+(update|upgrade)(\s+-y)?(\s*&&\s*pkg\s+(update|upgrade)(\s+-y)?)?\s*$`, 'Usa: pkg update && pkg upgrade',
            'Todo actualizado: siempre haz esto antes de instalar nada nuevo.', 'Reading package lists... Done\nAll packages are up to date.'),
          cp('Pregunta en qué sistema operativo estás con uname -o.', 'uname -o', String.raw`^uname\s+-o\s*$`, 'Usa: uname -o', 'Android: el kernel es Linux, pero el sistema es Android.', 'Android'),
          cp('Descubre en qué carpeta estás con pwd.', 'pwd', String.raw`^pwd\s*$`, 'Usa: pwd', 'Esa es tu carpeta personal (HOME) dentro de Termux.', '/data/data/com.termux/files/home'),
          cp('Descubre dónde se instalan los programas: echo $PREFIX', 'echo $PREFIX', String.raw`^echo\s+["']?\$\{?PREFIX\}?["']?\s*$`, 'Usa: echo $PREFIX', 'Ahí vive todo lo que instalas con pkg.', '/data/data/com.termux/files/usr'),
        ],
      }),

    text('Moverte cómodo: teclas extra, gestos y sesiones',
      'La terminal en una pantalla táctil tiene trucos que hacen la diferencia.',
      `
<h2>La fila de teclas extra</h2>
<p>Debajo del teclado de tu teléfono, Termux muestra una fila con teclas que en un teclado táctil no existen: <code>ESC</code>, <code>TAB</code>, <code>CTRL</code>, <code>ALT</code>, flechas, <code>-</code> y <code>/</code>. Se usan tocándolas: por ejemplo, <code>CTRL</code> y luego <code>C</code> cancela un comando.</p>

<h2>Combinaciones con las teclas de volumen</h2>
<table>
<tr><th>Combinación</th><th>Equivale a</th></tr>
<tr><td>Volumen abajo + una tecla</td><td>CTRL + esa tecla (por ejemplo Volumen abajo + C = CTRL+C)</td></tr>
<tr><td>Volumen arriba + W / A / S / D</td><td>Flechas arriba / izquierda / abajo / derecha</td></tr>
<tr><td>Volumen arriba + Q</td><td>Mostrar u ocultar la fila de teclas extra</td></tr>
</table>

<h2>Gestos y menús</h2>
<ul>
<li><strong>Deslizar desde el borde izquierdo:</strong> abre el panel de <em>sesiones</em>: puedes tener varias terminales abiertas a la vez y cambiar entre ellas.</li>
<li><strong>Mantener presionada la pantalla:</strong> menú para copiar, pegar y otras opciones.</li>
<li><strong>Pellizcar con dos dedos:</strong> cambia el tamaño de la letra.</li>
</ul>

<h2>Atajos de terminal que valen oro</h2>
<table>
<tr><th>Atajo</th><th>Qué hace</th></tr>
<tr><td>TAB</td><td>Autocompleta nombres de archivos y comandos. ¡Úsalo siempre!</td></tr>
<tr><td>Flecha arriba</td><td>Recupera el comando anterior.</td></tr>
<tr><td>CTRL + C</td><td>Cancela lo que se esté ejecutando.</td></tr>
<tr><td>CTRL + L (o <code>clear</code>)</td><td>Limpia la pantalla.</td></tr>
<tr><td>CTRL + D</td><td>Cierra la sesión actual.</td></tr>
</table>

<div class="tip">
💡 Un teclado físico Bluetooth (o un teclado de PC conectado por OTG) convierte tu teléfono en una mini laptop para programar. Muchas personas usan Termux así.
</div>
`,
      quiz('¿Qué combinación equivale a CTRL+C (cancelar un comando) en el teclado táctil?',
        ['Volumen arriba + C', 'Volumen abajo + C', 'Mantener presionado ESC', 'Deslizar desde la izquierda'], 1)),

    text('Instalar programas con pkg',
      'El gestor de paquetes de Termux: buscar, instalar, actualizar y quitar.',
      `
<h2>Un gestor de paquetes, como en Linux de PC</h2>
<p>En Termux no descargas instaladores: usas el gestor de paquetes <code>pkg</code>. Por debajo usa <strong>apt</strong> (el mismo de Debian y Ubuntu), pero con una capa más sencilla.</p>

<table>
<tr><th>Comando</th><th>Qué hace</th></tr>
<tr><td><code>pkg search palabra</code></td><td>Busca paquetes.</td></tr>
<tr><td><code>pkg install nombre</code></td><td>Instala uno (o varios separados por espacio).</td></tr>
<tr><td><code>pkg list-installed</code></td><td>Lista lo instalado.</td></tr>
<tr><td><code>pkg upgrade</code></td><td>Actualiza todo.</td></tr>
<tr><td><code>pkg uninstall nombre</code></td><td>Desinstala.</td></tr>
<tr><td><code>pkg show nombre</code></td><td>Muestra información de un paquete.</td></tr>
</table>

<h2>Un kit inicial recomendado</h2>
<table>
<tr><th>Paquete</th><th>Para qué</th></tr>
<tr><td><code>nano</code></td><td>Editor de texto fácil.</td></tr>
<tr><td><code>vim</code></td><td>Editor potente (curva de aprendizaje mayor).</td></tr>
<tr><td><code>git</code></td><td>Control de versiones.</td></tr>
<tr><td><code>python</code></td><td>El lenguaje Python.</td></tr>
<tr><td><code>curl</code>, <code>wget</code></td><td>Descargar cosas de internet.</td></tr>
<tr><td><code>openssh</code></td><td>Conexiones SSH.</td></tr>
<tr><td><code>htop</code></td><td>Ver qué procesos usan recursos.</td></tr>
<tr><td><code>tmux</code></td><td>Varias terminales en una pantalla, y sesiones que sobreviven.</td></tr>
<tr><td><code>neofetch</code> / <code>fastfetch</code></td><td>Resumen bonito del sistema.</td></tr>
</table>

<div class="warn">
⚠️ Instala solo desde los repositorios oficiales de Termux con <code>pkg</code>. Si un tutorial te pide pegar un comando que descarga y ejecuta un script desconocido, <strong>desconfía</strong>: tendría acceso a todo lo que Termux puede ver.
</div>
`,
      quiz('¿Qué comando instala Git en Termux?',
        ['install git', 'pkg install git', 'termux git', 'sudo git'], 1),
      {
        title: 'Simulador: instala tu kit de herramientas',
        intro: 'Vas a buscar, instalar y comprobar programas con pkg.',
        checkpoints: [
          cp('Busca paquetes relacionados con python usando pkg search.', 'pkg search python', String.raw`^pkg\s+search\s+python\s*$`, 'Usa: pkg search python',
            'Así se descubren paquetes sin salir de la terminal.', 'python/stable 3.12.x aarch64\n  Python 3 programming language intended to enable clear programs\npython-pip/stable 24.x all\n  The PyPA recommended tool for installing Python packages'),
          cp('Instala nano y git en un solo comando: pkg install nano git', 'pkg install nano git', String.raw`^pkg\s+install\s+(-y\s+)?(nano\s+git|git\s+nano)\s*$`, 'Usa: pkg install nano git',
            'Dos paquetes con un solo comando.', 'Setting up nano ...\nSetting up git ...'),
          cp('Comprueba que git quedó instalado con git --version.', 'git --version', String.raw`^git\s+--version\s*$`, 'Usa: git --version', 'Listo: Git funciona en tu teléfono.', 'git version 2.4x.x'),
          cp('Ahora lista lo instalado y filtra por "nano" usando un pipe: pkg list-installed | grep nano', 'pkg list-installed | grep nano',
            String.raw`^pkg\s+list-installed\s*\|\s*grep\s+["']?nano["']?\s*$`, 'Usa: pkg list-installed | grep nano', 'Combinaste dos programas con un pipe, como en la filosofía Unix.', 'nano/stable,now 8.x aarch64 [installed]'),
        ],
      }),

    text('Acceso a tus archivos y almacenamiento del teléfono',
      'Cómo Termux ve tus descargas, fotos y documentos.',
      `
<h2>Termux vive en una "jaula"</h2>
<p>Por seguridad, Android aísla cada app: Termux no puede ver tus fotos, descargas o documentos a menos que se lo permitas. Para eso existe el comando:</p>
<pre><code>termux-setup-storage</code></pre>
<p>Te aparecerá una ventana de Android pidiendo permiso de almacenamiento. Acepta, y Termux creará la carpeta <code>~/storage</code> con accesos directos (enlaces) a las carpetas del teléfono.</p>

<table>
<tr><th>Ruta</th><th>Apunta a</th></tr>
<tr><td><code>~/storage/shared</code></td><td>Todo el almacenamiento compartido del teléfono</td></tr>
<tr><td><code>~/storage/downloads</code></td><td>La carpeta Descargas</td></tr>
<tr><td><code>~/storage/dcim</code></td><td>Fotos de la cámara</td></tr>
<tr><td><code>~/storage/pictures</code></td><td>Imágenes</td></tr>
<tr><td><code>~/storage/music</code>, <code>~/storage/movies</code></td><td>Música y videos</td></tr>
</table>

<h2>Dos mundos de archivos</h2>
<ul>
<li><strong>Dentro de Termux</strong> (tu HOME): rápido, con permisos de Linux (puedes usar <code>chmod</code>), pero <em>otras apps no lo ven</em>.</li>
<li><strong>Almacenamiento compartido</strong> (<code>~/storage/...</code>): lo ven otras apps (galería, gestor de archivos), pero tiene limitaciones (por ejemplo, no puedes marcar archivos como ejecutables allí).</li>
</ul>
<p>Por eso el patrón habitual es: trabajar dentro de tu HOME y <strong>copiar</strong> a <code>~/storage</code> lo que quieras compartir o respaldar.</p>

<div class="example">
<strong>Ejemplo real:</strong> cuando descargas un archivo desde el navegador queda en Descargas. Con <code>cp ~/storage/downloads/archivo.zip ~</code> lo copias a tu HOME para trabajar con él, y con <code>cp resultado.txt ~/storage/downloads/</code> lo devuelves para que lo vea el resto de tu teléfono.
</div>
`,
      quiz('¿Para qué sirve el comando termux-setup-storage?',
        ['Para borrar archivos del teléfono', 'Para dar permiso a Termux de ver el almacenamiento compartido y crear accesos directos en ~/storage', 'Para formatear la memoria', 'Para instalar más espacio'], 1),
      {
        title: 'Simulador: accede a tus descargas',
        intro: 'Vas a dar permiso de almacenamiento y a trabajar con un archivo que descargaste desde el navegador.',
        checkpoints: [
          cp('Da permiso de almacenamiento a Termux.', 'termux-setup-storage', String.raw`^termux-setup-storage\s*$`, 'Usa: termux-setup-storage',
            'Android te habría pedido permiso; ahora existe la carpeta ~/storage.'),
          cp('Lista los accesos directos creados en ~/storage.', 'ls ~/storage', String.raw`^ls\s+(~|\$HOME)/storage/?\s*$`, 'Usa: ls ~/storage', 'Estos son los puentes hacia el resto de tu teléfono.',
            'dcim  downloads  movies  music  pictures  shared'),
          cp('Copia el archivo notas.txt de Descargas a tu carpeta personal (~).', 'cp ~/storage/downloads/notas.txt ~', String.raw`^cp\s+(~|\$HOME)/storage/downloads/notas\.txt\s+(~|\$HOME|\./?)/?\s*$`,
            'Usa: cp ~/storage/downloads/notas.txt ~', 'Copiado. Ahora puedes trabajar con el archivo dentro de Termux.'),
          cp('Confirma que llegó: ls ~', 'ls ~', String.raw`^ls\s+(~|\$HOME)/?\s*$`, 'Usa: ls ~', 'Ahí está tu archivo en tu carpeta personal.', 'notas.txt  storage'),
        ],
      }),

    text('Editar y ejecutar tus primeros scripts',
      'nano, permisos de ejecución y un script que hace algo útil.',
      `
<h2>Un editor en la terminal: nano</h2>
<p>Instálalo con <code>pkg install nano</code> y ábrelo con <code>nano archivo.txt</code>. En la parte inferior verás los atajos (el símbolo <code>^</code> significa CTRL): <code>CTRL+O</code> guarda, <code>CTRL+X</code> sale. Para escribir texto sin editor, también puedes usar redirección:</p>
<pre><code>echo "hola" &gt; saludo.txt      # crea (o sobrescribe) el archivo
echo "otra línea" &gt;&gt; saludo.txt  # agrega al final</code></pre>

<h2>Tu primer script</h2>
<p>Un <strong>script</strong> es un archivo de texto con comandos que se ejecutan en orden. Ejemplo (archivo <code>hola.sh</code>):</p>
<pre><code>#!/data/data/com.termux/files/usr/bin/bash
echo "Hola desde Termux"
date</code></pre>
<p>La primera línea (<em>shebang</em>) le dice al sistema qué programa debe interpretarlo. En Termux la ruta de bash es distinta a la de Linux de PC (<code>/bin/bash</code>), pero Termux incluye el comando <code>termux-fix-shebang archivo.sh</code> para corregir scripts descargados de otros lados.</p>

<h2>Permiso de ejecución</h2>
<p>Un archivo nuevo no se puede ejecutar todavía. Hay que dárselo:</p>
<pre><code>chmod +x hola.sh
./hola.sh</code></pre>
<p>El <code>./</code> significa "el archivo de esta carpeta". Si prefieres no cambiar permisos, también funciona <code>bash hola.sh</code>.</p>

<div class="tip">
💡 Tus scripts deben vivir en tu HOME, no en <code>~/storage</code>: el almacenamiento compartido no admite permisos de ejecución.
</div>
`,
      quiz('¿Qué hace chmod +x hola.sh?',
        ['Borra el archivo', 'Le da permiso de ejecución al archivo', 'Lo copia a la nube', 'Lo abre en el editor'], 1),
      {
        title: 'Simulador: crea y ejecuta un script',
        intro: 'Vas a crear un script sin editor (con echo y redirección), darle permisos y ejecutarlo.',
        checkpoints: [
          cp('Crea el archivo hola.sh con un comando echo dentro: echo \'echo "Hola desde Termux"\' > hola.sh', 'echo \'echo "Hola desde Termux"\' > hola.sh',
            String.raw`^echo\s+.+>\s*hola\.sh\s*$`, 'Usa: echo \'echo "Hola desde Termux"\' > hola.sh (el > manda el texto al archivo)', 'Archivo creado. El símbolo > redirige la salida de echo hacia hola.sh.'),
          cp('Dale permiso de ejecución.', 'chmod +x hola.sh', String.raw`^chmod\s+(\+x|755|u\+x)\s+hola\.sh\s*$`, 'Usa: chmod +x hola.sh', 'Ahora el archivo es ejecutable.'),
          cp('Ejecútalo con ./hola.sh', './hola.sh', String.raw`^(\./hola\.sh|bash\s+hola\.sh)\s*$`, 'Usa: ./hola.sh', 'Tu primer script en el teléfono.', 'Hola desde Termux'),
        ],
      }),

    text('Python y programación desde el teléfono',
      'Instala Python, corre programas, usa pip y sirve archivos por la red local.',
      `
<h2>Python en un comando</h2>
<pre><code>pkg install python
python --version
python hola.py</code></pre>
<p>Con Python ya puedes seguir cualquier curso de programación desde tu teléfono. Crea un archivo, por ejemplo con <code>nano hola.py</code>, y escribe <code>print("Hola, mundo")</code>.</p>

<h2>Instalar librerías con pip</h2>
<pre><code>pip install requests</code></pre>
<p>Funciona para librerías "puras" de Python. Las que tienen partes compiladas (por ejemplo <em>numpy</em>, <em>pandas</em>) a veces fallan al instalarse con pip en Android; para esas, Termux suele tener paquetes ya compilados: <code>pkg install python-numpy</code>. Antes de pelear con un error de compilación, busca con <code>pkg search</code> si ya existe.</p>

<h2>Otros lenguajes</h2>
<table>
<tr><th>Lenguaje</th><th>Instalación</th></tr>
<tr><td>Node.js (JavaScript)</td><td><code>pkg install nodejs</code></td></tr>
<tr><td>C / C++</td><td><code>pkg install clang</code></td></tr>
<tr><td>Rust</td><td><code>pkg install rust</code></td></tr>
<tr><td>Go</td><td><code>pkg install golang</code></td></tr>
<tr><td>PHP, Ruby, Lua…</td><td><code>pkg install php</code> / <code>ruby</code> / <code>lua54</code></td></tr>
</table>

<h2>Un servidor web en un comando</h2>
<p>Python trae un servidor web de una línea. Desde una carpeta cualquiera:</p>
<pre><code>python -m http.server 8080</code></pre>
<p>Ahora esa carpeta se puede ver desde el navegador del teléfono en <code>http://localhost:8080</code>, y desde otro dispositivo de tu misma red Wi-Fi usando la IP del teléfono. Para detenerlo: <code>CTRL+C</code>.</p>

<div class="warn">
⚠️ Ese servidor comparte <strong>todo lo que haya en la carpeta</strong>, con cualquiera de la red. Úsalo en tu Wi-Fi de casa, con una carpeta que solo contenga lo que quieras compartir, y no en redes públicas.
</div>
`,
      quiz('¿Qué hace "python -m http.server 8080"?',
        ['Instala Python', 'Levanta un servidor web sencillo que comparte la carpeta actual en el puerto 8080', 'Borra la carpeta', 'Sube el código a GitHub'], 1),
      {
        title: 'Simulador: Python y tu servidor web',
        intro: 'Vas a instalar Python, ejecutar una línea y compartir una carpeta por la red.',
        checkpoints: [
          cp('Instala Python con pkg.', 'pkg install python', String.raw`^pkg\s+install\s+(-y\s+)?python\s*$`, 'Usa: pkg install python', 'Python instalado.', 'Setting up python ...'),
          cp('Ejecuta una línea de Python: python -c "print(2+2)"', 'python -c "print(2+2)"', String.raw`^python3?\s+-c\s+["']print\(\s*2\s*\+\s*2\s*\)["']\s*$`, 'Usa: python -c "print(2+2)"', 'Python respondió. Ya puedes programar desde tu teléfono.', '4'),
          cp('Comparte la carpeta actual por la red con: python -m http.server 8080', 'python -m http.server 8080', String.raw`^python3?\s+-m\s+http\.server(\s+8080)?\s*$`, 'Usa: python -m http.server 8080',
            'Servidor activo. Para pararlo, CTRL+C.', 'Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...'),
        ],
      }),

    text('Git, GitHub y llaves SSH desde el teléfono',
      'Clona, edita y sube código sin computadora.',
      `
<h2>Configurar Git</h2>
<pre><code>pkg install git
git config --global user.name "Tu Nombre"
git config --global user.email "tu@correo.com"</code></pre>
<p>Si quieres el curso completo, la escuela tiene <em>Git y GitHub: de Cero a Experto</em>; todo lo que allí aprendes funciona en Termux.</p>

<h2>Llaves SSH: entrar sin contraseña</h2>
<p>En vez de escribir tu contraseña (o un token) cada vez que subes código a GitHub, puedes usar un <strong>par de llaves SSH</strong>: una <em>privada</em> (que jamás compartes) y una <em>pública</em> (que sí entregas).</p>
<pre><code>pkg install openssh
ssh-keygen -t ed25519 -C "tu@correo.com"
cat ~/.ssh/id_ed25519.pub</code></pre>
<p>Copia lo que muestre el último comando y pégalo en GitHub: <em>Settings → SSH and GPG keys → New SSH key</em>. Luego prueba con <code>ssh -T git@github.com</code>, y clona repositorios con la URL de tipo <code>git@github.com:usuario/repo.git</code>.</p>

<div class="warn">
⚠️ <strong>La llave privada</strong> (<code>id_ed25519</code>, sin <code>.pub</code>) es como tu contraseña: nunca la pegues en chats, foros, ni la subas a un repositorio. La pública (<code>.pub</code>) sí puede compartirse.
</div>

<h2>Flujo típico desde el teléfono</h2>
<ol>
<li><code>git clone git@github.com:usuario/repo.git</code></li>
<li>Editar con <code>nano</code> o <code>vim</code>.</li>
<li><code>git add . &amp;&amp; git commit -m "mensaje"</code></li>
<li><code>git push</code></li>
</ol>
`,
      quiz('¿Cuál de estas llaves SSH nunca debes compartir?',
        ['La pública (.pub)', 'La privada (sin .pub)', 'Ambas se pueden compartir', 'Ninguna existe en Termux'], 1),
      {
        title: 'Simulador: configura Git y crea tu llave SSH',
        intro: 'Vas a presentarte ante Git y generar tu par de llaves.',
        checkpoints: [
          cp('Configura tu nombre en Git: git config --global user.name "Ada Torres"', 'git config --global user.name "Ada Torres"',
            String.raw`^git\s+config\s+--global\s+user\.name\s+.+$`, 'Usa: git config --global user.name "Ada Torres"', 'Git ya sabe quién eres.'),
          cp('Genera una llave SSH moderna con: ssh-keygen -t ed25519', 'ssh-keygen -t ed25519', String.raw`^ssh-keygen\s+-t\s+ed25519(\s+-C\s+.+)?\s*$`, 'Usa: ssh-keygen -t ed25519',
            'Se creó el par de llaves en ~/.ssh: id_ed25519 (privada) e id_ed25519.pub (pública).', 'Generating public/private ed25519 key pair.\nYour public key has been saved in /data/data/com.termux/files/home/.ssh/id_ed25519.pub'),
          cp('Muestra tu llave pública (la que sí se comparte): cat ~/.ssh/id_ed25519.pub', 'cat ~/.ssh/id_ed25519.pub', String.raw`^cat\s+(~|\$HOME)/\.ssh/id_ed25519\.pub\s*$`,
            'Usa: cat ~/.ssh/id_ed25519.pub', 'Esta línea es la que pegas en GitHub. Nunca muestres la privada.', 'ssh-ed25519 AAAAC3Nz...ejemplo... ada@ejemplo.com'),
        ],
      }),

    text('SSH: conecta tu teléfono con tu computadora (y al revés)',
      'Usar servidores remotos desde el teléfono, o controlar el teléfono desde tu PC.',
      `
<h2>SSH: la puerta segura de la terminal</h2>
<p><strong>SSH</strong> (Secure Shell) te permite abrir una terminal en <em>otra</em> máquina por la red, con la conexión cifrada. Es la herramienta diaria de quien administra servidores. Con Termux puedes hacer las dos direcciones.</p>

<h2>Dirección 1: tu teléfono como cliente</h2>
<pre><code>ssh usuario@direccion-del-servidor</code></pre>
<p>Así administras un servidor (o una Raspberry Pi) desde cualquier lugar, sin computadora.</p>

<h2>Dirección 2: tu teléfono como servidor</h2>
<p>También puedes controlar el teléfono desde tu PC (¡sin cables!):</p>
<ol>
<li>En Termux: <code>pkg install openssh</code></li>
<li>Crea una contraseña: <code>passwd</code></li>
<li>Descubre tu usuario: <code>whoami</code> (algo como <code>u0_a215</code>).</li>
<li>Arranca el servidor: <code>sshd</code></li>
<li>Descubre la IP del teléfono en tu Wi-Fi (por ejemplo con <code>ifconfig</code> del paquete <code>net-tools</code>, o desde los ajustes de Wi-Fi).</li>
<li>Desde la PC: <code>ssh -p 8022 u0_a215@192.168.1.50</code> (con tus datos).</li>
</ol>
<div class="warn">
⚠️ En Termux el servidor SSH escucha en el <strong>puerto 8022</strong>, no en el 22 (Android no permite a una app normal usar puertos bajos). Por eso se usa <code>-p 8022</code>.
</div>

<h2>Buenas prácticas</h2>
<ul>
<li>Usa una <strong>contraseña larga</strong> o, mejor, <strong>llaves SSH</strong> (clase anterior).</li>
<li>Activa <code>sshd</code> solo cuando lo necesites, en tu red de confianza, y ciérralo después (<code>pkill sshd</code>).</li>
<li>Nunca expongas tu teléfono a internet con SSH abierto sin saber lo que haces.</li>
<li>Solo te conectas a máquinas <strong>tuyas o con permiso</strong>.</li>
</ul>
`,
      quiz('¿En qué puerto escucha el servidor SSH de Termux?',
        ['22', '8022', '80', '443'], 1),
      {
        title: 'Simulador: convierte tu teléfono en servidor SSH',
        intro: 'Vas a preparar tu teléfono para recibir conexiones SSH desde tu computadora, dentro de tu red de casa.',
        checkpoints: [
          cp('Instala el servidor y cliente SSH: pkg install openssh', 'pkg install openssh', String.raw`^pkg\s+install\s+(-y\s+)?openssh\s*$`, 'Usa: pkg install openssh', 'OpenSSH listo.', 'Setting up openssh ...'),
          cp('Crea una contraseña para poder conectarte: passwd', 'passwd', String.raw`^passwd\s*$`, 'Usa: passwd', 'Te habría pedido escribir la nueva contraseña dos veces.', 'New password:\nRetype new password:\nNew password was successfully set.'),
          cp('Descubre tu nombre de usuario en Termux: whoami', 'whoami', String.raw`^whoami\s*$`, 'Usa: whoami', 'Ese es tu usuario (no es root): lo usarás para conectarte desde la PC.', 'u0_a215'),
          cp('Arranca el servidor SSH: sshd', 'sshd', String.raw`^sshd\s*$`, 'Usa: sshd', 'Servidor activo en el puerto 8022. Desde tu PC: ssh -p 8022 u0_a215@IP-DEL-TELEFONO. Para apagarlo: pkill sshd.'),
        ],
      }),

    text('Termux:API — controla el teléfono desde la terminal',
      'Batería, notificaciones, portapapeles, voz, linterna, ubicación…',
      `
<h2>Dos piezas que van juntas</h2>
<p>Para que tus comandos hablen con las funciones del teléfono necesitas <strong>las dos partes</strong>:</p>
<ol>
<li>La <strong>app</strong> Termux:API (de la misma fuente que Termux).</li>
<li>El <strong>paquete</strong> en Termux: <code>pkg install termux-api</code></li>
</ol>

<h2>Algunos comandos</h2>
<table>
<tr><th>Comando</th><th>Qué hace</th></tr>
<tr><td><code>termux-battery-status</code></td><td>Estado de la batería en formato JSON.</td></tr>
<tr><td><code>termux-toast "Hola"</code></td><td>Muestra un mensajito flotante.</td></tr>
<tr><td><code>termux-notification --title "Aviso" --content "Listo"</code></td><td>Crea una notificación.</td></tr>
<tr><td><code>termux-vibrate -d 300</code></td><td>Vibra 300 milisegundos.</td></tr>
<tr><td><code>termux-clipboard-get</code> / <code>-set</code></td><td>Lee o escribe el portapapeles.</td></tr>
<tr><td><code>termux-tts-speak "Hola"</code></td><td>El teléfono lee el texto en voz alta.</td></tr>
<tr><td><code>termux-torch on</code></td><td>Enciende la linterna.</td></tr>
<tr><td><code>termux-location</code></td><td>Tu ubicación (requiere permisos).</td></tr>
</table>

<div class="warn">
⚠️ Cada función sensible (ubicación, cámara, micrófono, contactos, SMS…) requiere que <strong>tú</strong> concedas el permiso a Termux:API en los ajustes de Android. Concede solo lo que vayas a usar, y recuerda que cualquier script que ejecutes podrá usar esos permisos.
</div>

<h2>Combinar con pipes y scripts</h2>
<p>La salida de <code>termux-battery-status</code> es JSON. Si instalas <code>jq</code> (<code>pkg install jq</code>) puedes extraer solo un dato:</p>
<pre><code>termux-battery-status | jq .percentage</code></pre>
<p>Y con eso puedes crear, por ejemplo, un script que te avise por notificación cuando la batería baje del 20%.</p>
`,
      quiz('¿Qué necesitas para usar comandos como termux-battery-status?',
        ['Solo el paquete termux-api', 'La app Termux:API y el paquete termux-api (más los permisos de Android correspondientes)', 'Root', 'Una cuenta de Google'], 1),
      {
        title: 'Simulador: habla con tu teléfono',
        intro: 'Ya tienes instalada la app Termux:API. Falta el paquete y probar algunos comandos.',
        checkpoints: [
          cp('Instala el paquete que conecta la terminal con la app: pkg install termux-api', 'pkg install termux-api', String.raw`^pkg\s+install\s+(-y\s+)?termux-api\s*$`, 'Usa: pkg install termux-api', 'Instalado.', 'Setting up termux-api ...'),
          cp('Consulta la batería: termux-battery-status', 'termux-battery-status', String.raw`^termux-battery-status\s*$`, 'Usa: termux-battery-status', 'JSON con el porcentaje, si está cargando y la temperatura.',
            '{\n  "percentage": 78,\n  "status": "DISCHARGING",\n  "plugged": "UNPLUGGED"\n}'),
          cp('Muestra un mensaje flotante: termux-toast "Hola desde la terminal"', 'termux-toast "Hola desde la terminal"', String.raw`^termux-toast\s+.+$`, 'Usa: termux-toast "Hola desde la terminal"', 'En tu teléfono habría aparecido el mensaje sobre la pantalla.'),
          cp('Haz que el teléfono hable: termux-tts-speak "Termux funciona"', 'termux-tts-speak "Termux funciona"', String.raw`^termux-tts-speak\s+.+$`, 'Usa: termux-tts-speak "Termux funciona"', 'Y tu teléfono lo habría dicho en voz alta.'),
        ],
      }),

    text('Automatiza: scripts, widgets, tareas y arranque',
      'Que tu teléfono haga cosas por ti sin que las pidas cada vez.',
      `
<h2>Termux:Widget — un toque y listo</h2>
<p>Con la app <strong>Termux:Widget</strong> puedes poner un widget en tu pantalla de inicio que lista los scripts de la carpeta <code>~/.shortcuts</code>. Un toque, y se ejecuta:</p>
<pre><code>mkdir -p ~/.shortcuts
echo 'termux-notification --title "Respaldo" --content "Hecho"' &gt; ~/.shortcuts/respaldo.sh
chmod +x ~/.shortcuts/respaldo.sh</code></pre>

<h2>Termux:Boot — al encender el teléfono</h2>
<p>Con <strong>Termux:Boot</strong> instalada (y abierta una vez), cualquier script en <code>~/.termux/boot/</code> se ejecuta cuando el teléfono arranca. Sirve para levantar servicios (por ejemplo, un <code>sshd</code> o un servidor propio).</p>

<h2>Tareas programadas</h2>
<ul>
<li><code>pkg install cronie</code> y <code>crond</code>: el clásico <strong>cron</strong> de Linux, para tareas repetidas.</li>
<li><code>termux-job-scheduler</code> (del paquete termux-api): usa el planificador de Android, más amigable con la batería.</li>
</ul>

<h2>Que Android no mate tus procesos</h2>
<p>Android es agresivo con la batería y puede cerrar procesos en segundo plano. Para tareas largas:</p>
<ul>
<li>Usa <code>termux-wake-lock</code> para que el teléfono no "duerma" Termux (y <code>termux-wake-unlock</code> al terminar).</li>
<li>Desactiva la optimización de batería para Termux en los ajustes de Android.</li>
<li>En versiones recientes de Android (12 en adelante), el sistema puede terminar procesos "fantasma" en segundo plano. Si te pasa, busca la documentación actual del proyecto para tu versión.</li>
<li>Usa <code>tmux</code> para no perder tu sesión si la app se cierra.</li>
</ul>

<div class="example">
<strong>Idea de proyecto:</strong> un script que cada mañana consulta el clima con <code>curl</code>, y te lo lee en voz alta con <code>termux-tts-speak</code>. Todo lo que necesitas ya lo viste en este curso.
</div>
`,
      quiz('¿Dónde se guardan los scripts que aparecen en el widget de Termux:Widget?',
        ['En ~/Downloads', 'En ~/.shortcuts', 'En /etc', 'En la tarjeta SD, obligatoriamente'], 1),
      {
        title: 'Simulador: crea tu primer atajo',
        intro: 'Vas a crear un script para el widget de inicio que te avisa con una notificación.',
        checkpoints: [
          cp('Crea la carpeta de atajos: mkdir -p ~/.shortcuts', 'mkdir -p ~/.shortcuts', String.raw`^mkdir\s+(-p\s+)?(~|\$HOME)/\.shortcuts/?\s*$`, 'Usa: mkdir -p ~/.shortcuts', 'Carpeta creada.'),
          cp('Crea el script: echo \'termux-toast "Atajo listo"\' > ~/.shortcuts/prueba.sh', 'echo \'termux-toast "Atajo listo"\' > ~/.shortcuts/prueba.sh',
            String.raw`^echo\s+.+>\s*(~|\$HOME)/\.shortcuts/prueba\.sh\s*$`, 'Usa: echo \'termux-toast "Atajo listo"\' > ~/.shortcuts/prueba.sh', 'Script creado dentro de la carpeta de atajos.'),
          cp('Dale permiso de ejecución: chmod +x ~/.shortcuts/prueba.sh', 'chmod +x ~/.shortcuts/prueba.sh', String.raw`^chmod\s+(\+x|755)\s+(~|\$HOME)/\.shortcuts/prueba\.sh\s*$`,
            'Usa: chmod +x ~/.shortcuts/prueba.sh', 'Listo. Al añadir el widget de Termux:Widget a tu pantalla de inicio, "prueba.sh" aparecería en la lista.'),
        ],
      }),

    text('proot-distro: una distro Linux completa dentro de Termux',
      'Debian, Ubuntu, Arch o Alpine en tu teléfono, sin root.',
      `
<h2>¿Para qué?</h2>
<p>Termux ya es muy completo, pero a veces necesitas un Linux "normal" (con <code>apt</code>, con rutas como <code>/etc</code>, y programas compilados para glibc). Para eso existe <strong>proot-distro</strong>: instala una distribución completa dentro de una carpeta de Termux y te deja "entrar" en ella.</p>

<h2>Cómo funciona</h2>
<p><strong>proot</strong> usa una técnica que engaña a los programas haciéndoles creer que están en la raíz del sistema (<code>/</code>) y que eres <em>root</em>, aunque en realidad todo ocurre dentro de la carpeta de Termux y sin privilegios reales de Android. Es seguro (no modifica el sistema) pero un poco más lento que Termux nativo.</p>

<pre><code>pkg install proot-distro
proot-distro list
proot-distro install debian
proot-distro login debian</code></pre>

<p>Al entrar verás un prompt de Debian real. Ahí puedes usar <code>apt update</code>, <code>apt install</code>… igual que en un servidor Debian. Para salir, escribe <code>exit</code>.</p>

<h2>Distros disponibles</h2>
<table>
<tr><th>Nombre</th><th>Familia</th><th>Ideal para</th></tr>
<tr><td>debian</td><td>Debian</td><td>Estabilidad y compatibilidad general</td></tr>
<tr><td>ubuntu</td><td>Debian</td><td>Seguir tutoriales pensados para Ubuntu</td></tr>
<tr><td>alpine</td><td>Alpine</td><td>Ligereza (muy poco espacio)</td></tr>
<tr><td>archlinux</td><td>Arch</td><td>Practicar con pacman y el estilo Arch</td></tr>
</table>
<p>Otras existen también; <code>proot-distro list</code> te muestra las que tu versión ofrece.</p>

<h2>Límites</h2>
<ul>
<li>No tiene todas las funciones de un Linux "de verdad" (por ejemplo, no se pueden usar servicios de <code>systemd</code> ni montar discos).</li>
<li>Las apps con interfaz gráfica requieren configuración extra (servidor VNC o X11); no es lo primero que hay que intentar.</li>
<li>Ocupa bastante espacio (cientos de MB).</li>
</ul>

<div class="tip">
💡 Es una gran forma de <strong>practicar administración de Linux</strong> (usuarios, permisos, paquetes) sin instalar nada en tu PC ni arriesgar tu teléfono: si algo sale mal, borras la distro con <code>proot-distro remove debian</code> y empiezas de nuevo.
</div>
`,
      quiz('¿Qué te permite hacer proot-distro?',
        ['Convertir tu teléfono en root', 'Instalar y usar una distribución Linux completa (Debian, Ubuntu…) dentro de Termux, sin root', 'Reemplazar Android por Linux', 'Descargar apps de Google Play'], 1),
      {
        title: 'Simulador: instala Debian dentro de Termux',
        intro: 'Vas a instalar y entrar a una distro Debian completa en tu teléfono.',
        checkpoints: [
          cp('Instala proot-distro: pkg install proot-distro', 'pkg install proot-distro', String.raw`^pkg\s+install\s+(-y\s+)?proot-distro\s*$`, 'Usa: pkg install proot-distro', 'Instalado.', 'Setting up proot-distro ...'),
          cp('Mira las distribuciones disponibles: proot-distro list', 'proot-distro list', String.raw`^proot-distro\s+list\s*$`, 'Usa: proot-distro list', 'Estas son algunas de las opciones.',
            'Supported distributions:\n  * Alpine Linux (alpine)\n  * Arch Linux (archlinux)\n  * Debian (debian)\n  * Ubuntu (ubuntu)\n  ...'),
          cp('Instala Debian: proot-distro install debian', 'proot-distro install debian', String.raw`^proot-distro\s+install\s+debian\s*$`, 'Usa: proot-distro install debian',
            'Debian descargada y lista (esto puede tardar unos minutos en un teléfono real).', '[*] Installing Debian...\n[*] Finished.'),
          cp('Entra a Debian: proot-distro login debian', 'proot-distro login debian', String.raw`^proot-distro\s+login\s+debian\s*$`, 'Usa: proot-distro login debian',
            'Ahora estás dentro de un Debian completo. Aquí funcionan apt, /etc y todo lo demás. Con "exit" vuelves a Termux.', 'root@localhost:~#'),
        ],
      }),

    text('Seguridad, límites y ética de tener una terminal potente',
      'Lo que conviene saber antes de instalar todo lo que aparece en un tutorial.',
      `
<h2>Tu teléfono tiene tus cosas más personales</h2>
<p>Ejecutar comandos en Termux es más seguro que dar permisos a una app desconocida… siempre que <strong>tú sepas qué estás ejecutando</strong>. Reglas simples:</p>
<table>
<tr><th>Regla</th><th>Por qué</th></tr>
<tr><td>No pegues comandos que no entiendes</td><td>Un solo comando puede descargar y ejecutar un programa dañino (por ejemplo <code>curl ... | bash</code> de una fuente desconocida).</td></tr>
<tr><td>Instala con <code>pkg</code> desde los repositorios oficiales</td><td>Los paquetes están revisados por la comunidad del proyecto.</td></tr>
<tr><td>Concede permisos de Termux:API solo cuando los uses</td><td>Los scripts heredan esos permisos.</td></tr>
<tr><td>No compartas tu llave privada SSH, tokens ni contraseñas</td><td>Son las llaves de tus cuentas.</td></tr>
<tr><td>Mantén todo actualizado con <code>pkg upgrade</code></td><td>Corrige fallos de seguridad.</td></tr>
</table>

<h2>Herramientas de red y seguridad</h2>
<p>Termux ofrece programas como <code>nmap</code> (mapeo de redes) o <code>hydra</code>. Aprender a usarlos es legítimo y útil para defender redes. Pero:</p>
<div class="warn">
⚠️ Escanear o intentar acceder a redes, cuentas o dispositivos que <strong>no son tuyos</strong> y sin autorización expresa puede ser un delito en tu país (y viola los Términos de Uso de esta escuela). Practica solo en tu red, tus equipos, o laboratorios pensados para eso. Si quieres el camino correcto, sigue la <em>Academia de Ciberseguridad</em>.
</div>

<h2>Límites reales de Termux</h2>
<ul>
<li>No es una máquina virtual completa (aunque proot-distro se acerca).</li>
<li>Apps gráficas de PC requieren configuración extra y son lentas.</li>
<li>Los procesos en segundo plano dependen de las políticas de batería de Android.</li>
<li>Sin root no puedes tocar cosas del sistema (y no lo necesitas para aprender).</li>
</ul>

<div class="tip">
💡 <strong>Respaldo:</strong> tus archivos de Termux viven en el almacenamiento interno de la app. Si desinstalas Termux, se borran. Copia lo importante a <code>~/storage</code> o súbelo a Git.
</div>
`,
      quiz('¿Qué es lo más seguro al encontrar un tutorial con un comando desconocido?',
        ['Pegarlo de inmediato para ver qué pasa', 'Entender qué hace antes de ejecutarlo, y desconfiar de los que descargan y ejecutan scripts de fuentes desconocidas', 'Ejecutarlo como root', 'Compartirlo con amigos'], 1)),

    text('Proyecto final y siguientes pasos',
      'Une todo: un mini panel de tu teléfono y una ruta para seguir en la Academia de Linux.',
      `
<h2>Proyecto: tu "panel de control" en Termux</h2>
<p>Con lo que aprendiste, este proyecto es totalmente alcanzable:</p>
<ol>
<li><strong>Crea un script</strong> <code>panel.sh</code> en tu HOME.</li>
<li>Que muestre la <strong>fecha</strong> (<code>date</code>), el <strong>usuario</strong> (<code>whoami</code>) y el <strong>espacio libre</strong> (<code>df -h ~</code>).</li>
<li>Que use <code>termux-battery-status</code> (con <code>jq</code>) para mostrar el <strong>porcentaje de batería</strong>.</li>
<li>Que al final envíe una <strong>notificación</strong> con <code>termux-notification</code> que diga "Panel listo".</li>
<li>Guárdalo en <code>~/.shortcuts</code> para lanzarlo con un widget.</li>
<li>Súbelo a <strong>GitHub</strong> con Git: ya sabes hacerlo.</li>
</ol>

<div class="example">
<strong>Nivel extra:</strong> agrégale que, si la batería baja del 20%, use <code>termux-tts-speak</code> para avisarte en voz alta. Ese es tu primer "servicio" propio.
</div>

<h2>¿Qué sigue en la Academia de Linux?</h2>
<table>
<tr><th>Si quieres…</th><th>Sigue con…</th></tr>
<tr><td>Dominar los comandos</td><td>Consola de Comandos: Primeros Pasos → Bash desde Cero</td></tr>
<tr><td>Entender de dónde viene todo</td><td>Historia de Linux</td></tr>
<tr><td>Practicar sin miedo</td><td>El Laboratorio de terminales de la academia</td></tr>
<tr><td>Trabajar en equipo con código</td><td>Git y GitHub: de Cero a Experto</td></tr>
<tr><td>Proteger sistemas</td><td>Academia de Ciberseguridad</td></tr>
</table>

<p>Tienes en el bolsillo una herramienta que profesionales de todo el mundo usan a diario. Ahora depende de ti seguir explorando.</p>
`,
      quiz('¿Por qué conviene guardar copias de tus proyectos en ~/storage o en Git?',
        ['Porque Termux es de pago', 'Porque los archivos dentro de Termux se borran si desinstalas la app', 'Porque Android lo obliga', 'No es necesario'], 1)),
  ],
}
