// Curso "OpenClaw: Tu Asistente de IA de Código Abierto". Solo texto + quizzes.
// Reemplaza el contenido del placeholder locked course-open-claw (mismo id).
import { quiz, text } from '../linux-courses/helpers.mjs'

export const openclaw = {
  id: 'course-open-claw',
  title: 'OpenClaw: Tu Asistente de IA de Código Abierto',
  description: 'Un asistente de IA de código abierto que corre en tu propia computadora y te habla en WhatsApp, Telegram, Discord o Slack — sin depender de un servidor ajeno. Instálalo, entiende su arquitectura (Gateway, canales, plugins), y aprende a leer y contribuir a un proyecto de código abierto real y muy activo.',
  ai_instructions: 'Eres el Mago, profesor de la Escuela de Programación de Oliver Academy, guiando el curso "OpenClaw". Explica la arquitectura del proyecto (Gateway, canales, plugins) con analogías claras, sé honesto sobre que es un proyecto que cambia rápido y las capturas de configuración exactas pueden variar entre versiones, y siempre recuerda las precauciones de seguridad (tratar mensajes entrantes como no confiables, no exponer el Gateway sin sandboxing) antes de sugerir una configuración avanzada.',
  icon: '🦞',
  color: '#f97316',
  category: 'Programación',
  subcategory: 'Código Abierto',
  difficulty: 'intermedio',
  locked: false,
  modules: [
    text('Bienvenida: un asistente de IA que es tuyo, de verdad',
      'Qué es OpenClaw, quién lo hace, y por qué es un buen proyecto para aprender de código abierto real.',
      `
<h2>Qué es OpenClaw</h2>
<p><strong>OpenClaw</strong> es un asistente de inteligencia artificial de código abierto que corre en <strong>tu propia computadora</strong> y te encuentra en los canales de mensajería que ya usas: WhatsApp, Telegram, Discord, Slack, Microsoft Teams, iMessage y más de 20 plataformas adicionales, además de apps nativas para macOS, iOS, Android, Windows y Linux. La misma instalación funciona como asistente personal en tu laptop o como despliegue compartido para un equipo — la diferencia es solo de configuración.</p>

<h2>Tuyo, sin letra pequeña</h2>
<p>A diferencia de un asistente de IA típico donde tus conversaciones viven en el servidor de una empresa, con OpenClaw tu <strong>estado, memoria y credenciales viven en tu propio hardware</strong>. Los modelos de IA que usa (Claude, Codex, modelos locales) son <em>plugins</em> intercambiables — puedes cambiar de proveedor sin cambiar nada más de tu configuración. Por defecto, OpenClaw no "llama a casa" salvo para una revisión diaria de versión; incluso eso se puede desactivar.</p>

<h2>Quién lo mantiene</h2>
<p>OpenClaw es desarrollado por la <strong>OpenClaw Foundation</strong>, una organización sin fines de lucro (501(c)(3)) independiente — no tiene plan de pago, servicio alojado, ni token. Nació del trabajo de Peter Steinberger y la comunidad, originalmente pensado para "Molty", un personaje de langosta espacial que es la mascota del proyecto (por eso el logo 🦞). Recibe apoyo de donantes como Amazon, Red Hat, GitHub, NVIDIA y otros — donantes que financian, no que son dueños del proyecto.</p>

<h2>Por qué es un buen proyecto para este curso</h2>
<p>Además de ser útil por sí mismo, OpenClaw es un ejemplo perfecto de proyecto de código abierto real, activo y bien documentado: código público, miles de contribuciones, una arquitectura clara que puedes leer, y una comunidad viva. Aprender a instalarlo, entender su arquitectura y (si quieres) contribuirle es una forma excelente de practicar lo que aprendiste en cualquier curso de Git y GitHub de esta escuela, sobre un proyecto real.</p>

<div class="tip">
💡 Este curso trabaja junto con <em>Fundamentos del Código Abierto</em> de esta misma escuela: aquí ves un proyecto real de principio a fin; ahí ves las reglas generales (licencias, cómo contribuir) que aplican a cualquier proyecto, no solo a este.
</div>
`,
      quiz('¿Dónde viven tu estado, memoria y credenciales cuando usas OpenClaw?',
        ['En un servidor de la empresa OpenClaw Foundation', 'En tu propio hardware — la computadora donde lo instalas', 'En la nube de OpenAI', 'No se guardan en ningún lado'], 1)),

    text('Cómo se arma por dentro: el Gateway, los canales y los plugins',
      'La arquitectura de OpenClaw, en cuatro piezas que encajan entre sí.',
      `
<h2>El Gateway: el centro de control</h2>
<p>El <strong>Gateway</strong> es el plano de control local de OpenClaw: administra las sesiones de conversación, las herramientas que el asistente puede usar, los eventos, y las conexiones a los distintos canales de mensajería. Todo lo demás se conecta a él.</p>

<h2>Cómo se conecta todo</h2>
<table>
<tr><th>Pieza</th><th>Qué hace</th></tr>
<tr><td><strong>Gateway</strong></td><td>El plano de control local: sesiones, herramientas, eventos, conexiones.</td></tr>
<tr><td><strong>Control UI, CLI y TUI</strong></td><td>Las distintas formas de hablar con el Gateway: una interfaz web, la línea de comandos, o una interfaz de texto en la terminal.</td></tr>
<tr><td><strong>Canales</strong></td><td>Llevan al asistente a WhatsApp, Telegram, Slack, Discord, Google Chat, Signal, iMessage y más.</td></tr>
<tr><td><strong>Apps y nodos compañeros</strong></td><td>Agregan voz, pizarra (Canvas), cámara, pantalla, y acciones locales del dispositivo en las plataformas que lo soportan.</td></tr>
</table>

<h2>Modelos y agentes como plugins intercambiables</h2>
<p>OpenClaw funciona tanto con proveedores de modelos alojados (como Claude o modelos de OpenAI) como con modelos locales que corren en tu propia máquina, sin depender de internet. Sus <strong>herramientas, habilidades (skills) y plugins</strong> son lo que extiende lo que el asistente puede hacer — desde consultar el clima hasta ejecutar comandos en tu sistema, según cómo lo configures.</p>

<h2>Un vistazo al repositorio</h2>
<p>El proyecto vive como un <em>pnpm workspace</em> (un monorepo con varios paquetes relacionados) — si ya tomaste algún curso de Git y GitHub de esta escuela, el flujo para explorarlo te resultará familiar: clonar el repositorio, instalar dependencias, y correr el proyecto localmente.</p>
<pre><code>git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm build</code></pre>

<div class="tip">
💡 Fíjate en las carpetas del repositorio real: <code>apps</code> (las aplicaciones), <code>crates</code> (componentes en Rust), <code>config</code> (configuración) — leer la estructura de carpetas de un proyecto real, antes de leer una sola línea de código, ya te dice mucho sobre cómo está organizado.
</div>
`,
      quiz('¿Qué es el "Gateway" en la arquitectura de OpenClaw?',
        ['Un canal de mensajería más', 'El plano de control local: administra sesiones, herramientas, eventos y las conexiones a los distintos canales', 'El nombre del modelo de IA que usa por defecto', 'Una app exclusiva para iPhone'], 1)),

    text('Instala y arranca tu propio OpenClaw',
      'De cero a tu primer mensaje, con el instalador oficial.',
      `
<h2>Requisitos y el instalador</h2>
<p>El instalador de OpenClaw soporta macOS, Linux y Windows, y se encarga de instalar la versión de Node.js necesaria si no la tienes. Si ya administras tus propias versiones de Node.js, puedes instalar el paquete directamente en vez de usar el script del instalador.</p>

<table>
<tr><th>Sistema</th><th>Comando</th></tr>
<tr><td>macOS / Linux / WSL2</td><td><code>curl -fsSL https://openclaw.ai/install.sh | bash</code></td></tr>
<tr><td>Windows (PowerShell)</td><td><code>iwr -useb https://openclaw.ai/install.ps1 | iex</code></td></tr>
<tr><td>Si ya tienes Node.js</td><td><code>npm install -g openclaw@latest</code></td></tr>
</table>

<div class="warn">
⚠️ Como con cualquier script de instalación que descargas y ejecutas (visto en el curso de <em>Termux</em> de la Academia de Linux), es buena práctica revisar qué hace un instalador antes de correrlo con privilegios, especialmente la primera vez que usas un proyecto nuevo.
</div>

<h2>El asistente de configuración (onboarding)</h2>
<p>Al instalar por primera vez, un asistente interactivo te guía paso a paso: verifica el acceso a los modelos de IA que quieras usar, crea tu espacio de trabajo, y configura el Gateway. Si instalaste el paquete directamente, puedes iniciar este proceso a mano:</p>
<pre><code>openclaw onboard --install-daemon</code></pre>

<h2>Tus primeros comandos</h2>
<table>
<tr><th>Comando</th><th>Qué hace</th></tr>
<tr><td><code>openclaw gateway status</code></td><td>Revisa que el Gateway esté corriendo correctamente.</td></tr>
<tr><td><code>openclaw dashboard</code></td><td>Abre la interfaz de control (Control UI) en tu navegador.</td></tr>
</table>
<p>Desde el dashboard, envía un mensaje de prueba para confirmar que el asistente responde — esa es la señal de que tu instalación quedó lista.</p>

<h2>Conectar un canal de mensajería</h2>
<p>Después del arranque inicial, conectas los canales que quieras usar (WhatsApp, Telegram, Discord...) siguiendo la guía de configuración de cada uno — cada canal tiene su propio proceso de vinculación, similar a cómo vinculas WhatsApp Web con tu teléfono.</p>
`,
      quiz('¿Qué hace el comando "openclaw dashboard"?',
        ['Desinstala OpenClaw', 'Abre la interfaz de control (Control UI) en tu navegador', 'Conecta automáticamente todos los canales de mensajería sin configuración', 'Actualiza el sistema operativo'], 1)),

    text('Seguridad: trata los mensajes entrantes como no confiables',
      'El asistente puede actuar de verdad en tu sistema — por eso la seguridad no es opcional.',
      `
<h2>Una diferencia importante con un chatbot normal</h2>
<p>OpenClaw no solo responde texto: según cómo lo configures, puede ejecutar herramientas reales en tu sistema. Eso lo hace mucho más útil que un chatbot que solo conversa — y también significa que hay que tratarlo con el mismo cuidado que cualquier programa con permisos sobre tu computadora.</p>

<h2>La regla central: mensajes entrantes no confiables por defecto</h2>
<div class="warn">
⚠️ OpenClaw trata los mensajes entrantes como <strong>entrada no confiable</strong> por defecto. Los canales que permiten mensajes directos emparejan a remitentes desconocidos antes de que puedan interactuar contigo — tienes que aprobar explícitamente una solicitud de emparejamiento (<code>openclaw pairing approve &lt;canal&gt; &lt;código&gt;</code>) antes de que un desconocido pueda hablarle a tu asistente.
</div>

<h2>Dónde corren las herramientas</h2>
<p>Por defecto, las herramientas que usa OpenClaw corren directamente en tu computadora (el host) para la sesión principal, salvo que configures explícitamente un entorno aislado (<em>sandboxing</em>). Antes de conectar a otras personas a tu instancia, o de exponer el Gateway de forma remota, el proyecto recomienda leer su guía de seguridad y su guía de sandboxing con atención.</p>

<h2>Buenas prácticas al configurar tu instancia</h2>
<table>
<tr><th>Práctica</th><th>Por qué</th></tr>
<tr><td>No expongas el Gateway a internet sin entender las implicaciones</td><td>Un Gateway expuesto sin protección adecuada podría permitir que alguien más controle tu asistente (y, por extensión, herramientas con acceso a tu sistema).</td></tr>
<tr><td>Revisa qué herramientas/plugins habilitas</td><td>Cada herramienta que agregas amplía lo que el asistente puede hacer en tu nombre.</td></tr>
<tr><td>Empieza en modo local de confianza antes de compartir tu instancia</td><td>Familiarízate con el comportamiento antes de abrirlo a un equipo o a canales públicos.</td></tr>
<tr><td>Aprueba emparejamientos solo de gente que conoces</td><td>Es la primera línea de defensa contra mensajes entrantes maliciosos.</td></tr>
</table>

<div class="tip">
💡 Este mismo principio (tratar la entrada externa como no confiable, pedir confirmación antes de acciones con efectos reales) es el mismo que viste en <em>Actualidad de la IA</em> sobre agentes de IA en general — OpenClaw es un ejemplo concreto y real de ese principio aplicado.
</div>
`,
      quiz('¿Por qué OpenClaw trata los mensajes entrantes como "no confiables" por defecto?',
        ['Porque no funciona bien con ningún canal', 'Porque el asistente puede ejecutar herramientas reales en tu sistema, así que un mensaje malicioso de un desconocido podría intentar aprovecharse de eso', 'Porque es un requisito legal sin relación con la seguridad', 'Porque todos los mensajes se eliminan automáticamente'], 1)),

    text('Personaliza tu asistente: habilidades y plugins',
      'Cómo extender lo que OpenClaw puede hacer, sin modificar el núcleo del proyecto.',
      `
<h2>Habilidades (skills) y plugins</h2>
<p>OpenClaw se extiende agregando <strong>herramientas, habilidades (skills) y plugins</strong> — piezas que le dan al asistente nuevas capacidades sin tocar el código del núcleo del proyecto. Es el mismo principio de diseño que viste en <em>Termux</em> con sus paquetes instalables: un núcleo estable, extendido por piezas intercambiables.</p>

<h2>Dónde encontrar habilidades ya hechas</h2>
<p>Existe una comunidad activa construyendo y compartiendo configuraciones y plantillas de habilidades para OpenClaw (por ejemplo, colecciones curadas con cientos de plantillas listas, organizadas por categoría) — un patrón muy parecido al de cualquier ecosistema de plugins maduro, donde no siempre hace falta construir algo desde cero.</p>

<h2>Compañeros de plataforma: voz, pantalla y dispositivo</h2>
<p>Según la plataforma, apps y nodos compañeros agregan capacidades adicionales: interacción por voz, una pizarra compartida (Canvas), acceso a cámara, captura de pantalla, y acciones específicas del dispositivo — todo como piezas opcionales, no como parte obligatoria del núcleo.</p>

<h2>El principio de diseño detrás de todo esto</h2>
<table>
<tr><th>Principio</th><th>Qué significa en la práctica</th></tr>
<tr><td>Núcleo estable</td><td>El Gateway y su arquitectura central cambian con cuidado, con un proceso formal de contribución.</td></tr>
<tr><td>Extensión mediante plugins</td><td>Nuevas capacidades se agregan sin modificar el núcleo, reduciendo el riesgo de romper algo al extenderlo.</td></tr>
<tr><td>Modelos como plugins también</td><td>Cambiar de proveedor de IA (Claude, Codex, un modelo local) no requiere reescribir tu configuración de canales o herramientas.</td></tr>
</table>

<div class="tip">
💡 Diseñar sistemas con un núcleo pequeño y estable, extendido por piezas intercambiables, es un patrón que vas a ver una y otra vez en software bien construido — vale la pena reconocerlo cuando lo veas en otros proyectos.
</div>
`,
      quiz('¿Cuál es la ventaja de diseñar OpenClaw con un "núcleo estable" extendido por plugins?',
        ['Ninguna, sería mejor tenerlo todo en un solo archivo', 'Nuevas capacidades se pueden agregar sin modificar el núcleo, reduciendo el riesgo de romper el sistema central al extenderlo', 'Hace que el proyecto sea más difícil de instalar', 'Impide que el proyecto use más de un modelo de IA'], 1)),

    text('Cómo contribuir: tu primer Pull Request a un proyecto real',
      'De leer el código a proponer tu primer cambio, paso a paso.',
      `
<h2>Antes de escribir una sola línea</h2>
<ol>
<li><strong>Lee el archivo CONTRIBUTING.md</strong> del proyecto — casi todo proyecto serio de código abierto tiene uno, con las reglas específicas de ese repositorio.</li>
<li><strong>Revisa los issues abiertos</strong> — muchos proyectos etiquetan tareas pequeñas como "good first issue" para quien empieza.</li>
<li><strong>Únete a la comunidad</strong> (en el caso de OpenClaw, su servidor de Discord) para hacer preguntas de configuración antes de intentar resolver algo por tu cuenta.</li>
</ol>

<h2>El flujo típico de contribución (repaso de Git y GitHub)</h2>
<p>Si tomaste el curso <em>Git y GitHub: de Cero a Experto</em> de esta escuela, este flujo te va a resultar familiar:</p>
<ol>
<li><strong>Fork</strong> del repositorio a tu propia cuenta.</li>
<li><strong>Clona</strong> tu fork localmente.</li>
<li>Crea una <strong>rama</strong> nueva para tu cambio.</li>
<li>Haz el cambio, con <strong>commits</strong> claros.</li>
<li><strong>Push</strong> a tu fork, y abre un <strong>Pull Request</strong> hacia el repositorio original.</li>
<li>Responde a los comentarios de revisión — es normal que te pidan ajustes antes de aceptar el cambio.</li>
</ol>

<h2>Contribuir no es solo código</h2>
<p>Como viste en <em>Historia de Linux</em>, un proyecto de código abierto necesita mucho más que código: documentación, reportes de errores claros, traducciones, y ayuda respondiendo preguntas de otros usuarios — todo eso cuenta como contribución real.</p>

<table>
<tr><th>Si sabes...</th><th>Puedes contribuir con...</th></tr>
<tr><td>Usar OpenClaw</td><td>Reportar errores con pasos claros para reproducirlos.</td></tr>
<tr><td>Escribir bien</td><td>Mejorar la documentación o las guías de configuración.</td></tr>
<tr><td>Programar</td><td>Resolver issues etiquetados como buenos para empezar.</td></tr>
<tr><td>Diseñar habilidades/plugins</td><td>Construir y compartir una habilidad nueva con la comunidad.</td></tr>
</table>

<div class="warn">
⚠️ Los proyectos de este tamaño (miles de contribuciones activas) reciben ayuda asistida por IA con gusto, pero cada Pull Request sigue necesitando que <strong>tú</strong> entiendas y puedas explicar el cambio que propones — no basta con generar un cambio y enviarlo sin revisarlo.
</div>
`,
      quiz('¿Cuál es el primer paso recomendado antes de intentar contribuir código a un proyecto como OpenClaw?',
        ['Escribir código inmediatamente sin revisar nada más', 'Leer el archivo CONTRIBUTING.md del proyecto y revisar los issues etiquetados para quien empieza', 'Reescribir el proyecto completo desde cero', 'Contactar directamente a cada donante del proyecto'], 1)),

    text('Un ecosistema más grande: OpenClaw dentro de un equipo de agentes',
      'Cómo OpenClaw se conecta con otras herramientas, incluida Paperclip.',
      `
<h2>OpenClaw no vive solo</h2>
<p>OpenClaw funciona junto a otras herramientas de IA del mismo ecosistema: junto a Claude Code y Codex (que viste en <em>Domina Claude</em> y en el <em>Panorama de Modelos de IA</em>) como opciones de "harness" (el agente que ejecuta las tareas), y como una de las piezas que otras herramientas de orquestación pueden coordinar.</p>

<h2>La analogía "empleado vs. compañía"</h2>
<p>Una forma útil de pensar en esto, que verás con más detalle en el curso <em>Paperclip</em> de esta misma escuela: si OpenClaw es un empleado individual — un asistente que hace su trabajo — hay herramientas de orquestación que actúan como "la compañía": coordinan a varios agentes (OpenClaw, Claude Code, Codex y otros) trabajando juntos hacia un objetivo, con roles, presupuestos y supervisión.</p>

<h2>Por qué esto importa para entender el panorama actual</h2>
<p>Como viste en <em>Actualidad de la IA</em>, la tendencia de fondo es pasar de "un chatbot que responde" a "agentes que actúan" — y ahora, un paso más allá: <strong>equipos completos de agentes</strong> coordinados entre sí. OpenClaw representa el nivel de "un asistente capaz"; el siguiente curso de esta escuela te lleva al nivel de "coordinar varios de ellos".</p>

<div class="tip">
💡 Si ya instalaste OpenClaw en la clase de instalación de este curso, ya tienes la pieza base lista para explorar, más adelante, cómo se vería coordinarlo junto a otros agentes.
</div>

<h2>Cierre del curso</h2>
<p>En este curso viste qué es OpenClaw, su arquitectura (Gateway, canales, plugins), cómo instalarlo y usarlo con seguridad, cómo extenderlo, y cómo contribuir a un proyecto de código abierto real y activo. Sigue con <em>Paperclip</em> para ver el siguiente nivel: coordinar equipos completos de agentes de IA.</p>
`,
      quiz('¿Cómo se describe la relación entre OpenClaw y una herramienta de orquestación como Paperclip?',
        ['No tienen ninguna relación entre sí', 'OpenClaw es como un empleado individual (un asistente capaz); una herramienta de orquestación actúa como "la compañía", coordinando varios agentes juntos', 'Paperclip reemplaza por completo a OpenClaw', 'Son exactamente el mismo software con distinto nombre'], 1)),
  ],
}
