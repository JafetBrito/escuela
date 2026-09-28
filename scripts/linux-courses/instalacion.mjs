// Curso "Instala Linux: tu primera distro". Solo texto + consolas + quizzes.
import { cp, quiz, text } from './helpers.mjs'

export const instalacion = {
  id: 'course-linux-instalacion',
  title: 'Instala Linux: Tu Primera Distro',
  description: 'Elige una distribución, pruébala sin riesgo (WSL, máquina virtual, USB Live) e instálala con seguridad: respaldo, particiones, doble arranque, primer arranque y solución de problemas. Con consolas interactivas.',
  ai_instructions: 'Eres el Mago, profesor de la Academia de Linux de Oliver Academy, guiando el curso "Instala Linux". Tu prioridad es que el alumno NO pierda datos: siempre recuerda respaldar antes de tocar particiones y verificar el disco correcto antes de instalar o escribir un USB. Recomienda primero las opciones sin riesgo (WSL, máquina virtual, USB Live) y deja la instalación real para cuando esté listo. Si el alumno describe un problema concreto, pide el modelo de equipo, la distro y el mensaje exacto antes de suponer la causa, y no inventes pasos de firmware que varían por marca.',
  icon: '💿',
  color: '#38bdf8',
  category: 'Linux',
  subcategory: 'Administración de Sistemas',
  difficulty: 'principiante',
  locked: false,
  modules: [
    text('Bienvenida: no tienes que "cambiar" de sistema para usar Linux',
      'Un mapa de opciones, de la menos a la más comprometida.',
      `
<h2>Instalar Linux no es una decisión de todo o nada</h2>
<p>Mucha gente cree que usar Linux significa borrar Windows y arriesgarlo todo. Falso: hay una escalera de opciones, y lo sensato es empezar por los peldaños de abajo.</p>
<table>
<tr><th>Opción</th><th>Riesgo para tus datos</th><th>Esfuerzo</th><th>Ideal para</th></tr>
<tr><td>Probar en el navegador</td><td>Ninguno</td><td>Mínimo</td><td>Ver cómo luce un escritorio Linux (existen sitios que ofrecen distros de demostración).</td></tr>
<tr><td><strong>WSL</strong> (Windows)</td><td>Ninguno</td><td>Bajo</td><td>Aprender la terminal y programar sin salir de Windows.</td></tr>
<tr><td><strong>Máquina virtual</strong></td><td>Ninguno</td><td>Medio</td><td>Probar el escritorio completo, romper cosas y reiniciar de cero.</td></tr>
<tr><td><strong>USB Live</strong></td><td>Muy bajo</td><td>Medio</td><td>Probar Linux en tu hardware real sin instalar nada.</td></tr>
<tr><td>Doble arranque (dual boot)</td><td>Medio</td><td>Alto</td><td>Tener Windows y Linux en la misma computadora.</td></tr>
<tr><td>Instalación completa</td><td>Alto (borra el disco)</td><td>Medio</td><td>Una computadora dedicada a Linux, o una vieja que revivir.</td></tr>
</table>

<h2>Lo que aprenderás</h2>
<ul>
<li>Cómo elegir una distribución que se ajuste a ti.</li>
<li>Cómo prepararte (respaldo, requisitos, cifrado) para no perder nada.</li>
<li>Cómo usar WSL, una máquina virtual y un USB Live.</li>
<li>Cómo se ve una instalación real, paso a paso, y qué significan las particiones.</li>
<li>Qué hacer después del primer arranque, y cómo resolver los problemas típicos.</li>
</ul>

<div class="tip">
💡 Si nunca has usado Linux, un buen orden es: <strong>WSL o máquina virtual → USB Live → instalación</strong>. Cada paso te da confianza para el siguiente.
</div>
<div class="warn">
⚠️ Las operaciones sobre discos y particiones pueden borrar datos de forma <strong>irreversible</strong>. En este curso siempre te pediremos respaldar primero y comprobar el disco correcto.
</div>
`,
      quiz('¿Cuál es la forma de probar Linux con menos riesgo para tus datos?',
        ['Formatear el disco y reinstalar', 'Empezar con WSL, una máquina virtual o un USB Live', 'Instalarlo directamente sobre Windows sin respaldo', 'Cambiar el BIOS a ciegas'], 1)),

    text('Elegir tu distro: escritorio, estabilidad y comunidad',
      'Una guía práctica para no perderte entre cientos de opciones.',
      `
<h2>Tres preguntas para decidir</h2>
<ol>
<li><strong>¿Cuánta experiencia tienes?</strong> Principiante → una distro "que funciona de fábrica".</li>
<li><strong>¿Para qué la usarás?</strong> Estudio y programación, juegos, servidor, revivir un equipo viejo…</li>
<li><strong>¿Qué tan viejo es tu equipo?</strong> Hay distros ligeras para hardware modesto.</li>
</ol>

<h2>Recomendaciones para empezar</h2>
<table>
<tr><th>Distro</th><th>Familia</th><th>Por qué</th></tr>
<tr><td><strong>Ubuntu</strong> (versión LTS)</td><td>Debian</td><td>La más documentada: casi cualquier problema ya tiene respuesta en internet.</td></tr>
<tr><td><strong>Linux Mint</strong></td><td>Debian/Ubuntu</td><td>Escritorio tradicional y cómodo para quienes vienen de Windows.</td></tr>
<tr><td><strong>Fedora</strong></td><td>Red Hat</td><td>Software reciente y bien pulido, buena para desarrollo.</td></tr>
<tr><td>Debian</td><td>Debian</td><td>Muy estable y sin dueño comercial; ideal para servidores.</td></tr>
<tr><td>Pop!_OS, Zorin OS, elementary OS</td><td>Ubuntu</td><td>Enfoques particulares (desarrollo/juegos, facilidad, estética).</td></tr>
<tr><td>Xubuntu, Lubuntu, antiX…</td><td>Varias</td><td>Ligeras, para equipos viejos.</td></tr>
</table>

<h2>Entornos de escritorio</h2>
<p>La "cara" de Linux no es única: se elige aparte del sistema.</p>
<table>
<tr><th>Escritorio</th><th>Carácter</th></tr>
<tr><td>GNOME</td><td>Moderno y minimalista (el de Ubuntu y Fedora por defecto).</td></tr>
<tr><td>KDE Plasma</td><td>Muy personalizable, similar a un Windows clásico.</td></tr>
<tr><td>Cinnamon</td><td>Tradicional (el de Mint).</td></tr>
<tr><td>Xfce</td><td>Ligero y sencillo.</td></tr>
</table>

<h2>¿Qué significa "LTS"?</h2>
<p><strong>LTS</strong> (<em>Long Term Support</em>) es una versión que recibe actualizaciones de seguridad durante años (en Ubuntu, cinco años de soporte estándar). Para aprender y trabajar es la opción tranquila: no tendrás que reinstalar cada seis meses.</p>

<div class="tip">
💡 <strong>Regla práctica:</strong> no gastes semanas eligiendo. Cualquier distro popular sirve para aprender, y lo que aprendas (terminal, permisos, paquetes) se transfiere a las demás. Si la primera no te convence, prueba otra.
</div>
`,
      quiz('¿Qué significa que una versión de Ubuntu sea LTS?',
        ['Que es la más ligera', 'Que tiene soporte y actualizaciones de seguridad durante mucho más tiempo', 'Que solo sirve para servidores', 'Que no necesita internet'], 1)),

    text('Antes de tocar nada: respaldo, requisitos y trampas comunes',
      'La lista de comprobación que evita el 90% de los desastres.',
      `
<h2>1. Respalda</h2>
<p>Antes de cualquier operación real sobre discos: copia tus archivos importantes a un disco externo o a la nube. Y comprueba que el respaldo <strong>abre</strong>. Un respaldo que nunca se probó es una esperanza, no un respaldo.</p>

<h2>2. Comprueba los requisitos</h2>
<p>Como referencia, las versiones de escritorio de Ubuntu piden un procesador de doble núcleo, unos <strong>4 GB de RAM</strong> y unos <strong>25 GB de disco</strong> como mínimo recomendado (otras distros ligeras piden mucho menos). Revisa siempre la página oficial de la versión que vayas a instalar.</p>

<h2>3. Trampas típicas en computadoras con Windows</h2>
<table>
<tr><th>Trampa</th><th>Qué hacer</th></tr>
<tr><td><strong>Cifrado del disco</strong> (BitLocker / cifrado de dispositivo)</td><td>Guarda tu clave de recuperación y sigue la guía de Microsoft antes de cambiar particiones; si no, podrías quedar sin acceso a Windows.</td></tr>
<tr><td><strong>Inicio rápido</strong> de Windows</td><td>Desactívalo si vas a compartir disco entre Windows y Linux: deja el sistema de archivos en un estado "a medias".</td></tr>
<tr><td><strong>UEFI y Secure Boot</strong></td><td>Casi todas las computadoras modernas usan UEFI. Las distros principales soportan Secure Boot, pero algunos controladores (por ejemplo de tarjetas gráficas) pueden pedir pasos extra.</td></tr>
<tr><td>Modo de disco (RAID/Intel RST) en algunos portátiles</td><td>A veces oculta el disco al instalador. Busca la documentación de tu modelo antes de cambiar nada.</td></tr>
<tr><td>Poco espacio libre</td><td>Necesitas espacio sin usar para Linux. Libera antes de reducir la partición de Windows.</td></tr>
</table>

<div class="warn">
⚠️ Si esto te suena a mucho, tu ruta es <strong>máquina virtual o USB Live</strong>: nada de esto te afecta, porque no tocas el disco.
</div>

<h2>4. Ten un plan B</h2>
<p>Ten a mano un segundo dispositivo con internet (para buscar soluciones mientras instalas) y, si es posible, un USB extra de recuperación.</p>
`,
      quiz('¿Qué debes hacer siempre antes de modificar particiones o reinstalar?',
        ['Nada, es seguro', 'Hacer un respaldo y comprobar que se puede abrir', 'Apagar el internet', 'Desinstalar el antivirus'], 1)),

    text('WSL: Linux dentro de Windows en un comando',
      'La forma más rápida y segura de empezar si usas Windows 10 u 11.',
      `
<h2>¿Qué es WSL?</h2>
<p><strong>WSL</strong> (Windows Subsystem for Linux) te deja ejecutar un Linux real dentro de Windows, con su terminal, sin particiones ni reinicios. Desde WSL 2 usa un kernel Linux de verdad. Es perfecta para aprender la terminal, programar (VS Code se integra muy bien) y practicar comandos.</p>

<h2>Instalar</h2>
<p>Abre <strong>PowerShell como administrador</strong> y escribe:</p>
<pre><code>wsl --install</code></pre>
<p>Instala WSL y una distribución por defecto (normalmente Ubuntu). Reinicia si te lo pide; al abrir Ubuntu por primera vez, te pedirá crear un <strong>usuario y una contraseña de Linux</strong> (son independientes de tu cuenta de Windows).</p>

<h2>Comandos útiles (se escriben en PowerShell)</h2>
<table>
<tr><th>Comando</th><th>Para qué</th></tr>
<tr><td><code>wsl -l -v</code></td><td>Lista tus distros y si usan WSL 1 o 2.</td></tr>
<tr><td><code>wsl --install -d Debian</code></td><td>Instala otra distro.</td></tr>
<tr><td><code>wsl</code></td><td>Entra a tu distro por defecto.</td></tr>
<tr><td><code>wsl --update</code></td><td>Actualiza WSL.</td></tr>
<tr><td><code>wsl --shutdown</code></td><td>Apaga todo WSL.</td></tr>
</table>

<h2>Tus archivos</h2>
<ul>
<li>Desde Linux ves tus discos de Windows en <code>/mnt/c</code>.</li>
<li>Para el mejor rendimiento, trabaja dentro del sistema de archivos de Linux (tu <code>~</code>), no en <code>/mnt/c</code>.</li>
</ul>

<div class="tip">
💡 WSL no es un escritorio Linux completo (aunque Windows 11 permite abrir aplicaciones gráficas de Linux). Si quieres el escritorio entero, usa máquina virtual o instalación real.
</div>
`,
      quiz('¿Dónde se escribe el comando "wsl --install"?',
        ['En la terminal de Linux', 'En PowerShell o Símbolo del sistema de Windows (como administrador)', 'En el navegador', 'En la BIOS'], 1),
      {
        title: 'Simulador: instala WSL en Windows',
        intro: 'Estás en PowerShell (administrador) en un Windows 11 simulado. Vas a instalar WSL y comprobar que quedó bien.',
        checkpoints: [
          cp('Instala WSL con su distribución por defecto.', 'wsl --install', String.raw`^wsl\s+--install\s*$`, 'Usa: wsl --install',
            'Instalado. Tras reiniciar, Ubuntu te pedirá crear tu usuario de Linux.', 'Installing: Windows Subsystem for Linux\nInstalling: Ubuntu\nThe requested operation is successful. Restart your computer.'),
          cp('Lista tus distribuciones y su versión de WSL.', 'wsl -l -v', String.raw`^wsl\s+(-l\s+-v|--list\s+--verbose|-l\s+--verbose)\s*$`, 'Usa: wsl -l -v',
            'Ubuntu corre con WSL versión 2 (kernel Linux real).', '  NAME      STATE           VERSION\n* Ubuntu    Running         2'),
          cp('Instala también Debian con: wsl --install -d Debian', 'wsl --install -d Debian', String.raw`^wsl\s+--install\s+-d\s+Debian\s*$`, 'Usa: wsl --install -d Debian', 'Ahora tienes dos distros para comparar.'),
          cp('Entra a tu distro por defecto con wsl.', 'wsl', String.raw`^wsl\s*$`, 'Usa: wsl', 'Ya estás en un prompt de Linux dentro de Windows.', 'estudiante@PC:/mnt/c/Users/tu-usuario$'),
        ],
      }),

    text('Máquina virtual: un ordenador dentro de tu ordenador',
      'Prueba el escritorio completo sin arriesgar nada; si algo sale mal, borras y repites.',
      `
<h2>¿Qué es?</h2>
<p>Una <strong>máquina virtual</strong> (VM) es un programa que simula una computadora completa. Dentro instalas Linux como si fuera una PC real, pero con un disco que es un simple archivo. Si te equivocas, borras la VM y empiezas de nuevo, sin consecuencias.</p>

<h2>Programas para crearlas</h2>
<table>
<tr><th>Programa</th><th>Nota</th></tr>
<tr><td>VirtualBox</td><td>Gratuito y de código abierto; funciona en Windows, Linux y macOS con procesadores compatibles.</td></tr>
<tr><td>GNOME Boxes</td><td>Muy sencillo, en escritorios Linux.</td></tr>
<tr><td>VMware Workstation Player</td><td>Popular; consulta su licencia actual para tu tipo de uso.</td></tr>
<tr><td>Hyper-V</td><td>Incluido en algunas ediciones de Windows.</td></tr>
</table>

<h2>Configuración razonable</h2>
<table>
<tr><th>Recurso</th><th>Sugerencia</th></tr>
<tr><td>Memoria (RAM)</td><td>4 GB (nunca más de la mitad de la que tiene tu equipo).</td></tr>
<tr><td>Procesadores</td><td>2 núcleos.</td></tr>
<tr><td>Disco virtual</td><td>25–40 GB (dinámico: solo ocupa lo que usa).</td></tr>
<tr><td>Memoria de video</td><td>La máxima que permita el programa.</td></tr>
</table>

<h2>Pasos</h2>
<ol>
<li>Descarga el archivo <strong>ISO</strong> de la distro (desde su sitio oficial).</li>
<li>En el programa crea una VM nueva y elige ese ISO como disco de instalación.</li>
<li>Arranca la VM y sigue el instalador (verás el proceso completo en las siguientes clases).</li>
<li>Instala las "Guest Additions" / herramientas de invitado para tener resolución automática y portapapeles compartido.</li>
</ol>

<div class="warn">
⚠️ Si la VM no arranca o solo permite 32 bits, casi seguro falta activar la <strong>virtualización</strong> (Intel VT-x / AMD-V, también llamada SVM) en el firmware (BIOS/UEFI) de tu equipo. El nombre y ubicación varían según la marca.
</div>

<div class="tip">
💡 Truco de profesional: haz una <strong>instantánea (snapshot)</strong> antes de un experimento arriesgado. Si sale mal, vuelves atrás en segundos.
</div>
`,
      quiz('¿Cuál es la gran ventaja de una máquina virtual para aprender?',
        ['Es más rápida que una PC real', 'Puedes equivocarte sin riesgo: borras la VM o vuelves a una instantánea', 'No necesita ISO', 'Reemplaza a Windows'], 1)),

    text('USB Live: prueba Linux en tu hardware real',
      'Descargar el ISO, verificar que no está dañado y crear el USB de arranque.',
      `
<h2>¿Qué es un USB Live?</h2>
<p>Un <strong>USB Live</strong> arranca un sistema Linux completo desde el USB, sin instalar nada en tu disco. Sirve para comprobar que tu Wi-Fi, pantalla y teclado funcionan bien con esa distro antes de decidirte, y también como herramienta de rescate. Al apagar, todo desaparece (salvo que uses persistencia).</p>

<h2>Paso 1: descarga el ISO desde el sitio oficial</h2>
<p>Siempre desde la página del proyecto (no desde sitios de descargas de terceros).</p>

<h2>Paso 2: verifica la integridad</h2>
<p>Cada distro publica una <strong>suma de verificación (checksum)</strong>, normalmente SHA-256: una "huella digital" del archivo. Si la que calculas tú coincide con la oficial, el archivo está completo y sin alterar:</p>
<pre><code>sha256sum ubuntu-24.04-desktop-amd64.iso</code></pre>
<p>(En Windows: <code>Get-FileHash archivo.iso</code> en PowerShell.)</p>

<h2>Paso 3: crea el USB</h2>
<table>
<tr><th>Herramienta</th><th>Nota</th></tr>
<tr><td>balenaEtcher</td><td>Muy sencilla: eliges ISO, eliges USB, "Flash".</td></tr>
<tr><td>Rufus (Windows)</td><td>Opciones avanzadas de arranque.</td></tr>
<tr><td>Ventoy</td><td>Instalas una vez y luego solo copias ISOs al USB; permite varias distros.</td></tr>
</table>
<div class="warn">
⚠️ <strong>Este proceso borra el USB por completo.</strong> Y antes de "flashear", revisa dos veces que elegiste el USB y no un disco de datos. Es el error más caro de esta clase.
</div>

<h2>Paso 4: arranca desde el USB</h2>
<p>Reinicia y abre el <strong>menú de arranque</strong>. La tecla depende de la marca (suelen ser F12, F10, F9, F2, Esc…); en el arranque, muchos equipos muestran un aviso con la tecla. Elige el USB, y en el menú de la distro escoge <em>"Try"</em> / <em>"Probar"</em> (probar sin instalar).</p>
`,
      quiz('¿Para qué sirve verificar el checksum (SHA-256) de un ISO?',
        ['Para acelerar la descarga', 'Para confirmar que el archivo está completo y no ha sido alterado', 'Para instalar el sistema', 'Para borrar el USB'], 1),
      {
        title: 'Simulador: verifica un ISO antes de grabarlo',
        intro: 'Descargaste el ISO de Ubuntu y el archivo SHA256SUMS del sitio oficial. Antes de crear el USB, compruebas que el ISO es auténtico.',
        checkpoints: [
          cp('Mira los archivos descargados.', 'ls', String.raw`^ls\s*$`, 'Usa: ls', 'El ISO y el archivo con las sumas oficiales.', 'SHA256SUMS  ubuntu-24.04-desktop-amd64.iso'),
          cp('Calcula la huella SHA-256 del ISO.', 'sha256sum ubuntu-24.04-desktop-amd64.iso', String.raw`^sha256sum\s+ubuntu-24\.04-desktop-amd64\.iso\s*$`,
            'Usa: sha256sum ubuntu-24.04-desktop-amd64.iso', 'Esa cadena larga es la huella (aquí un ejemplo recortado). Debe coincidir con la publicada.', '3f7a9c…e91b  ubuntu-24.04-desktop-amd64.iso'),
          cp('Deja que el sistema compare todo por ti con: sha256sum -c SHA256SUMS --ignore-missing', 'sha256sum -c SHA256SUMS --ignore-missing',
            String.raw`^sha256sum\s+(-c|--check)\s+SHA256SUMS(\s+--ignore-missing)?\s*$`, 'Usa: sha256sum -c SHA256SUMS --ignore-missing',
            'El resultado "OK" significa que el ISO es idéntico al oficial. Si dijera FAILED, lo descargas de nuevo.', 'ubuntu-24.04-desktop-amd64.iso: OK'),
        ],
      }),

    text('El instalador paso a paso (y qué son las particiones)',
      'Lo que verás en pantalla y cómo tomar cada decisión con calma.',
      `
<h2>Un recorrido típico</h2>
<ol>
<li><strong>Idioma y distribución del teclado.</strong> Elige bien el teclado: afecta tus contraseñas.</li>
<li><strong>Conexión a internet</strong> y opción de instalar actualizaciones y software extra (códecs, controladores).</li>
<li><strong>Tipo de instalación</strong> (la pantalla más importante; ver abajo).</li>
<li><strong>Zona horaria.</strong></li>
<li><strong>Tu usuario, nombre del equipo y contraseña.</strong> Usa una contraseña que puedas recordar pero sea difícil de adivinar.</li>
<li><strong>Instalación y reinicio.</strong> Cuando lo pida, retira el USB.</li>
</ol>

<h2>¿Qué es una partición?</h2>
<p>Un disco se puede dividir en zonas independientes llamadas <strong>particiones</strong>, como dividir un terreno en lotes. Cada una tiene un <strong>sistema de archivos</strong> (formato).</p>
<table>
<tr><th>Partición</th><th>Para qué</th><th>Formato típico</th></tr>
<tr><td><strong>EFI</strong> (ESP)</td><td>Guarda los cargadores de arranque en equipos UEFI (de unos cientos de MB a 1 GB).</td><td>FAT32</td></tr>
<tr><td><strong>/</strong> (raíz)</td><td>El sistema y tus programas.</td><td>ext4 (o btrfs/xfs según la distro)</td></tr>
<tr><td><strong>/home</strong> (opcional)</td><td>Tus archivos personales, separados del sistema.</td><td>ext4</td></tr>
<tr><td><strong>swap</strong> (opcional)</td><td>Espacio de "memoria de reserva" en disco; muchas instalaciones modernas usan un archivo swap.</td><td>swap</td></tr>
</table>

<h2>Las tres opciones típicas de "tipo de instalación"</h2>
<table>
<tr><th>Opción</th><th>Qué hace</th><th>Cuidado</th></tr>
<tr><td>Instalar junto a Windows</td><td>Reduce la partición de Windows y crea espacio para Linux.</td><td>Requiere respaldo y descifrar/controlar BitLocker.</td></tr>
<tr><td><strong>Borrar disco e instalar</strong></td><td>Elimina TODO lo que hay en el disco elegido.</td><td>Solo si el equipo es para Linux o estás en una VM.</td></tr>
<tr><td>Particionado manual</td><td>Tú decides cada partición.</td><td>Para cuando ya sabes qué haces.</td></tr>
</table>

<div class="warn">
⚠️ Antes de confirmar cualquier "Borrar disco", lee el <strong>nombre y tamaño</strong> del disco que aparece. Si conectaste otro disco o USB de datos, desconéctalo para no equivocarte.
</div>

<div class="tip">
💡 <strong>Cifrado de disco:</strong> muchos instaladores ofrecen cifrar todo el disco (LUKS). Es excelente para portátiles (si te lo roban, tus datos están protegidos), pero <strong>si olvidas la contraseña, pierdes los datos</strong>.
</div>
`,
      quiz('¿Qué hace la opción "Borrar disco e instalar"?',
        ['Solo reduce Windows', 'Elimina todo lo que hay en el disco seleccionado antes de instalar', 'Instala sin tocar el disco', 'Actualiza Linux'], 1)),

    text('Doble arranque (dual boot): Windows y Linux juntos',
      'Cómo funciona, y los dos problemas típicos que puedes prevenir.',
      `
<h2>La idea</h2>
<p>Con <strong>doble arranque</strong> (<em>dual boot</em>), tu computadora tiene ambos sistemas en particiones separadas. Al encender, un menú del cargador de arranque (normalmente <strong>GRUB</strong>) te deja elegir a cuál entrar.</p>

<h2>Buenas prácticas</h2>
<ol>
<li>Instala <strong>Windows primero</strong> y Linux después (el instalador de Linux sabe convivir con Windows; al revés es más incómodo).</li>
<li>Libera espacio desde Windows con la herramienta de administración de discos, y respalda antes.</li>
<li>Desactiva el <strong>Inicio rápido</strong> de Windows.</li>
<li>Si usas BitLocker, ten a mano la clave de recuperación.</li>
</ol>

<h2>Problemas comunes</h2>
<table>
<tr><th>Síntoma</th><th>Causa habitual</th><th>Idea de solución</th></tr>
<tr><td>Después de una gran actualización de Windows desaparece el menú de Linux</td><td>Windows reescribió el orden de arranque.</td><td>Arranca desde un USB Live y restaura o reinstala GRUB, o cambia el orden en el firmware.</td></tr>
<tr><td>La hora está mal al cambiar de sistema</td><td>Windows guarda la hora del reloj en hora local y Linux en UTC.</td><td>Configura uno de los dos para que usen el mismo criterio (en Linux, <code>timedatectl set-local-rtc 1</code>, o el ajuste equivalente en Windows).</td></tr>
<tr><td>Windows no ve las particiones de Linux</td><td>Usan sistemas de archivos distintos.</td><td>Es normal; comparte datos con una partición NTFS/exFAT o un disco externo.</td></tr>
</table>

<div class="example">
<strong>¿Vale la pena?</strong> Para muchas personas, WSL o una VM cubren el 90% de las necesidades sin los riesgos del dual boot. Se justifica cuando necesitas el rendimiento completo de tu hardware (juegos, gráficos, desarrollo pesado) o quieres vivir en Linux a diario.
</div>
`,
      quiz('¿Qué sistema conviene instalar primero cuando harás doble arranque con Windows?',
        ['Linux primero', 'Windows primero y después Linux', 'Da igual, no hay diferencia', 'Ninguno'], 1)),

    text('Primer arranque: actualizar y dejar todo listo',
      'Las cinco cosas que conviene hacer justo después de instalar.',
      `
<h2>Checklist de la primera hora</h2>
<ol>
<li><strong>Actualiza el sistema.</strong> En una distro tipo Ubuntu/Debian:
<pre><code>sudo apt update
sudo apt upgrade</code></pre></li>
<li><strong>Instala controladores</strong> propietarios si los necesitas (por ejemplo, tarjetas gráficas NVIDIA). Ubuntu tiene la herramienta gráfica <em>"Software y actualizaciones → Controladores adicionales"</em>.</li>
<li><strong>Activa las copias de seguridad de sistema</strong> con una herramienta como <em>Timeshift</em>: te permite volver atrás si una actualización sale mal.</li>
<li><strong>Explora la tienda de aplicaciones</strong> del sistema. Además de los paquetes de la distro (apt), muchas apps llegan por <em>Flatpak</em> o <em>Snap</em>.</li>
<li><strong>Personaliza:</strong> tema claro/oscuro, atajos, escritorios virtuales.</li>
</ol>

<h2>Comandos para conocer tu sistema</h2>
<table>
<tr><th>Comando</th><th>Te dice</th></tr>
<tr><td><code>lsb_release -a</code></td><td>Distribución y versión.</td></tr>
<tr><td><code>uname -r</code></td><td>Versión del kernel.</td></tr>
<tr><td><code>df -h</code></td><td>Espacio en disco, en formato legible.</td></tr>
<tr><td><code>free -h</code></td><td>Uso de memoria RAM.</td></tr>
<tr><td><code>lsblk</code></td><td>Discos y particiones.</td></tr>
</table>

<div class="tip">
💡 Cuando apt te pregunte <code>[S/n]</code> o <code>[Y/n]</code>, la letra en mayúscula es la opción por defecto. Puedes añadir <code>-y</code> para aceptar automáticamente, pero solo cuando sepas qué se va a instalar.
</div>
`,
      quiz('¿Qué hace "sudo apt update"?',
        ['Instala todos los programas nuevos', 'Actualiza la lista de paquetes disponibles (no instala nada por sí solo)', 'Reinicia el equipo', 'Borra paquetes viejos'], 1),
      {
        title: 'Simulador: tu primer arranque en Ubuntu',
        intro: 'Acabas de instalar Ubuntu y abriste la terminal por primera vez. Vas a actualizar y revisar tu sistema.',
        checkpoints: [
          cp('Actualiza la lista de paquetes: sudo apt update', 'sudo apt update', String.raw`^sudo\s+apt(-get)?\s+update\s*$`, 'Usa: sudo apt update',
            'Lista actualizada.', 'Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease\nReading package lists... Done\n12 packages can be upgraded.'),
          cp('Instala las actualizaciones pendientes: sudo apt upgrade', 'sudo apt upgrade', String.raw`^sudo\s+apt(-get)?\s+(upgrade|full-upgrade)(\s+-y)?\s*$`, 'Usa: sudo apt upgrade',
            'Sistema al día.', '12 upgraded, 0 newly installed, 0 to remove.'),
          cp('Descubre tu versión con lsb_release -a', 'lsb_release -a', String.raw`^lsb_release\s+-a\s*$`, 'Usa: lsb_release -a', 'Ubuntu 24.04 LTS.', 'Distributor ID:\tUbuntu\nDescription:\tUbuntu 24.04 LTS\nRelease:\t24.04\nCodename:\tnoble'),
          cp('Revisa cuánta memoria RAM tienes con free -h', 'free -h', String.raw`^free\s+-h\s*$`, 'Usa: free -h', 'Memoria total, usada y libre.', '              total        used        free\nMem:          7.7Gi       1.4Gi       4.8Gi\nSwap:         2.0Gi          0B       2.0Gi'),
        ],
      }),

    text('Recorre tu sistema: discos y la estructura de carpetas',
      'Dónde vive cada cosa en un Linux, y cómo ver tus discos.',
      `
<h2>El árbol de Linux</h2>
<p>En Linux no hay "C:" ni "D:". Todo cuelga de una sola raíz, <code>/</code>. Las carpetas principales tienen un propósito estándar:</p>
<table>
<tr><th>Ruta</th><th>Contiene</th></tr>
<tr><td><code>/home</code></td><td>Las carpetas personales de cada usuario (tus documentos).</td></tr>
<tr><td><code>/etc</code></td><td>Archivos de configuración del sistema.</td></tr>
<tr><td><code>/bin</code>, <code>/usr/bin</code></td><td>Programas.</td></tr>
<tr><td><code>/var</code></td><td>Datos que cambian: registros (logs), cachés.</td></tr>
<tr><td><code>/tmp</code></td><td>Archivos temporales.</td></tr>
<tr><td><code>/dev</code></td><td>Dispositivos representados como archivos (discos, USB…).</td></tr>
<tr><td><code>/proc</code></td><td>Información del kernel y los procesos en vivo.</td></tr>
<tr><td><code>/mnt</code>, <code>/media</code></td><td>Puntos donde se "montan" discos y USBs.</td></tr>
</table>
<p>La filosofía Unix de la que hablamos en la <em>Historia de Linux</em> aparece otra vez: "todo es un archivo".</p>

<h2>Discos y particiones con lsblk</h2>
<p><code>lsblk</code> muestra los dispositivos de bloque (discos). Por convención se llaman <code>sda</code>, <code>sdb</code>… (discos SATA/USB) o <code>nvme0n1</code> (SSD NVMe), con las particiones numeradas: <code>sda1</code>, <code>sda2</code>… Nunca escribas comandos sobre un disco sin haber identificado cuál es.</p>

<div class="warn">
⚠️ Comandos como <code>dd</code>, <code>mkfs</code> o <code>fdisk</code> pueden destruir datos al instante y no piden confirmación. Aprende a mirar antes (<code>lsblk</code>, <code>df -h</code>) y trabaja sobre discos de práctica o VMs.
</div>
`,
      quiz('¿En qué carpeta están las carpetas personales de los usuarios en Linux?',
        ['/etc', '/home', '/proc', '/dev'], 1),
      {
        title: 'Simulador: explora la estructura del sistema',
        intro: 'Sigues en tu Ubuntu recién instalado. Vas a mirar el árbol de carpetas y los discos.',
        checkpoints: [
          cp('Lista el contenido de la raíz del sistema con ls /', 'ls /', String.raw`^ls\s+/\s*$`, 'Usa: ls /', 'Estas son las carpetas principales que viste en la tabla.',
            'bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var'),
          cp('Mira cuánto ocupa tu disco con df -h', 'df -h', String.raw`^df\s+-h\s*$`, 'Usa: df -h', 'Tamaño, uso y punto de montaje de cada sistema de archivos.',
            'Filesystem      Size  Used Avail Use% Mounted on\n/dev/nvme0n1p2  234G   14G  208G   7% /\n/dev/nvme0n1p1  511M  6.1M  505M   2% /boot/efi'),
          cp('Ve la estructura de tus discos y particiones con lsblk', 'lsblk', String.raw`^lsblk\s*$`, 'Usa: lsblk', 'Un disco NVMe con dos particiones: la EFI (arranque) y la raíz (/).',
            'NAME        SIZE TYPE MOUNTPOINTS\nnvme0n1     238G disk\n├─nvme0n1p1 512M part /boot/efi\n└─nvme0n1p2 237G part /'),
          cp('Descubre el nombre de tu equipo leyendo /etc/hostname', 'cat /etc/hostname', String.raw`^cat\s+/etc/hostname\s*$`, 'Usa: cat /etc/hostname', 'Un archivo de configuración en /etc, con solo el nombre.', 'mi-laptop'),
        ],
      }),

    text('Cuando algo falla: guía de solución de problemas',
      'Los tropiezos más comunes y cómo pensar el diagnóstico.',
      `
<h2>El método: describir antes de buscar</h2>
<p>Ante un problema, anota: <strong>qué hiciste, qué esperabas, qué pasó</strong> (mensaje exacto), modelo de equipo y versión de la distro. Con eso puedes buscar con precisión y pedir ayuda bien.</p>

<h2>Problemas frecuentes</h2>
<table>
<tr><th>Problema</th><th>Ideas</th></tr>
<tr><td>El USB no arranca</td><td>Prueba otro puerto (USB 2.0 a veces es más compatible); recrea el USB con otra herramienta; revisa el orden de arranque; verifica el checksum del ISO.</td></tr>
<tr><td>Pantalla negra al arrancar</td><td>Suele ser el controlador gráfico. En el menú de arranque puedes probar el modo seguro de gráficos o, como recurso temporal, el parámetro de kernel <code>nomodeset</code> (busca la guía de tu distro).</td></tr>
<tr><td>No hay Wi-Fi</td><td>Algunas tarjetas necesitan controladores propietarios. Conecta por cable o por USB-tethering desde el teléfono, e instala el controlador desde "Controladores adicionales".</td></tr>
<tr><td>La instalación no ve el disco</td><td>Puede ser el modo RAID/Intel RST del firmware. Busca la guía de tu modelo antes de cambiar la configuración.</td></tr>
<tr><td>Un programa de Windows que necesitas</td><td>Busca alternativa libre, usa Wine/Proton, la versión web, o una VM con Windows.</td></tr>
<tr><td>Rompiste el sistema tras una actualización</td><td>Si configuraste Timeshift, restaura; si no, arranca un USB Live para rescatar tus archivos y reinstalar.</td></tr>
</table>

<h2>Dónde pedir ayuda</h2>
<ul>
<li>La wiki y los foros oficiales de tu distro (la <em>Arch Wiki</em> es excelente incluso para otras distros).</li>
<li>Comunidades de preguntas y respuestas, y foros por idioma.</li>
<li>Al preguntar: comparte el mensaje de error exacto y lo que ya probaste. Nunca compartas contraseñas ni claves.</li>
</ul>

<div class="tip">
💡 Un buen hábito de todo administrador: <strong>lee el mensaje de error completo</strong>. En Linux, el error casi siempre dice qué falló.
</div>
`,
      quiz('¿Qué información conviene reunir antes de pedir ayuda por un problema?',
        ['Solo "no funciona"', 'Qué hiciste, qué esperabas, el mensaje de error exacto, tu equipo y tu versión de distro', 'Tu contraseña de administrador', 'Nada, alguien adivinará'], 1)),

    text('Cierre: tu plan de siguientes pasos',
      'Elige tu camino y sigue construyendo.',
      `
<h2>Resumen del camino</h2>
<ol>
<li><strong>Prueba sin riesgo:</strong> WSL o máquina virtual.</li>
<li><strong>Elige una distro sencilla</strong> (Ubuntu LTS o Mint son opciones seguras).</li>
<li><strong>Respalda y verifica</strong> antes de tocar discos.</li>
<li><strong>Arranca un USB Live</strong> para comprobar tu hardware.</li>
<li><strong>Instala</strong> cuando estés listo, con calma.</li>
<li><strong>Actualiza y configura</strong> tu sistema.</li>
</ol>

<h2>Sigue en la Academia de Linux</h2>
<table>
<tr><th>Si quieres…</th><th>Ve a…</th></tr>
<tr><td>Dominar la terminal</td><td>Consola de Comandos: Primeros Pasos → Bash desde Cero</td></tr>
<tr><td>Practicar sin riesgo</td><td>El Laboratorio de terminales de la academia</td></tr>
<tr><td>Llevar Linux en tu teléfono</td><td>Termux: Linux en tu Bolsillo</td></tr>
<tr><td>Saber por qué existe todo esto</td><td>Historia de Linux</td></tr>
</table>

<div class="example">
<strong>Reto final:</strong> instala una distro en una máquina virtual, actualízala y usa <code>lsblk</code>, <code>df -h</code> y <code>free -h</code> para describir tu sistema en tres líneas. Si lo lograste, ya sabes más de instalación de Linux que la mayoría de quienes lo usan.
</div>
`,
      quiz('¿Cuál es el orden más prudente para un principiante?',
        ['Instalar directo sobre Windows sin respaldo', 'WSL o máquina virtual → USB Live → instalación real', 'Solo instalar y ver qué pasa', 'Borrar el disco y luego decidir'], 1)),
  ],
}
