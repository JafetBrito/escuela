// Genera supabase/migration_038.sql: inserta el curso "Git y GitHub: de
// Cero a Experto" en public.courses. Corre una vez, no forma parte de la app.
// Uso: node scripts/build_git_course.mjs
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const COURSE_ID = 'course-git-github'

const modules = [
  // ── 0. Video: bienvenida ────────────────────────────────────────────────
  {
    id: 0,
    order: 0,
    type: 'video',
    title: 'Bienvenida: por qué Git te va a cambiar la forma de programar',
    description: 'Qué vas a lograr al terminar este curso y cómo está organizado.',
    videoId: 'aqz-KE-bpKQ',
    // Video vertical de prueba (VerticalVideo.jsx, formato 9:16) — solo en
    // esta clase, para validar cómo se ve el reproductor vertical en móvil
    // antes de decidir si se graba así el resto del curso. Mismo ID
    // placeholder que el resto de los videos hasta que se suban a YouTube.
    verticalVideoId: 'aqz-KE-bpKQ',
    exercises: [],
    resources: [],
  },

  // ── 1. Video: la historia ───────────────────────────────────────────────
  {
    id: 1,
    order: 1,
    type: 'video',
    title: 'La Historia de Git y GitHub',
    description: 'De un enojo de Linus Torvalds en 2005 a la herramienta que corre el software del mundo entero.',
    videoId: 'aqz-KE-bpKQ',
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Por qué Linus Torvalds creó Git en 2005?',
      options: [
        'Por diversión, sin ningún motivo urgente',
        'Porque la empresa dueña de BitKeeper (la herramienta que usaba el kernel de Linux) retiró el acceso gratuito',
        'Porque GitHub se lo pidió',
        'Porque quería reemplazar a Python',
      ],
      correctIndex: 1,
    },
  },

  // ── 2. ¿Qué es el control de versiones? ─────────────────────────────────
  {
    id: 2,
    order: 2,
    type: 'text',
    title: '¿Qué es el control de versiones?',
    description: 'El problema que Git resuelve, antes de tocar un solo comando.',
    content: `
<h2>El problema: "proyecto_final_v2_final_YA.docx"</h2>
<p>Si alguna vez guardaste un archivo como <code>tarea_final.docx</code>, luego <code>tarea_final_v2.docx</code>, y terminaste con <code>tarea_final_v2_YA_DEFINITIVA.docx</code>, ya conocías el problema que resuelve el control de versiones — solo que a mano, y a mano se rompe rápido: no sabes qué cambió entre versiones, no puedes volver exactamente a una anterior, y si dos personas editan el mismo archivo, alguien pierde su trabajo.</p>

<h2>Control de versiones: un historial con superpoderes</h2>
<p>Un <strong>sistema de control de versiones</strong> (VCS, por sus siglas en inglés) lleva un registro de cada cambio que haces a un conjunto de archivos, quién lo hizo, cuándo, y por qué — y te deja viajar a cualquier punto de ese historial cuando quieras. No reemplazas archivos con copias nuevas: guardas <em>instantáneas</em> (snapshots) completas del proyecto en el tiempo.</p>

<div class="example">
<strong>Piénsalo como el "historial de versiones" de Google Docs, pero:</strong>
<ul>
<li>Funciona con cualquier tipo de archivo de texto (código, configuración, documentación), no solo un documento.</li>
<li>Vive en tu computadora sin necesitar internet.</li>
<li>Te deja tener universos paralelos del proyecto al mismo tiempo (ramas) para probar ideas sin arriesgar lo que ya funciona.</li>
</ul>
</div>

<h2>Centralizado vs. distribuido</h2>
<p>Antes de Git, la mayoría de los sistemas de control de versiones (como CVS o Subversion) eran <strong>centralizados</strong>: había un único servidor con el historial completo, y cada persona solo tenía la versión actual en su computadora. Si el servidor se caía, nadie podía ver el historial ni guardar cambios.</p>
<p>Git es <strong>distribuido</strong>: cada persona que clona un repositorio se lleva una copia <em>completa</em> del historial entero, no solo del archivo más reciente. Puedes hacer commits, ver el historial completo y crear ramas sin internet — y sincronizas con los demás cuando quieras.</p>

<div class="tip">
💡 Esta diferencia es la razón por la que GitHub existe como un servicio aparte de Git: Git es la herramienta que corre en tu computadora; GitHub es un lugar en internet donde puedes alojar una copia de tu repositorio para compartirla con otros. Git funciona perfecto sin GitHub — GitHub simplemente lo hace más fácil de compartir.
</div>

<h2>¿Por qué esto te importa como estudiante?</h2>
<ul>
<li><strong>Nunca pierdes trabajo de verdad</strong> — cualquier versión anterior de tu código sigue ahí, para siempre.</li>
<li><strong>Puedes experimentar sin miedo</strong> — prueba una idea en una rama; si no funciona, la descartas sin tocar tu código que sí funciona.</li>
<li><strong>Es la habilidad #1 que piden en cualquier trabajo de programación</strong> — no es opcional, es el idioma común de cualquier equipo de desarrollo del mundo.</li>
</ul>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es la diferencia clave entre un sistema centralizado y uno distribuido como Git?',
      options: [
        'El centralizado es más rápido',
        'En el distribuido, cada persona tiene una copia completa del historial, no solo el servidor',
        'El distribuido no permite trabajar en equipo',
        'No hay ninguna diferencia real',
      ],
      correctIndex: 1,
    },
  },

  // ── 3. Instalación y configuración ──────────────────────────────────────
  {
    id: 3,
    order: 3,
    type: 'text',
    title: 'Instalación y configuración inicial',
    description: 'Instala Git y dile quién eres — antes del primer commit.',
    content: `
<h2>Instalar Git</h2>
<table>
<tr><th>Sistema</th><th>Cómo instalarlo</th></tr>
<tr><td>Windows</td><td>Descarga el instalador desde <code>git-scm.com</code> y sigue el asistente (las opciones por defecto sirven).</td></tr>
<tr><td>macOS</td><td><code>brew install git</code> (con Homebrew), o instala las "Herramientas de línea de comandos" de Xcode.</td></tr>
<tr><td>Linux (Debian/Ubuntu)</td><td><code>sudo apt install git</code></td></tr>
</table>

<p>Para confirmar que quedó instalado, abre una terminal y escribe:</p>
<pre><code>git --version</code></pre>
<p>Deberías ver algo como <code>git version 2.4x.x</code>.</p>

<h2>Preséntate ante Git</h2>
<p>Antes de tu primer commit, Git necesita saber quién eres — esta información queda guardada en cada commit que hagas, para siempre.</p>
<pre><code>git config --global user.name "Tu Nombre"
git config --global user.email "tu@correo.com"</code></pre>

<div class="warn">
⚠️ Usa el mismo correo que vas a usar en GitHub — así GitHub conecta automáticamente tus commits con tu perfil y te da crédito por ellos.
</div>

<h2>Un editor de texto por defecto (opcional, pero útil)</h2>
<p>Git a veces abre un editor de texto (por ejemplo, para escribir un mensaje de commit largo). Si no configuras nada, usará el editor por defecto del sistema, que puede ser confuso (Vim, en muchos casos). Para usar VS Code en su lugar:</p>
<pre><code>git config --global core.editor "code --wait"</code></pre>

<h2>Verifica tu configuración</h2>
<pre><code>git config --list</code></pre>
<p>Esto imprime todo lo que configuraste — nombre, correo, editor, y cualquier otra opción global.</p>

<div class="tip">
💡 <code>--global</code> aplica la configuración a TODOS tus repositorios en esa computadora. Si quieres una configuración distinta solo para un proyecto (por ejemplo, un correo de trabajo distinto al personal), corre el mismo comando sin <code>--global</code> estando dentro de esa carpeta.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Qué hace `git config --global user.email "tu@correo.com"`?',
      options: [
        'Crea una cuenta de correo nueva',
        'Sube tu proyecto a internet',
        'Le dice a Git qué correo asociar con los commits que hagas, en todos tus repositorios',
        'Elimina el historial de commits',
      ],
      correctIndex: 2,
    },
  },

  // ── 4. Tu primer repositorio (+ terminal) ───────────────────────────────
  {
    id: 4,
    order: 4,
    type: 'text',
    title: 'Tu primer repositorio: init y el modelo de tres árboles',
    description: 'Crea tu primer repositorio y entiende dónde "vive" cada cambio.',
    content: `
<h2>Crear un repositorio</h2>
<p>Un <strong>repositorio</strong> (o "repo") es una carpeta que Git está vigilando. Para convertir cualquier carpeta en un repositorio:</p>
<pre><code>cd mi-proyecto
git init</code></pre>
<p>Esto crea una carpeta oculta llamada <code>.git</code> dentro de tu proyecto — ahí es donde Git guarda TODO el historial. Si borras esa carpeta, borras el historial completo (el proyecto en sí no se toca).</p>

<h2>El modelo de tres árboles</h2>
<p>Esto es lo más importante que vas a aprender en todo el curso — casi todos los comandos de Git mueven archivos entre estos tres lugares:</p>

<table>
<tr><th>Árbol</th><th>Qué es</th><th>Comando para ver qué hay ahí</th></tr>
<tr><td>📁 Directorio de trabajo</td><td>Los archivos tal como los ves y editas ahora mismo</td><td><code>git status</code></td></tr>
<tr><td>📋 Área de preparación (staging / index)</td><td>Los cambios que marcaste como "listos para el próximo commit"</td><td><code>git status</code></td></tr>
<tr><td>🗄️ Repositorio (historial)</td><td>Los commits ya guardados, permanentes</td><td><code>git log</code></td></tr>
</table>

<div class="example">
Piénsalo como empacar una maleta: el <strong>directorio de trabajo</strong> es tu cuarto desordenado, el <strong>área de preparación</strong> es la maleta abierta donde vas metiendo lo que sí te llevas, y el <strong>commit</strong> es cerrar la maleta y ponerle una etiqueta con la fecha. Puedes sacar y meter cosas de la maleta abierta cuantas veces quieras — solo queda "sellado" cuando haces commit.
</div>

<h2>git status: tu comando más usado</h2>
<p><code>git status</code> te dice en qué estado está cada archivo: si es nuevo, si tiene cambios sin guardar, si ya está en la maleta (staged) o si no ha cambiado. Vas a correr este comando decenas de veces al día — es completamente seguro, nunca cambia nada, solo informa.</p>
<pre><code>git status</code></pre>

<div class="tip">
💡 Justo después de <code>git init</code>, corre <code>git status</code> — vas a ver el mensaje "No commits yet" y una lista de archivos "untracked" (que Git ve, pero todavía no está seguido). Es normal, es tu punto de partida.
</div>
`,
    exercises: [],
    resources: [],
    terminalSim: {
      title: 'Simulador: tu primer repositorio',
      intro: 'Practica los dos primeros comandos de cualquier proyecto con Git. Escribe el comando exacto y presiona Ejecutar (o Enter).',
      checkpoints: [
        {
          instruction: 'Convierte esta carpeta en un repositorio de Git.',
          placeholder: 'git init',
          pattern: '^git\\s+init\\s*$',
          hint: 'El comando es exactamente: git init',
          success: '¡Listo! Se creó la carpeta oculta .git — este proyecto ya tiene historial.',
        },
        {
          instruction: 'Ahora revisa el estado del repositorio.',
          placeholder: 'git status',
          pattern: '^git\\s+status\\s*$',
          hint: 'El comando es exactamente: git status',
          success: 'Git te muestra que no hay commits todavía, y qué archivos ve en tu carpeta.',
        },
      ],
    },
    quiz: {
      question: '¿Qué diferencia hay entre el "área de preparación" (staging) y el "directorio de trabajo"?',
      options: [
        'Son lo mismo',
        'El directorio de trabajo son tus archivos actuales; el área de preparación son los cambios que ya marcaste para el próximo commit',
        'El área de preparación es donde vive el historial completo',
        'El directorio de trabajo solo existe después de hacer commit',
      ],
      correctIndex: 1,
    },
  },

  // ── 5. add y commit (+ terminal) ────────────────────────────────────────
  {
    id: 5,
    order: 5,
    type: 'text',
    title: 'Guardando cambios: add y commit',
    description: 'Cómo pasar cambios del directorio de trabajo al historial permanente.',
    content: `
<h2>git add: manda archivos a la "maleta"</h2>
<p><code>git add</code> mueve cambios del directorio de trabajo al área de preparación — le dice a Git "este cambio sí quiero que quede en el próximo commit".</p>
<pre><code>git add archivo.txt          # un archivo específico
git add carpeta/              # todo dentro de una carpeta
git add .                     # TODO lo que cambió en el proyecto</code></pre>

<div class="warn">
⚠️ <code>git add .</code> es cómodo, pero agrega literalmente todo — incluyendo archivos que quizás no querías subir (contraseñas, carpetas pesadas como <code>node_modules</code>). En la próxima clase vas a aprender <code>.gitignore</code> para evitar esto de raíz.
</div>

<h2>git commit: sella la maleta</h2>
<p><code>git commit</code> toma todo lo que está en el área de preparación y lo guarda permanentemente en el historial, con un mensaje que explica qué cambiaste.</p>
<pre><code>git commit -m "Agrega la página de inicio"</code></pre>

<p>El flag <code>-m</code> (de "message") te deja escribir el mensaje directo en la línea de comandos. Sin él, Git abre tu editor de texto configurado para que escribas un mensaje más largo.</p>

<h2>Cómo escribir un buen mensaje de commit</h2>
<div class="example">
<strong>✅ Bueno:</strong> <code>"Corrige el cálculo de impuestos en el carrito"</code> — específico, en modo imperativo (como una orden), explica el <em>qué</em>.<br/><br/>
<strong>❌ Malo:</strong> <code>"cambios"</code>, <code>"asdf"</code>, <code>"arreglos varios"</code> — no dicen nada útil dentro de 3 meses, cuando necesites encontrar exactamente ese cambio.
</div>

<h2>git log: el historial completo</h2>
<pre><code>git log</code></pre>
<p>Muestra cada commit: su identificador único (hash), autor, fecha y mensaje. Para una versión más compacta:</p>
<pre><code>git log --oneline</code></pre>

<div class="tip">
💡 El "hash" de un commit (algo como <code>a1b2c3d</code>) es su identificador único — lo vas a usar en varios comandos más adelante (checkout, revert, cherry-pick) para referirte a un commit específico.
</div>
`,
    exercises: [],
    resources: [],
    terminalSim: {
      title: 'Simulador: guarda tu primer cambio',
      intro: 'Ya tienes un archivo nuevo llamado README.md en tu directorio de trabajo. Guárdalo en el historial.',
      checkpoints: [
        {
          instruction: 'Agrega README.md al área de preparación.',
          placeholder: 'git add README.md',
          pattern: '^git\\s+add\\s+(readme\\.md|\\.)\\s*$',
          hint: 'Usa: git add README.md (o git add . para agregar todo)',
          success: 'README.md ya está en el área de preparación, listo para el commit.',
        },
        {
          instruction: 'Haz el commit con el mensaje "Agrega README inicial".',
          placeholder: 'git commit -m "Agrega README inicial"',
          pattern: '^git\\s+commit\\s+-m\\s+.+$',
          hint: 'Usa: git commit -m "Agrega README inicial" (el mensaje puede ir entre comillas simples o dobles)',
          success: '¡Tu primer commit quedó guardado para siempre en el historial!',
        },
        {
          instruction: 'Confirma que quedó guardado revisando el historial.',
          placeholder: 'git log --oneline',
          pattern: '^git\\s+log(\\s+--oneline)?\\s*$',
          hint: 'Usa: git log --oneline',
          success: 'Ahí está tu commit, con su hash único y tu mensaje.',
        },
      ],
    },
    quiz: {
      question: '¿Qué hace `git add archivo.txt`?',
      options: [
        'Crea un archivo nuevo llamado archivo.txt',
        'Guarda el archivo permanentemente en el historial',
        'Mueve los cambios de archivo.txt al área de preparación, listos para el próximo commit',
        'Sube el archivo a GitHub',
      ],
      correctIndex: 2,
    },
  },

  // ── 6. Historial y diffs (+ terminal) ───────────────────────────────────
  {
    id: 6,
    order: 6,
    type: 'text',
    title: 'Viajando en el tiempo: historial y diffs',
    description: 'Explora qué cambió, cuándo y por qué — sin tocar nada.',
    content: `
<h2>git log: variantes útiles</h2>
<pre><code>git log                    # historial completo, detallado
git log --oneline          # una línea por commit
git log --oneline --graph  # con un diagrama de ramas en ASCII
git log -3                 # solo los últimos 3 commits
git log --author="Ana"     # solo commits de una persona
git log archivo.txt        # solo commits que tocaron ese archivo</code></pre>

<h2>git diff: ¿qué cambió exactamente?</h2>
<p><code>git diff</code> muestra línea por línea qué se agregó (en verde, con <code>+</code>) y qué se quitó (en rojo, con <code>-</code>) entre dos versiones.</p>
<pre><code>git diff                   # cambios sin agregar (working vs staging)
git diff --staged          # cambios ya en el área de preparación (staging vs último commit)
git diff commit1 commit2   # entre dos commits específicos</code></pre>

<div class="example">
Ejemplo de salida de <code>git diff</code>:
<pre><code>-const PRECIO = 100
+const PRECIO = 150</code></pre>
Te dice exactamente: la línea con <code>100</code> se quitó, la línea con <code>150</code> se agregó — sin tener que adivinar qué cambió leyendo el archivo completo.
</div>

<h2>git show: el contenido de un commit específico</h2>
<pre><code>git show a1b2c3d</code></pre>
<p>Muestra el mensaje, autor, fecha, y el diff completo de ese commit — útil cuando encuentras un commit interesante en <code>git log</code> y quieres ver exactamente qué cambió ahí.</p>

<div class="tip">
💡 No necesitas memorizar el hash completo — los primeros 6-7 caracteres casi siempre son suficientes para que Git identifique el commit sin ambigüedad.
</div>
`,
    exercises: [],
    resources: [],
    terminalSim: {
      title: 'Simulador: investiga el historial',
      intro: 'Practica revisando cambios sin modificar nada — estos comandos son 100% seguros.',
      checkpoints: [
        {
          instruction: 'Mira el historial completo, uno por línea.',
          placeholder: 'git log --oneline',
          pattern: '^git\\s+log\\s+--oneline\\s*$',
          hint: 'Usa: git log --oneline',
          success: 'Ahí tienes cada commit en una sola línea, con su hash y mensaje.',
        },
        {
          instruction: 'Ahora revisa qué cambios tienes sin guardar todavía.',
          placeholder: 'git diff',
          pattern: '^git\\s+diff\\s*$',
          hint: 'Usa: git diff (sin nada más)',
          success: 'Git te muestra línea por línea qué cambió desde el último commit.',
        },
      ],
    },
    quiz: {
      question: '¿Qué diferencia hay entre `git diff` y `git diff --staged`?',
      options: [
        'No hay ninguna diferencia',
        '`git diff` muestra cambios sin preparar; `git diff --staged` muestra los que ya están en el área de preparación',
        '`git diff --staged` sube los cambios a GitHub',
        '`git diff` solo funciona después de hacer commit',
      ],
      correctIndex: 1,
    },
  },

  // ── 7. Deshaciendo cambios (+ terminal) ─────────────────────────────────
  {
    id: 7,
    order: 7,
    type: 'text',
    title: 'Deshaciendo cambios: la clase que te va a salvar más de una vez',
    description: 'checkout, restore, reset y revert — cuándo usar cada uno.',
    content: `
<h2>No todo "deshacer" es igual</h2>
<p>Esta es probablemente la clase más importante del curso en términos prácticos — casi todo el mundo comete un error y necesita deshacerlo. Git te da varias herramientas, y cada una hace algo distinto.</p>

<table>
<tr><th>Quiero...</th><th>Comando</th></tr>
<tr><td>Descartar cambios sin guardar en un archivo (volver a como estaba en el último commit)</td><td><code>git restore archivo.txt</code></td></tr>
<tr><td>Sacar un archivo del área de preparación (sin perder el cambio, solo "desempacar la maleta")</td><td><code>git restore --staged archivo.txt</code></td></tr>
<tr><td>Deshacer commits, pero conservar los cambios como si nunca los hubieras guardado</td><td><code>git reset --soft HEAD~1</code></td></tr>
<tr><td>Deshacer commits Y todos los cambios, sin dejar rastro</td><td><code>git reset --hard HEAD~1</code></td></tr>
<tr><td>Deshacer un commit ya compartido con otros, sin reescribir el historial</td><td><code>git revert a1b2c3d</code></td></tr>
</table>

<div class="warn">
⚠️ <code>git reset --hard</code> BORRA cambios de verdad, sin posibilidad fácil de recuperarlos. Nunca lo uses si no estás seguro de que quieres perder ese trabajo. Cuando tengas dudas, usa <code>--soft</code> primero — siempre puedes ser más drástico después, pero no al revés.
</div>

<h2>reset vs. revert: la diferencia que más confunde</h2>
<div class="example">
<strong>git reset</strong> mueve el puntero de tu rama hacia atrás en el tiempo, como si esos commits nunca hubieran existido — <strong>reescribe el historial</strong>. Solo es seguro usarlo en commits que TÚ tienes localmente y que nadie más ya descargó.<br/><br/>
<strong>git revert</strong> crea un commit NUEVO que deshace los cambios de uno anterior — el historial queda intacto, solo se agrega una entrada nueva que dice "deshice esto". Es seguro usarlo incluso en commits que ya compartiste con tu equipo.
</div>

<div class="tip">
💡 Regla práctica: si el commit que quieres deshacer ya lo subiste a GitHub y alguien más pudo haberlo descargado, usa <code>revert</code>. Si es un commit que solo existe en tu computadora, <code>reset</code> es más limpio.
</div>

<h2>El "modo pánico": recuperar algo que crees perdido</h2>
<p>Git casi nunca borra algo de verdad hasta pasado un buen tiempo. El comando <code>git reflog</code> muestra un historial de TODO lo que hiciste (incluyendo commits "perdidos" por un reset) — en la mayoría de los casos, sí puedes recuperar algo con esto, incluso después de un <code>reset --hard</code>.</p>
`,
    exercises: [],
    resources: [],
    terminalSim: {
      title: 'Simulador: deshaz un cambio a tiempo',
      intro: 'Editaste un archivo por error y quieres volver a como estaba en el último commit.',
      checkpoints: [
        {
          instruction: 'Descarta los cambios sin guardar de config.txt (vuelve a la última versión guardada).',
          placeholder: 'git restore config.txt',
          pattern: '^git\\s+restore\\s+config\\.txt\\s*$',
          hint: 'Usa: git restore config.txt',
          success: 'config.txt volvió exactamente a como estaba en el último commit.',
        },
        {
          instruction: 'Ahora deshaz el último commit por completo, pero conserva los cambios en tu directorio de trabajo (por si los quieres reacomodar).',
          placeholder: 'git reset --soft HEAD~1',
          pattern: '^git\\s+reset\\s+--soft\\s+head~?1\\s*$',
          hint: 'Usa: git reset --soft HEAD~1 (con guion medio antes de "soft")',
          success: 'El commit se deshizo, pero tus cambios siguen ahí, listos para volver a guardarse cuando quieras.',
        },
      ],
    },
    quiz: {
      question: 'Ya subiste un commit a GitHub y tu equipo lo descargó. ¿Qué comando deberías usar para deshacerlo?',
      options: [
        'git reset --hard',
        'git revert, porque no reescribe un historial que otros ya tienen',
        'git restore',
        'Borrar el repositorio y empezar de nuevo',
      ],
      correctIndex: 1,
    },
  },

  // ── 8. Ramas (+ terminal) ───────────────────────────────────────────────
  {
    id: 8,
    order: 8,
    type: 'text',
    title: 'Ramas: universos paralelos de tu código',
    description: 'Prueba ideas sin arriesgar tu código que ya funciona.',
    content: `
<h2>¿Qué es una rama?</h2>
<p>Una <strong>rama</strong> (branch) es una línea de desarrollo independiente. Cuando creas una rama, obtienes una copia del proyecto en ese punto exacto — puedes hacer commits ahí sin que le pase nada a la rama de la que saliste, normalmente llamada <code>main</code> (antes se llamaba <code>master</code>).</p>

<div class="example">
Imagina que estás escribiendo un libro. <code>main</code> es la versión publicada. Cada vez que quieres probar un capítulo nuevo sin arriesgar la versión ya publicada, sacas una copia, escribes ahí libremente, y solo si te gusta el resultado lo incorporas de vuelta al libro oficial. Esa copia es una rama.
</div>

<h2>Comandos básicos</h2>
<pre><code>git branch                      # lista tus ramas (la actual con un *)
git branch nueva-funcion        # crea una rama nueva (sin moverte a ella)
git switch nueva-funcion        # te mueves a esa rama
git switch -c otra-rama         # crea Y te mueve a la rama, en un solo paso
git branch -d nombre-rama       # borra una rama ya fusionada</code></pre>

<div class="tip">
💡 <code>git checkout -b nombre</code> hace lo mismo que <code>git switch -c nombre</code> — <code>checkout</code> es el comando viejo (todavía funciona y lo vas a ver en tutoriales antiguos), <code>switch</code> es la versión más nueva y clara, pensada solo para cambiar de rama (checkout hacía demasiadas cosas distintas a la vez).
</div>

<h2>¿Por qué ramificar en vez de solo hacer commits en main?</h2>
<ul>
<li><strong>Aíslas trabajo en progreso</strong> — mientras desarrollas una función a medias, <code>main</code> sigue estable y funcionando.</li>
<li><strong>Permite trabajo paralelo</strong> — tú y un compañero pueden trabajar en cosas distintas sin pisarse.</li>
<li><strong>Facilita el review</strong> — una rama completa se puede revisar como una unidad antes de incorporarla (esto es exactamente lo que es un Pull Request en GitHub, que verás más adelante).</li>
</ul>

<h2>HEAD: dónde estás parado ahora mismo</h2>
<p><code>HEAD</code> es un puntero que indica en qué rama (y en qué commit) estás parado en este momento. Cuando cambias de rama con <code>switch</code>, HEAD se mueve con vos. Vas a ver <code>HEAD</code> mencionado en muchos comandos (<code>HEAD~1</code> significa "un commit antes de donde estoy ahora").</p>
`,
    exercises: [],
    resources: [],
    terminalSim: {
      title: 'Simulador: crea tu primera rama',
      intro: 'Vas a experimentar con una función nueva sin tocar main.',
      checkpoints: [
        {
          instruction: 'Crea una rama nueva llamada "modo-oscuro" y muévete a ella en un solo paso.',
          placeholder: 'git switch -c modo-oscuro',
          pattern: '^git\\s+(switch\\s+-c|checkout\\s+-b)\\s+[\\w-]+\\s*$',
          hint: 'Usa: git switch -c modo-oscuro (o git checkout -b modo-oscuro)',
          success: 'Ya estás parado en la rama "modo-oscuro" — main sigue intacta.',
        },
        {
          instruction: 'Confirma en qué rama estás ahora mismo.',
          placeholder: 'git branch',
          pattern: '^git\\s+branch\\s*$',
          hint: 'Usa: git branch (sin nada más)',
          success: 'Ahí ves la lista de ramas, con un asterisco junto a "modo-oscuro".',
        },
      ],
    },
    quiz: {
      question: '¿Qué le pasa a la rama "main" cuando haces commits en otra rama?',
      options: [
        'Se borra automáticamente',
        'Nada — main sigue exactamente igual hasta que decidas fusionar los cambios',
        'Se actualiza en tiempo real con los mismos cambios',
        'Se bloquea hasta que termines',
      ],
      correctIndex: 1,
    },
  },

  // ── 9. Merge (+ terminal) ───────────────────────────────────────────────
  {
    id: 9,
    order: 9,
    type: 'text',
    title: 'Merge: fusionando el trabajo de dos ramas',
    description: 'Cómo incorporar una rama de vuelta, y qué hacer cuando hay un conflicto.',
    content: `
<h2>git merge: junta dos historiales</h2>
<p>Cuando terminas de trabajar en una rama y quieres incorporar esos cambios de vuelta a otra (normalmente <code>main</code>), usas <code>merge</code>. Primero te mueves a la rama que RECIBE los cambios, luego fusionas la otra hacia ella:</p>
<pre><code>git switch main
git merge modo-oscuro</code></pre>

<h2>Dos tipos de merge</h2>
<div class="example">
<strong>Fast-forward:</strong> si <code>main</code> no tuvo ningún commit nuevo desde que creaste tu rama, Git simplemente mueve el puntero de <code>main</code> hacia adelante — no hay nada que "combinar" de verdad, es directo.<br/><br/>
<strong>Merge de 3 vías:</strong> si ambas ramas avanzaron por separado, Git crea un <strong>commit de merge</strong> nuevo que tiene dos padres — junta ambos historiales en uno.
</div>

<h2>Conflictos de merge: cuando Git no puede decidir por ti</h2>
<p>Un conflicto pasa cuando las dos ramas cambiaron <em>la misma línea</em> de un archivo de formas distintas — Git no sabe cuál versión es la correcta, así que te lo pregunta a ti. El archivo queda así:</p>
<pre><code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
const color = "azul"
=======
const color = "verde"
&gt;&gt;&gt;&gt;&gt;&gt;&gt; modo-oscuro</code></pre>

<p>Para resolverlo:</p>
<ol>
<li>Abre el archivo y decide qué versión (o combinación) quieres dejar.</li>
<li>Borra las marcas <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code> y <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> — no son parte del código, solo indican dónde está el conflicto.</li>
<li>Guarda el archivo, y márcalo como resuelto con <code>git add archivo.txt</code>.</li>
<li>Termina el merge con <code>git commit</code> (sin <code>-m</code>, Git ya prepara un mensaje por defecto).</li>
</ol>

<div class="tip">
💡 Un conflicto de merge NO es un error grave ni algo que estés haciendo mal — es completamente normal en cualquier equipo, y significa que Git está siendo cuidadoso en vez de adivinar cuál cambio es "el correcto".
</div>

<div class="warn">
⚠️ Si un merge se pone confuso a medio camino y quieres empezar de nuevo, <code>git merge --abort</code> cancela el merge y te regresa exactamente a como estabas antes de empezarlo.
</div>
`,
    exercises: [],
    resources: [],
    terminalSim: {
      title: 'Simulador: fusiona tu rama',
      intro: 'Terminaste tu trabajo en "modo-oscuro" y quieres incorporarlo a main.',
      checkpoints: [
        {
          instruction: 'Muévete de vuelta a la rama main.',
          placeholder: 'git switch main',
          pattern: '^git\\s+(switch|checkout)\\s+main\\s*$',
          hint: 'Usa: git switch main',
          success: 'Estás de vuelta en main.',
        },
        {
          instruction: 'Fusiona la rama "modo-oscuro" hacia main.',
          placeholder: 'git merge modo-oscuro',
          pattern: '^git\\s+merge\\s+[\\w-]+\\s*$',
          hint: 'Usa: git merge modo-oscuro',
          success: '¡Listo! Los cambios de "modo-oscuro" ya son parte de main.',
        },
      ],
    },
    quiz: {
      question: 'Durante un conflicto de merge, ¿qué significan las marcas `<<<<<<<`, `=======` y `>>>>>>>`?',
      options: [
        'Son un error de Git que hay que reportar',
        'Marcan dónde las dos versiones difieren, para que decidas cuál (o cuáles) conservar',
        'Hay que dejarlas en el código para que Git funcione',
        'Indican que el archivo se corrompió',
      ],
      correctIndex: 1,
    },
  },

  // ── 10. Rebase ───────────────────────────────────────────────────────────
  {
    id: 10,
    order: 10,
    type: 'text',
    title: 'Rebase: reescribiendo la historia (con cuidado)',
    description: 'La alternativa a merge que deja un historial más limpio — y su regla de oro.',
    content: `
<h2>git rebase: la otra forma de combinar ramas</h2>
<p><code>rebase</code> hace básicamente lo mismo que <code>merge</code> — incorpora el trabajo de una rama en otra — pero de forma distinta: en vez de crear un commit de merge con dos padres, <strong>reescribe</strong> tus commits como si los hubieras hecho a partir del último punto de la otra rama. El resultado es un historial lineal, sin bifurcaciones.</p>
<pre><code>git switch modo-oscuro
git rebase main</code></pre>

<div class="example">
<strong>Antes del rebase:</strong> tu rama y main se separaron en algún punto y avanzaron por caminos distintos (una "Y" en el historial).<br/>
<strong>Después del rebase:</strong> es como si hubieras empezado a trabajar justo desde el commit más reciente de main — una línea recta, sin bifurcación.
</div>

<h2>merge vs. rebase: ¿cuál usar?</h2>
<table>
<tr><th></th><th>merge</th><th>rebase</th></tr>
<tr><td>Historial resultante</td><td>Con bifurcaciones, muestra exactamente cómo pasó</td><td>Lineal, más fácil de leer</td></tr>
<tr><td>¿Reescribe commits?</td><td>No — nunca cambia commits existentes</td><td>Sí — crea copias nuevas de tus commits con hashes distintos</td></tr>
<tr><td>¿Seguro en ramas compartidas?</td><td>Siempre</td><td>Solo en ramas que nadie más descargó todavía</td></tr>
</table>

<div class="bad">
🚫 <strong>La regla de oro del rebase:</strong> nunca hagas rebase de una rama que ya compartiste con otras personas (que ya subiste a GitHub y alguien más descargó). Como rebase reescribe los commits (les cambia el hash), a cualquiera que ya tenía la versión vieja se le va a complicar mucho sincronizar — es una de las pocas reglas de Git que casi nadie rompe a propósito.
</div>

<div class="tip">
💡 Uso típico y seguro: mientras trabajas solo en tu propia rama (que nadie más descargó todavía), <code>git rebase main</code> de vez en cuando mantiene tu rama al día con los cambios más recientes de main, con un historial limpio. Una vez que la compartes (por ejemplo, abriendo un Pull Request), deja de hacer rebase de ella.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es la "regla de oro" del rebase?',
      options: [
        'Nunca usar rebase, bajo ninguna circunstancia',
        'Nunca hacer rebase de una rama que ya compartiste con otras personas',
        'Siempre usar rebase en vez de merge',
        'Rebase solo funciona en la rama main',
      ],
      correctIndex: 1,
    },
  },

  // ── 11. .gitignore y buenas prácticas ───────────────────────────────────
  {
    id: 11,
    order: 11,
    type: 'text',
    title: '.gitignore y buenas prácticas de commits',
    description: 'Qué NO debe entrar nunca a tu repositorio, y cómo mantener un historial que se entienda.',
    content: `
<h2>.gitignore: dile a Git qué ignorar</h2>
<p>No todo lo que hay en tu carpeta de proyecto debería guardarse en el historial: contraseñas, archivos generados automáticamente, carpetas de dependencias enormes (como <code>node_modules</code>). Un archivo llamado <code>.gitignore</code> en la raíz del proyecto le dice a Git qué ignorar por completo.</p>
<pre><code># .gitignore
node_modules/
.env
*.log
dist/
.DS_Store</code></pre>

<table>
<tr><th>Patrón</th><th>Qué ignora</th></tr>
<tr><td><code>node_modules/</code></td><td>Esa carpeta completa, en cualquier nivel</td></tr>
<tr><td><code>*.log</code></td><td>Cualquier archivo que termine en .log</td></tr>
<tr><td><code>.env</code></td><td>Ese archivo exacto (típicamente tiene contraseñas/claves)</td></tr>
<tr><td><code>!importante.log</code></td><td>Una excepción — SÍ incluir este, aunque el patrón de arriba lo ignore</td></tr>
</table>

<div class="bad">
🚫 Nunca subas contraseñas, API keys o tokens a un repositorio — incluso si luego los borras, quedan en el historial para siempre (a menos que reescribas todo el historial, algo delicado). Usa <code>.gitignore</code> desde el primer commit, no después.
</div>

<div class="tip">
💡 github.com/github/gitignore tiene plantillas de <code>.gitignore</code> ya armadas para casi cualquier lenguaje/framework — no hace falta escribir el tuyo desde cero cada vez.
</div>

<h2>Buenas prácticas de commits</h2>
<ul>
<li><strong>Commits pequeños y frecuentes</strong> en vez de uno gigante al final del día — cada commit debería representar UN cambio lógico, fácil de entender y de revertir si hace falta.</li>
<li><strong>Mensajes en modo imperativo</strong>: "Agrega validación de correo" en vez de "Agregué" o "Agregando" — es la convención que usa el propio Git (por ejemplo, en "Merge branch...").</li>
<li><strong>No mezcles cambios sin relación</strong> en un solo commit — si arreglaste un bug Y agregaste una función nueva, son dos commits distintos.</li>
</ul>

<h2>Commits convencionales (Conventional Commits)</h2>
<p>Muchos equipos siguen un formato estándar para que el historial se pueda leer (e incluso procesar automáticamente):</p>
<pre><code>feat: agrega inicio de sesión con Google
fix: corrige el cálculo de impuestos
docs: actualiza el README con instrucciones de instalación
refactor: simplifica la función de validación</code></pre>
<p>El prefijo (<code>feat</code>, <code>fix</code>, <code>docs</code>, <code>refactor</code>, <code>test</code>, <code>chore</code>...) dice de inmediato qué TIPO de cambio es, sin tener que leer el diff completo.</p>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Por qué es importante agregar `.env` a tu `.gitignore` desde el primer commit?',
      options: [
        'Porque Git no puede leer archivos que empiezan con punto',
        'Porque suele contener contraseñas/claves, y una vez en el historial son difíciles de quitar de verdad',
        'Porque ocupa mucho espacio',
        'No es realmente necesario',
      ],
      correctIndex: 1,
    },
  },

  // ── 12. GitHub: remote, push, pull, clone (+ terminal) ──────────────────
  {
    id: 12,
    order: 12,
    type: 'text',
    title: 'GitHub: tu código en la nube',
    description: 'Conecta tu repositorio local con un repositorio remoto en GitHub.',
    content: `
<h2>Git vs. GitHub, otra vez</h2>
<p>Ya lo mencionamos antes, pero ahora lo vas a vivir: <strong>Git</strong> es la herramienta que corre en tu computadora y lleva el historial. <strong>GitHub</strong> es un servicio en internet donde puedes alojar una copia de ese repositorio — para respaldarlo, compartirlo, o colaborar con otras personas. GitHub no es la única opción (existen GitLab, Bitbucket...), pero es la más usada del mundo.</p>

<h2>Conectar un repositorio local con GitHub</h2>
<p>Primero creas un repositorio vacío en github.com (botón "New repository"). Luego, desde tu proyecto local:</p>
<pre><code>git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main</code></pre>

<table>
<tr><th>Comando</th><th>Qué hace</th></tr>
<tr><td><code>git remote add origin URL</code></td><td>Le dice a tu repo local dónde está la copia remota, con el apodo "origin" (el nombre por convención, pero podría ser cualquier otro)</td></tr>
<tr><td><code>git push</code></td><td>Sube tus commits locales al remoto</td></tr>
<tr><td><code>git pull</code></td><td>Descarga y fusiona los cambios del remoto hacia tu rama local</td></tr>
<tr><td><code>git clone URL</code></td><td>Descarga un repositorio completo (con todo su historial) por primera vez, en una carpeta nueva</td></tr>
</table>

<div class="example">
<code>git clone</code> es lo que usas UNA vez, al empezar a trabajar en un proyecto que ya existe. <code>git pull</code> es lo que usas TODOS LOS DÍAS después, para traer los cambios nuevos que subieron tus compañeros.
</div>

<h2>HTTPS vs. SSH</h2>
<p>Hay dos formas de conectarte a GitHub: con una URL HTTPS (te pide usuario/token cada vez, o lo guarda con un gestor de credenciales) o con una llave SSH (configuras una vez, y luego nunca más te pide contraseña). Para empezar, HTTPS es más simple; SSH vale la pena configurarlo cuando ya trabajas con Git todos los días.</p>

<div class="warn">
⚠️ Desde 2021, GitHub ya no acepta tu contraseña normal para <code>git push</code> por HTTPS — necesitas un "Personal Access Token" (se genera desde tu configuración de GitHub) o SSH.
</div>

<h2>git fetch vs. git pull</h2>
<p><code>git fetch</code> descarga los cambios del remoto, pero NO los fusiona a tu rama actual — te deja revisarlos primero. <code>git pull</code> hace ambas cosas de un jalón: <code>fetch</code> + <code>merge</code>.</p>
`,
    exercises: [],
    resources: [],
    terminalSim: {
      title: 'Simulador: sube tu proyecto a GitHub',
      intro: 'Ya creaste un repositorio vacío en github.com llamado "mi-proyecto". Conéctalo y sube tu primer commit.',
      checkpoints: [
        {
          instruction: 'Conecta tu repositorio local con el remoto en GitHub (usa cualquier URL de ejemplo).',
          placeholder: 'git remote add origin https://github.com/tu-usuario/mi-proyecto.git',
          pattern: '^git\\s+remote\\s+add\\s+origin\\s+\\S+\\s*$',
          hint: 'Usa: git remote add origin <url-de-tu-repositorio>',
          success: 'Tu repositorio local ya sabe dónde está su copia remota, con el apodo "origin".',
        },
        {
          instruction: 'Sube tu rama main al remoto por primera vez.',
          placeholder: 'git push -u origin main',
          pattern: '^git\\s+push\\s+-u\\s+origin\\s+main\\s*$',
          hint: 'Usa: git push -u origin main (-u recuerda esta conexión para la próxima vez)',
          success: '¡Tu código ya está en GitHub! Las próximas veces, con "git push" alcanza.',
        },
      ],
    },
    quiz: {
      question: '¿Cuándo usas `git clone` en vez de `git pull`?',
      options: [
        'clone es para todos los días; pull solo la primera vez',
        'pull es para todos los días; clone solo la primera vez, para descargar un repositorio completo',
        'Son exactamente lo mismo',
        'clone solo funciona sin internet',
      ],
      correctIndex: 1,
    },
  },

  // ── 13. Colaboración real: PRs e Issues ─────────────────────────────────
  {
    id: 13,
    order: 13,
    type: 'text',
    title: 'Colaboración real: Pull Requests e Issues',
    description: 'Cómo se trabaja en equipo de verdad sobre un mismo proyecto de GitHub.',
    content: `
<h2>El flujo de un Pull Request (PR)</h2>
<p>Un <strong>Pull Request</strong> es una propuesta: "aquí está el trabajo que hice en mi rama, revísenlo, y si les parece bien, incorpórenlo a main". Es la forma estándar de colaborar en GitHub — casi nadie hace push directo a main en un proyecto en equipo.</p>
<ol>
<li>Creas una rama nueva para tu cambio (nunca trabajas directo en main).</li>
<li>Haces tus commits ahí, y los subes con <code>git push</code>.</li>
<li>En GitHub, abres un Pull Request desde tu rama hacia main.</li>
<li>Tus compañeros revisan el código, dejan comentarios, piden cambios si hace falta.</li>
<li>Cuando todos están de acuerdo, alguien aprueba y fusiona (merge) el PR.</li>
</ol>

<div class="example">
El nombre "Pull Request" viene de pedirle a alguien "por favor, trae (pull) mis cambios hacia tu rama" — es literalmente una solicitud, no algo automático.
</div>

<h2>Fork: tu propia copia de un proyecto ajeno</h2>
<p>Si quieres contribuir a un proyecto donde no tienes permiso de escritura directo (por ejemplo, un proyecto de código abierto de otra persona), primero haces un <strong>fork</strong>: una copia completa del repositorio en tu propia cuenta. Trabajas ahí libremente, y cuando quieres proponer tus cambios al proyecto original, abres un Pull Request desde tu fork hacia el repositorio original.</p>

<h2>Issues: donde vive la conversación sobre el proyecto</h2>
<p>Un <strong>Issue</strong> es un ticket — un bug reportado, una idea de función nueva, una pregunta. No es código, es la conversación alrededor del código. Los Issues se pueden etiquetar (<code>bug</code>, <code>enhancement</code>, <code>question</code>), asignar a una persona, y vincular a un Pull Request que los resuelve (escribiendo <code>Closes #12</code> en la descripción del PR, por ejemplo).</p>

<h2>Code Review: la cultura detrás del PR</h2>
<div class="tip">
💡 Un buen code review no busca "atrapar" errores de forma agresiva — busca que dos (o más) personas entiendan el cambio, detecten problemas temprano (más barato arreglarlos ahora que en producción), y compartan conocimiento del proyecto. Recibir comentarios en tu PR es normal y esperado, no una señal de que hiciste algo mal.
</div>

<h2>GitHub Projects (breve mención)</h2>
<p>GitHub también incluye tableros tipo Kanban (Projects) para organizar Issues y Pull Requests visualmente por estado — "Por hacer", "En progreso", "Listo". Útil para ver de un vistazo en qué está trabajando el equipo.</p>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Para qué sirve hacer un "fork" de un repositorio?',
      options: [
        'Para borrar el proyecto original',
        'Para obtener tu propia copia de un proyecto donde no tienes permiso de escritura directo, y así poder proponer cambios',
        'Es lo mismo que clonar',
        'Solo lo usan los administradores de GitHub',
      ],
      correctIndex: 1,
    },
  },

  // ── 14. Estrategias de equipo ────────────────────────────────────────────
  {
    id: 14,
    order: 14,
    type: 'text',
    title: 'Trabajo en equipo sin pisarse los pies',
    description: 'Git Flow, GitHub Flow, trunk-based — cómo organiza sus ramas un equipo real.',
    content: `
<h2>¿Por qué necesitas una estrategia de ramas?</h2>
<p>Ya sabes crear y fusionar ramas — lo que falta es un acuerdo de equipo sobre CÓMO se usan: qué rama es la "verdad" del proyecto, cuándo se crea una rama nueva, cuándo se borra. Sin ese acuerdo, cada quien improvisa y el historial se vuelve un caos.</p>

<h2>GitHub Flow: el más simple, el más común hoy</h2>
<div class="example">
<ol>
<li><code>main</code> siempre está lista para producción.</li>
<li>Para cualquier cambio, creas una rama con un nombre descriptivo (<code>agrega-login</code>, <code>arregla-bug-carrito</code>).</li>
<li>Abres un Pull Request apenas tengas algo que mostrar (incluso a medias) — así el equipo ve el progreso.</li>
<li>Cuando el PR se aprueba, se fusiona a main y se despliega.</li>
</ol>
</div>
<p>Es el flujo por defecto de la mayoría de los proyectos modernos en GitHub — simple, pocas reglas, funciona bien con despliegues frecuentes.</p>

<h2>Git Flow: más estructura, para versiones con releases planeadas</h2>
<p>Usa varias ramas de larga duración con roles específicos:</p>
<table>
<tr><th>Rama</th><th>Propósito</th></tr>
<tr><td><code>main</code></td><td>Solo versiones publicadas oficialmente</td></tr>
<tr><td><code>develop</code></td><td>Integración del trabajo en progreso para la próxima versión</td></tr>
<tr><td><code>feature/*</code></td><td>Una función nueva, sale de develop y regresa a develop</td></tr>
<tr><td><code>release/*</code></td><td>Preparación final antes de publicar una versión</td></tr>
<tr><td><code>hotfix/*</code></td><td>Arreglo urgente directo sobre main, para producción</td></tr>
</table>
<p>Es más pesado que GitHub Flow — tiene sentido para software con versiones numeradas y ciclos de release largos (aplicaciones de escritorio, por ejemplo), menos para apps web que despliegan varias veces al día.</p>

<h2>Trunk-based development: el extremo simple</h2>
<p>Todo el mundo hace commits directo (o ramas MUY cortas, de horas) a una sola rama principal (el "trunk"). Depende mucho de pruebas automáticas robustas y "feature flags" (activar/desactivar funciones sin necesitar una rama separada) para no romper producción.</p>

<div class="tip">
💡 No hay una respuesta "correcta" universal — la estrategia correcta depende del tamaño del equipo, qué tan seguido despliegan, y qué tan maduras son sus pruebas automáticas. Para un equipo chico empezando, GitHub Flow casi siempre es la mejor opción por lo simple que es.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es la diferencia principal entre GitHub Flow y Git Flow?',
      options: [
        'No hay ninguna diferencia real',
        'GitHub Flow usa una sola rama principal + ramas cortas; Git Flow usa varias ramas de larga duración con roles específicos (develop, release, hotfix)',
        'Git Flow solo funciona en GitLab',
        'GitHub Flow no permite Pull Requests',
      ],
      correctIndex: 1,
    },
  },

  // ── 15. Video: flujo de trabajo diario ──────────────────────────────────
  {
    id: 15,
    order: 15,
    type: 'video',
    title: 'Tu flujo de trabajo diario con Git',
    description: 'Repaso práctico: el ciclo que vas a repetir todos los días como programador.',
    videoId: 'aqz-KE-bpKQ',
    exercises: [],
    resources: [],
    quiz: {
      question: 'En el ciclo diario típico de Git, ¿qué va primero?',
      options: [
        'git push',
        'git pull, para empezar el día con los cambios más recientes de tu equipo',
        'git rebase main siempre',
        'git init',
      ],
      correctIndex: 1,
    },
  },

  // ── 16. Git avanzado (+ terminal) ───────────────────────────────────────
  {
    id: 16,
    order: 16,
    type: 'text',
    title: 'Git avanzado: stash, cherry-pick y tags',
    description: 'Herramientas que vas a usar cada vez con más frecuencia según ganes experiencia.',
    content: `
<h2>git stash: guarda cambios a medias, sin comprometerlos</h2>
<p>Estás a medio cambio, y de repente necesitas cambiar de rama urgente (un bug crítico, por ejemplo) — pero no quieres hacer un commit incompleto. <code>git stash</code> guarda tus cambios sin guardar en un lugar temporal y limpia tu directorio de trabajo, para que puedas cambiar de rama libremente.</p>
<pre><code>git stash              # guarda los cambios actuales
git stash list         # ve todo lo que tienes guardado
git stash pop          # trae de vuelta el último stash, y lo borra de la lista
git stash apply        # trae de vuelta el último stash, pero lo conserva en la lista</code></pre>

<h2>git cherry-pick: trae UN commit específico de otra rama</h2>
<p>A veces no quieres fusionar una rama completa — solo quieres UN commit específico de ella. <code>cherry-pick</code> copia ese commit exacto a tu rama actual.</p>
<pre><code>git cherry-pick a1b2c3d</code></pre>
<div class="example">
Caso típico: arreglaste un bug crítico en una rama de desarrollo, y necesitas ese mismo arreglo YA en la rama de producción, sin traer todo lo demás que también está en desarrollo.
</div>

<h2>git tag: marca versiones importantes</h2>
<p>Un <strong>tag</strong> es una etiqueta permanente sobre un commit específico — típicamente se usa para marcar versiones publicadas (<code>v1.0.0</code>, <code>v2.1.3</code>).</p>
<pre><code>git tag v1.0.0                      # etiqueta el commit actual
git tag -a v1.0.0 -m "Primera versión estable"   # con mensaje
git push origin v1.0.0              # los tags no se suben solos, hay que subirlos aparte
git tag                             # lista todos los tags</code></pre>

<h2>Submódulos y hooks (mención breve)</h2>
<p>A medida que ganes experiencia, te vas a topar con dos conceptos más avanzados: <strong>submódulos</strong> (un repositorio de Git dentro de otro, para reusar un proyecto completo como dependencia) y <strong>hooks</strong> (scripts que Git corre automáticamente en momentos específicos, como antes de cada commit, para por ejemplo correr pruebas automáticas). No son parte del uso diario para la mayoría de la gente, pero vale la pena saber que existen cuando el proyecto los necesite.</p>
`,
    exercises: [],
    resources: [],
    terminalSim: {
      title: 'Simulador: guarda tu trabajo a medias',
      intro: 'Estás a medio cambio y necesitas cambiar de rama urgentemente.',
      checkpoints: [
        {
          instruction: 'Guarda tus cambios sin comprometerlos, para dejar el directorio limpio.',
          placeholder: 'git stash',
          pattern: '^git\\s+stash\\s*$',
          hint: 'Usa: git stash (sin nada más)',
          success: 'Tus cambios quedaron guardados a un lado — tu directorio de trabajo está limpio.',
        },
        {
          instruction: 'Ahora tráelos de vuelta.',
          placeholder: 'git stash pop',
          pattern: '^git\\s+stash\\s+pop\\s*$',
          hint: 'Usa: git stash pop',
          success: 'Tus cambios volvieron exactamente como los dejaste.',
        },
      ],
    },
    quiz: {
      question: '¿Para qué sirve `git cherry-pick`?',
      options: [
        'Para borrar un commit',
        'Para copiar UN commit específico de otra rama a la rama actual, sin traer todo lo demás',
        'Para crear una rama nueva',
        'Para deshacer todos los cambios',
      ],
      correctIndex: 1,
    },
  },

  // ── 17. Intro a GitHub Actions ───────────────────────────────────────────
  {
    id: 17,
    order: 17,
    type: 'text',
    title: 'Automatización: una primera mirada a GitHub Actions',
    description: 'Cómo hacer que GitHub corra tareas automáticamente en cada push.',
    content: `
<h2>¿Qué es CI/CD?</h2>
<p><strong>Integración continua</strong> (CI) significa correr pruebas automáticas cada vez que alguien sube código, para detectar problemas de inmediato. <strong>Despliegue continuo</strong> (CD) significa publicar automáticamente una nueva versión cuando el código pasa esas pruebas. GitHub Actions es la herramienta de GitHub para hacer ambas cosas.</p>

<h2>Un workflow básico</h2>
<p>Un <strong>workflow</strong> de GitHub Actions es un archivo YAML dentro de <code>.github/workflows/</code> que define qué hacer y cuándo:</p>
<pre><code>name: Pruebas
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm test</code></pre>

<p>Esto le dice a GitHub: "cada vez que alguien haga push, levanta una máquina con Ubuntu, descarga el código, instala las dependencias, y corre las pruebas". Si algo falla, el equipo se entera de inmediato — directo en el Pull Request, antes de fusionar nada.</p>

<div class="example">
Piénsalo como un compañero de equipo robótico que revisa cada cambio automáticamente, en segundos, sin cansarse ni saltarse pasos — no reemplaza el code review humano, lo complementa.
</div>

<h2>¿Por qué esto te importa, aunque no lo configures tú mismo todavía?</h2>
<ul>
<li>Vas a ver el "check" verde o rojo de Actions en casi cualquier Pull Request de un proyecto real — saber qué significa te ahorra confusión desde tu primer día en un equipo.</li>
<li>Es la puerta de entrada natural a DevOps, un área con mucha demanda laboral.</li>
<li>Automatizar lo repetitivo (pruebas, formato de código, despliegues) es una de las mejores inversiones de tiempo que puede hacer un equipo.</li>
</ul>

<div class="tip">
💡 No necesitas dominar YAML ni GitHub Actions para ser un buen programador — esta clase es solo para que reconozcas el concepto quePresentación seguro te vas a topar en cualquier repositorio profesional.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Qué hace un workflow de GitHub Actions como el del ejemplo (`on: [push]`)?',
      options: [
        'Borra el repositorio en cada push',
        'Corre automáticamente los pasos definidos (por ejemplo, pruebas) cada vez que alguien sube código',
        'Solo funciona si lo activas manualmente cada vez',
        'Reemplaza por completo la necesidad de hacer commits',
      ],
      correctIndex: 1,
    },
  },

  // ── 18. Proyecto final ───────────────────────────────────────────────────
  {
    id: 18,
    order: 18,
    type: 'text',
    title: 'Proyecto final: demuestra que ya dominas Git',
    description: 'Un reto que combina todo lo que aprendiste, de cero a experto.',
    content: `
<h2>El reto</h2>
<p>Ya tienes todas las piezas — este proyecto final te pide combinarlas en un flujo de trabajo completo, exactamente como lo harías en un equipo real.</p>

<div class="example">
<strong>Instrucciones:</strong>
<ol>
<li>Crea un repositorio nuevo (local con <code>git init</code>, o directo en GitHub y clónalo).</li>
<li>Haz un primer commit con un <code>README.md</code> describiendo un proyecto inventado.</li>
<li>Agrega un <code>.gitignore</code> apropiado para el tipo de proyecto que elegiste.</li>
<li>Crea una rama nueva para una "función" cualquiera, y haz al menos 2 commits ahí con mensajes claros.</li>
<li>Vuelve a main, y fusiona esa rama.</li>
<li>Provócate un conflicto a propósito (edita la misma línea en dos ramas distintas) y resuélvelo.</li>
<li>Si tienes cuenta de GitHub, sube tu repositorio y practica <code>push</code>/<code>pull</code>.</li>
<li>Etiqueta tu versión final con un tag, por ejemplo <code>v1.0.0</code>.</li>
</ol>
</div>

<h2>Checklist de experto — repásalo antes de continuar</h2>
<ul>
<li>✅ Entiendo el modelo de tres árboles (directorio de trabajo, área de preparación, repositorio).</li>
<li>✅ Sé cuándo usar <code>reset</code> y cuándo <code>revert</code>.</li>
<li>✅ Puedo crear, fusionar y resolver conflictos entre ramas sin ayuda.</li>
<li>✅ Entiendo la diferencia entre <code>merge</code> y <code>rebase</code>, y la regla de oro del rebase.</li>
<li>✅ Sé conectar un repositorio local con GitHub y mantenerlo sincronizado.</li>
<li>✅ Entiendo el flujo de un Pull Request y para qué sirve un Issue.</li>
<li>✅ Reconozco al menos una estrategia de ramas de equipo (GitHub Flow, Git Flow o trunk-based).</li>
</ul>

<div class="tip">
💡 Si marcaste todo lo de arriba con confianza, ya sabes más Git que la mayoría de la gente que lo usa todos los días sin haberlo estudiado a fondo — lo demás (submódulos, hooks avanzados, workflows complejos de Actions) lo vas a ir aprendiendo naturalmente, sobre la marcha, cuando un proyecto real lo necesite.
</div>

<h2>¿Y ahora qué?</h2>
<p>La única forma de que esto se quede de verdad es usarlo — usa Git en TODOS tus proyectos de ahora en adelante, incluso los pequeños y personales. En un par de semanas de uso real vas a dejar de pensar en los comandos, y simplemente vas a "hablar Git".</p>
`,
    exercises: [
      {
        id: 'proyecto-final',
        type: 'challenge',
        prompt: 'Completa el reto del proyecto final descrito arriba en tu propia computadora. Cuando termines, escribe aquí qué fue lo más difícil y cómo lo resolviste.',
        solution: '',
      },
    ],
    resources: [
      { label: 'Pro Git (libro oficial, gratis)', url: 'https://git-scm.com/book/es/v2', type: 'link' },
      { label: 'Plantillas de .gitignore', url: 'https://github.com/github/gitignore', type: 'link' },
    ],
  },
]

// ── Reestructura: cada terminalSim pasa a ser su PROPIA clase dedicada
// ("🖥️ Consola Interactiva: ..."), en vez de ir pegado al final de la clase
// de concepto — pedido explícito del dueño, para que se entienda como una
// consola interactiva con sus propios ejercicios, no como un anexo. Separa
// el módulo original en dos (concepto sin terminalSim + consola nueva) y
// reasigna id/order de corrido; guarda un mapa oldId -> {conceptId,
// consoleId} para poder remapear enModulesRaw (las traducciones) igual.
function buildConsoleIntroHtml(terminalSim) {
  return `
<h2>🖥️ Esta clase es 100% práctica</h2>
<p>Vas a usar una <strong>consola interactiva simulada</strong> — no es una terminal real conectada a tu computadora, pero funciona igual para aprender: escribe exactamente el comando que se te pide en cada paso y presiona <strong>Ejecutar</strong> (o Enter). Si está bien, avanzas al siguiente paso.</p>
<div class="tip">
💡 Si te equivocas, te va a dar una pista — no hay límite de intentos, tómate tu tiempo. La idea es que el comando se te quede en los dedos, no solo en la cabeza.
</div>
${terminalSim.intro ? `<p>${terminalSim.intro}</p>` : ''}
`
}

function splitConsoleModules(mods) {
  const result = []
  const idMap = new Map()
  for (const m of mods) {
    if (m.terminalSim) {
      const { terminalSim, ...concept } = m
      const conceptId = result.length
      result.push(concept)
      const consoleId = result.length
      result.push({
        type: 'text',
        title: `🖥️ Consola Interactiva: ${terminalSim.title.replace(/^Simulador:\s*/, '')}`,
        description: 'Practica en una consola interactiva simulada — sin arriesgar nada real.',
        content: buildConsoleIntroHtml(terminalSim),
        exercises: [],
        resources: [],
        terminalSim,
      })
      idMap.set(m.id, { conceptId, consoleId })
    } else {
      const conceptId = result.length
      result.push(m)
      idMap.set(m.id, { conceptId })
    }
  }
  return { modules: result.map((m, i) => ({ ...m, id: i, order: i })), idMap }
}

function remapTranslationModules(enMods, idMap) {
  const out = []
  for (const em of enMods) {
    const mapping = idMap.get(em.id)
    if (!mapping) continue
    const { terminalSim, ...conceptOverride } = em
    out.push({ ...conceptOverride, id: mapping.conceptId })
    if (terminalSim && mapping.consoleId != null) {
      out.push({
        id: mapping.consoleId,
        title: `🖥️ Interactive Console: ${terminalSim.title.replace(/^Simulator:\s*/, '')}`,
        description: 'Practice in a simulated interactive console — nothing real at risk.',
        terminalSim,
      })
    }
  }
  return out
}

const { modules: splitModules, idMap } = splitConsoleModules(modules)

const course = {
  id: COURSE_ID,
  title: 'Git y GitHub: de Cero a Experto',
  description: 'El curso más completo de la escuela sobre control de versiones: desde por qué existe Git (con su historia real) hasta rebase, colaboración en equipo y automatización con GitHub Actions — con una consola interactiva dedicada para practicar cada comando.',
  ai_instructions: 'Eres el Mago, profesor de la Escuela de Programación de Oliver Academy, guiando el curso "Git y GitHub: de Cero a Experto". Explica con analogías claras (la maleta para el área de preparación, universos paralelos para las ramas), nunca asumas que el alumno ya sabe qué es una terminal, y cuando pregunten por la consola interactiva, recuérdales que deben escribir el comando exacto que se les pide, tal como lo harían en una terminal real.',
  icon: '🐙',
  color: '#f97316',
  category: 'Programación',
  subcategory: 'Herramientas de Desarrollo',
  difficulty: 'principiante',
  locked: false,
  modules: splitModules,
}

// ── Traducción a inglés (parcial, a propósito) ────────────────────────────
// Cubre lo que el dueño pidió explícitamente que fuera traducible: el
// simulador de terminal completo (instruction/placeholder/hint/success) y
// los quizzes, más título/descripción de cada módulo — no cada párrafo de
// contenido, que es un trabajo de traducción de prosa mucho más grande y
// mejor hecho como su propia tanda de trabajo.
const enModulesRaw = [
    { id: 0, title: 'Welcome: why Git is going to change how you code', description: "What you'll achieve by the end of this course and how it's organized." },
    { id: 1, title: 'The History of Git and GitHub', description: "From Linus Torvalds's frustration in 2005 to the tool running the world's software.", quiz: { question: 'Why did Linus Torvalds create Git in 2005?', options: ['Just for fun, no urgent reason', 'Because the company owning BitKeeper (the tool the Linux kernel used) revoked free access', 'Because GitHub asked him to', 'Because he wanted to replace Python'] } },
    { id: 2, title: 'What is version control?', description: 'The problem Git solves, before touching a single command.', quiz: { question: 'What is the key difference between a centralized and a distributed system like Git?', options: ['Centralized is faster', 'In a distributed system, everyone has a full copy of the history, not just the server', "Distributed doesn't allow teamwork", "There isn't a real difference"] } },
    { id: 3, title: 'Installation and initial setup', description: 'Install Git and tell it who you are — before your first commit.', quiz: { question: 'What does `git config --global user.email "you@email.com"` do?', options: ['Creates a new email account', 'Uploads your project online', 'Tells Git which email to associate with your commits, across all your repositories', 'Deletes the commit history'] } },
    {
      id: 4, title: 'Your first repository: init and the three-tree model', description: 'Create your first repository and understand where each change "lives".',
      terminalSim: {
        title: 'Simulator: your first repository',
        intro: "Practice the first two commands of any Git project. Type the exact command and press Run (or Enter).",
        checkpoints: [
          { instruction: 'Turn this folder into a Git repository.', placeholder: 'git init', hint: 'The command is exactly: git init', success: 'Done! The hidden .git folder was created — this project now has history.' },
          { instruction: "Now check the repository's status.", placeholder: 'git status', hint: 'The command is exactly: git status', success: "Git shows there are no commits yet, and which files it sees in your folder." },
        ],
      },
      quiz: { question: 'What is the difference between the "staging area" and the "working directory"?', options: ['They are the same thing', 'The working directory is your current files; the staging area is the changes already marked for the next commit', 'The staging area is where the full history lives', 'The working directory only exists after committing'] },
    },
    {
      id: 5, title: 'Saving changes: add and commit', description: 'How to move changes from the working directory to permanent history.',
      terminalSim: {
        title: 'Simulator: save your first change',
        intro: 'You already have a new file called README.md in your working directory. Save it to history.',
        checkpoints: [
          { instruction: 'Add README.md to the staging area.', placeholder: 'git add README.md', hint: 'Use: git add README.md (or git add . to add everything)', success: 'README.md is now staged, ready for the commit.' },
          { instruction: 'Commit with the message "Add initial README".', placeholder: 'git commit -m "Add initial README"', hint: 'Use: git commit -m "Add initial README"', success: 'Your first commit is now permanently saved in history!' },
          { instruction: 'Confirm it was saved by checking the history.', placeholder: 'git log --oneline', hint: 'Use: git log --oneline', success: 'There it is, with its unique hash and your message.' },
        ],
      },
      quiz: { question: 'What does `git add file.txt` do?', options: ['Creates a new file called file.txt', 'Permanently saves the file to history', "Moves file.txt's changes to the staging area, ready for the next commit", 'Uploads the file to GitHub'] },
    },
    {
      id: 6, title: 'Traveling through time: history and diffs', description: 'Explore what changed, when, and why — without touching anything.',
      terminalSim: {
        title: 'Simulator: investigate the history',
        intro: "Practice reviewing changes without modifying anything — these commands are 100% safe.",
        checkpoints: [
          { instruction: 'Look at the full history, one line per commit.', placeholder: 'git log --oneline', hint: 'Use: git log --oneline', success: 'There you have every commit on one line, with its hash and message.' },
          { instruction: "Now check what changes you haven't saved yet.", placeholder: 'git diff', hint: 'Use: git diff (nothing else)', success: 'Git shows line by line what changed since the last commit.' },
        ],
      },
      quiz: { question: 'What is the difference between `git diff` and `git diff --staged`?', options: ["There isn't any difference", '`git diff` shows unstaged changes; `git diff --staged` shows what is already in the staging area', '`git diff --staged` uploads the changes to GitHub', '`git diff` only works after committing'] },
    },
    {
      id: 7, title: "Undoing changes: the lesson that will save you more than once", description: 'checkout, restore, reset, and revert — when to use each one.',
      terminalSim: {
        title: 'Simulator: undo a change in time',
        intro: 'You edited a file by mistake and want to go back to the last commit.',
        checkpoints: [
          { instruction: 'Discard unsaved changes in config.txt (go back to the last saved version).', placeholder: 'git restore config.txt', hint: 'Use: git restore config.txt', success: 'config.txt is back to exactly how it was in the last commit.' },
          { instruction: 'Now undo the last commit entirely, but keep the changes in your working directory (in case you want to rearrange them).', placeholder: 'git reset --soft HEAD~1', hint: 'Use: git reset --soft HEAD~1', success: 'The commit was undone, but your changes are still there, ready to be saved again whenever you want.' },
        ],
      },
      quiz: { question: "You already pushed a commit to GitHub and your team pulled it. Which command should you use to undo it?", options: ['git reset --hard', "git revert, because it doesn't rewrite history others already have", 'git restore', 'Delete the repository and start over'] },
    },
    {
      id: 8, title: 'Branches: parallel universes of your code', description: 'Try out ideas without risking your working code.',
      terminalSim: {
        title: 'Simulator: create your first branch',
        intro: "You're about to experiment with a new feature without touching main.",
        checkpoints: [
          { instruction: 'Create a new branch called "dark-mode" and switch to it in one step.', placeholder: 'git switch -c dark-mode', hint: 'Use: git switch -c dark-mode (or git checkout -b dark-mode)', success: 'You are now on the "dark-mode" branch — main stays untouched.' },
          { instruction: "Confirm which branch you're on right now.", placeholder: 'git branch', hint: 'Use: git branch (nothing else)', success: 'There is the branch list, with an asterisk next to "dark-mode".' },
        ],
      },
      quiz: { question: 'What happens to the "main" branch while you commit on another branch?', options: ['It gets deleted automatically', 'Nothing — main stays exactly the same until you decide to merge the changes', 'It updates in real time with the same changes', 'It locks until you finish'] },
    },
    {
      id: 9, title: 'Merge: bringing two branches together', description: 'How to bring a branch back in, and what to do when there is a conflict.',
      terminalSim: {
        title: 'Simulator: merge your branch',
        intro: 'You finished your work on "dark-mode" and want to bring it into main.',
        checkpoints: [
          { instruction: 'Switch back to the main branch.', placeholder: 'git switch main', hint: 'Use: git switch main', success: "You're back on main." },
          { instruction: 'Merge the "dark-mode" branch into main.', placeholder: 'git merge dark-mode', hint: 'Use: git merge dark-mode', success: 'Done! The changes from "dark-mode" are now part of main.' },
        ],
      },
      quiz: { question: 'During a merge conflict, what do the `<<<<<<<`, `=======`, and `>>>>>>>` marks mean?', options: ['A Git error you should report', 'They mark where the two versions differ, so you can decide which one (or ones) to keep', 'They must stay in the code for Git to work', 'They mean the file got corrupted'] },
    },
    { id: 10, title: 'Rebase: rewriting history (carefully)', description: 'The alternative to merge that leaves a cleaner history — and its golden rule.', quiz: { question: 'What is the "golden rule" of rebase?', options: ['Never use rebase, under any circumstance', 'Never rebase a branch you already shared with other people', 'Always use rebase instead of merge', 'Rebase only works on the main branch'] } },
    { id: 11, title: '.gitignore and commit best practices', description: 'What should never go into your repository, and how to keep a history that makes sense.', quiz: { question: 'Why is it important to add `.env` to your `.gitignore` from the very first commit?', options: ["Because Git can't read files starting with a dot", 'Because it usually holds passwords/keys, and once in history they are hard to truly remove', 'Because it takes up a lot of space', "It isn't really necessary"] } },
    {
      id: 12, title: 'GitHub: your code in the cloud', description: 'Connect your local repository to a remote repository on GitHub.',
      terminalSim: {
        title: 'Simulator: push your project to GitHub',
        intro: 'You already created an empty repository on github.com called "my-project". Connect it and push your first commit.',
        checkpoints: [
          { instruction: 'Connect your local repository with the remote on GitHub (use any example URL).', placeholder: 'git remote add origin https://github.com/your-username/my-project.git', hint: 'Use: git remote add origin <your-repository-url>', success: 'Your local repository now knows where its remote copy lives, nicknamed "origin".' },
          { instruction: 'Push your main branch to the remote for the first time.', placeholder: 'git push -u origin main', hint: 'Use: git push -u origin main (-u remembers this connection for next time)', success: "Your code is on GitHub! Next time, just \"git push\" is enough." },
        ],
      },
      quiz: { question: 'When do you use `git clone` instead of `git pull`?', options: ['clone is for every day; pull only the first time', 'pull is for every day; clone only the first time, to download a full repository', 'They are exactly the same', "clone only works offline"] },
    },
    { id: 13, title: 'Real collaboration: Pull Requests and Issues', description: 'How teams actually collaborate on the same GitHub project.', quiz: { question: 'What is the point of "forking" a repository?', options: ['To delete the original project', "To get your own copy of a project you don't have write access to, so you can propose changes", 'It is the same as cloning', 'Only GitHub admins use it'] } },
    { id: 14, title: "Teamwork without stepping on each other's toes", description: 'Git Flow, GitHub Flow, trunk-based — how a real team organizes its branches.', quiz: { question: 'What is the main difference between GitHub Flow and Git Flow?', options: ["There isn't a real difference", 'GitHub Flow uses one main branch + short branches; Git Flow uses several long-lived branches with specific roles (develop, release, hotfix)', 'Git Flow only works on GitLab', "GitHub Flow doesn't allow Pull Requests"] } },
    { id: 15, title: 'Your daily Git workflow', description: 'Practical recap: the cycle you will repeat every day as a developer.', quiz: { question: 'In the typical daily Git cycle, what comes first?', options: ['git push', 'git pull, to start the day with your team\'s latest changes', 'git rebase main, always', 'git init'] } },
    {
      id: 16, title: 'Advanced Git: stash, cherry-pick, and tags', description: "Tools you'll reach for more and more as you gain experience.",
      terminalSim: {
        title: 'Simulator: save your work in progress',
        intro: 'You are mid-change and need to switch branches urgently.',
        checkpoints: [
          { instruction: 'Stash your changes without committing, to leave the working directory clean.', placeholder: 'git stash', hint: 'Use: git stash (nothing else)', success: 'Your changes were tucked away — your working directory is clean.' },
          { instruction: 'Now bring them back.', placeholder: 'git stash pop', hint: 'Use: git stash pop', success: 'Your changes are back exactly as you left them.' },
        ],
      },
      quiz: { question: 'What is `git cherry-pick` for?', options: ['To delete a commit', 'To copy ONE specific commit from another branch onto the current branch, without bringing everything else', 'To create a new branch', 'To undo all changes'] },
    },
    { id: 17, title: 'Automation: a first look at GitHub Actions', description: 'How to make GitHub run tasks automatically on every push.', quiz: { question: 'What does a GitHub Actions workflow like the example (`on: [push]`) do?', options: ['Deletes the repository on every push', 'Automatically runs the defined steps (e.g. tests) every time someone pushes code', 'Only runs if you trigger it manually every time', 'Completely replaces the need to commit'] } },
    { id: 18, title: 'Final project: prove you master Git', description: 'A challenge that combines everything you learned, from zero to expert.' },
]

const enTranslations = {
  title: 'Git and GitHub: Zero to Expert',
  description: "The school's most complete course on version control: from why Git exists (with its real history) to rebase, team collaboration, and automation with GitHub Actions — with a dedicated interactive console to practice every command.",
  modules: remapTranslationModules(enModulesRaw, idMap),
}

// ── SQL ─────────────────────────────────────────────────────────────────
function sqlStr(js) {
  return `'${JSON.stringify(js).replace(/'/g, "''")}'`
}

const sql = `-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 038 — Curso "Git y GitHub: de Cero a Experto" (course-git-github)
-- ${course.modules.length} clases: historia real, modelo de tres árboles, ramas, merge,
-- rebase, GitHub, colaboración, estrategias de equipo, GitHub Actions y
-- ${course.modules.filter((m) => m.terminalSim).length} clases dedicadas de "Consola Interactiva" (GitTerminalSim.jsx), cada
-- una como su propio módulo, no pegadas a la clase de concepto.
-- Traducción a inglés parcial en translations.en: cubre la consola
-- interactiva completa y los quizzes/títulos — no cada párrafo de contenido
-- todavía (ver nota en scripts/build_git_course.mjs).
-- ════════════════════════════════════════════════════════════════════════

insert into public.courses
  (id, title, description, ai_instructions, icon, color, category, subcategory, difficulty, locked, modules, translations)
values (
  '${course.id}',
  '${course.title.replace(/'/g, "''")}',
  '${course.description.replace(/'/g, "''")}',
  '${course.ai_instructions.replace(/'/g, "''")}',
  '${course.icon}',
  '${course.color}',
  '${course.category}',
  '${course.subcategory}',
  '${course.difficulty}',
  ${course.locked},
  ${sqlStr(course.modules)},
  ${sqlStr({ en: enTranslations })}
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  ai_instructions = excluded.ai_instructions,
  icon = excluded.icon,
  color = excluded.color,
  category = excluded.category,
  subcategory = excluded.subcategory,
  difficulty = excluded.difficulty,
  locked = excluded.locked,
  modules = excluded.modules,
  translations = excluded.translations,
  updated_at = now();
`

writeFileSync(path.join(process.cwd(), 'supabase', 'migration_038.sql'), sql)
console.log('✓ supabase/migration_038.sql —', course.modules.length, 'módulos,', JSON.stringify(sql).length, 'bytes de SQL')
