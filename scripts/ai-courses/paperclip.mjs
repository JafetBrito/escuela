// Curso "Paperclip: Organiza un Equipo de Agentes de IA". Solo texto + quizzes.
import { quiz, text } from '../linux-courses/helpers.mjs'

export const paperclip = {
  id: 'course-paperclip',
  title: 'Paperclip: Organiza un Equipo de Agentes de IA',
  description: 'Un proyecto de código abierto más nuevo que OpenClaw, pero en el mismo espacio: en vez de un solo asistente, Paperclip organiza equipos completos de agentes de IA (OpenClaw, Claude Code, Codex, Cursor) como si fueran una empresa — con organigrama, presupuestos y aprobaciones. La siguiente capa de la automatización con IA.',
  ai_instructions: 'Eres el Mago, profesor de la Escuela de Programación de Oliver Academy, guiando el curso "Paperclip". Explica los conceptos de organización de agentes (organigrama, presupuestos, gobernanza) con analogías del mundo laboral real, y sé honesto sobre que Paperclip es un proyecto joven y en evolución rápida — algunas funciones exactas del roadmap pueden cambiar. Recuerda siempre el principio de "nada se ejecuta sin tu aprobación" antes de sugerir dar autonomía amplia a un agente.',
  icon: '📎',
  color: '#0ea5e9',
  category: 'Programación',
  subcategory: 'Código Abierto',
  difficulty: 'intermedio',
  locked: false,
  modules: [
    text('Bienvenida: si OpenClaw es un empleado, Paperclip es la empresa',
      'Un proyecto más nuevo, en el mismo terreno que OpenClaw, resolviendo un problema distinto.',
      `
<h2>Qué es Paperclip</h2>
<p><strong>Paperclip</strong> es una aplicación de código abierto (licencia MIT) para <strong>orquestar equipos de agentes de IA</strong> que trabajan para ti. Es un servidor Node.js con una interfaz web en React que coordina a varios agentes de IA hacia objetivos de negocio, con seguimiento de trabajo y costos desde un solo panel — no es un chatbot, es lo que administra a muchos "agentes-empleado" a la vez.</p>

<h2>"Si OpenClaw es un empleado, Paperclip es la compañía"</h2>
<p>Esta es literalmente la frase con la que el propio proyecto se describe. Mientras que OpenClaw (curso anterior de esta escuela) es un asistente individual capaz de actuar, Paperclip resuelve un problema distinto: <strong>¿qué pasa cuando tienes varios agentes trabajando a la vez</strong> — algunos de OpenClaw, otros Claude Code, otros Codex, otros Cursor — <strong>y necesitas coordinarlos, no perder el hilo de qué hace cada uno, y controlar el gasto?</strong></p>

<h2>Un proyecto joven, con enfoque claro</h2>
<p>Paperclip es, en efecto, más reciente que OpenClaw, y explícitamente se apoya en herramientas como OpenClaw, Claude Code y Codex — las orquesta, no las reemplaza. Es desarrollado por Paperclip Labs, Inc., publicado bajo licencia MIT (código abierto, uso libre incluido comercial).</p>

<h2>El problema real que resuelve</h2>
<div class="example">
Imagina que tienes 20 pestañas de un agente de código abierto abiertas a la vez, cada una trabajando en algo distinto. Pierdes de vista cuál hace qué, cuánto gasta cada una en tokens, y si alguna se quedó en un ciclo improductivo gastando dinero sin avanzar. Paperclip existe exactamente para ese problema: un panel único, con organigrama, presupuestos y supervisión, en vez de una pila desorganizada de scripts y pestañas de terminal.
</div>

<h2>Lo que este curso NO es</h2>
<p>Como el propio proyecto aclara: Paperclip no es un chatbot, no es un framework para construir agentes desde cero, y no es un gestor de flujos de arrastrar-y-soltar. Es específicamente una herramienta de <strong>organización y gobernanza</strong> de agentes que ya existen y ya saben hacer su trabajo.</p>
`,
      quiz('¿Cuál es la relación entre OpenClaw y Paperclip, según la propia descripción del proyecto?',
        ['Son exactamente el mismo software', 'Si OpenClaw es un empleado individual, Paperclip es la compañía que organiza y coordina a varios agentes (incluido OpenClaw) a la vez', 'Paperclip es más antiguo que OpenClaw', 'No tienen ninguna relación'], 1)),

    text('Los cuatro pilares de Paperclip',
      'Tareas, organigrama, entrenamiento e infraestructura — las cuatro piezas que hacen que un equipo de agentes funcione.',
      `
<h2>Por qué cuatro pilares</h2>
<p>Según el propio proyecto, cuatro cosas tienen que funcionar bien para que una organización de agentes de IA produzca resultados de verdad. Paperclip está construido exactamente alrededor de esas cuatro piezas.</p>

<table>
<tr><th>Pilar</th><th>Para quién</th><th>Qué cubre</th></tr>
<tr><td><strong>Gestor de tareas agentic</strong></td><td>Todos, uso diario</td><td>Declaras la intención, los agentes trabajan, tú verificas el resultado. Incluye aprobaciones y revisión de cambios.</td></tr>
<tr><td><strong>Organigrama para agentes</strong></td><td>Gerentes</td><td>Roles, permisos y límites — tanto para humanos como para agentes en el mismo organigrama.</td></tr>
<tr><td><strong>Entrenamiento de agentes-empleado</strong></td><td>Quien habilita el sistema</td><td>Diseñar, entrenar y evaluar a tus "empleados" de IA con habilidades compartidas.</td></tr>
<tr><td><strong>Sistema operativo agentic</strong></td><td>IT / plataforma</td><td>La infraestructura que hace que todo corra: cualquier modelo, cualquier agente, aislamiento de ejecución, controles de costo.</td></tr>
</table>

<h2>"Declara la intención, verifica el resultado"</h2>
<p>El primer pilar resume bien la filosofía completa del proyecto: tú no microgestionas cada paso — defines <strong>qué</strong> necesitas, el agente trabaja de forma más autónoma, y tú revisas el resultado final (a partir de diferencias de código, capturas de pantalla, o pruebas) antes de aceptarlo.</p>

<h2>Un organigrama mixto: humanos y agentes juntos</h2>
<p>Una idea distintiva de Paperclip: el organigrama no es solo de agentes — mezcla personas y agentes de IA en la misma estructura, con roles, responsabilidades, y reglas claras de quién puede delegar en quién, y quién puede hacer qué.</p>

<div class="tip">
💡 Piensa en los cuatro pilares como las cuatro preguntas que cualquier equipo real (humano o de IA) necesita responder: ¿qué hay que hacer?, ¿quién es responsable de qué?, ¿cómo mejoramos con el tiempo?, y ¿con qué infraestructura corre todo esto?
</div>
`,
      quiz('¿Qué idea resume mejor el primer pilar, "Gestor de tareas agentic"?',
        ['Microgestionar cada paso que da el agente en tiempo real', 'Declarar la intención (qué necesitas), dejar que el agente trabaje con más autonomía, y verificar el resultado final antes de aceptarlo', 'Nunca revisar el trabajo de los agentes', 'Solo funciona con un agente a la vez'], 1)),

    text('Organigrama, tareas y "heartbeats": cómo trabajan los agentes',
      'La mecánica concreta detrás de cómo Paperclip mantiene a los agentes trabajando de forma ordenada.',
      `
<h2>Organigrama con roles reales</h2>
<p>Cada agente en Paperclip tiene un <strong>rol, un título, y una línea de reporte</strong> — de forma parecida a un organigrama de empresa real. Un agente puede ser "CTO", otro "ingeniero", otro "diseñador" — cada uno con permisos y responsabilidades acotadas a su rol.</p>

<h2>El sistema de tickets: nada se pierde</h2>
<p>El trabajo se organiza en <strong>tickets</strong> (issues) con vínculos a la empresa/proyecto/objetivo correspondiente, checkout atómico (para que dos agentes no trabajen accidentalmente sobre lo mismo a la vez), dependencias, comentarios, documentos adjuntos, y productos de trabajo — cada conversación queda registrada, cada decisión queda trazada.</p>

<h2>Heartbeats: cómo "despiertan" los agentes</h2>
<p>En vez de correr todo el tiempo consumiendo recursos sin parar, los agentes de Paperclip funcionan por <strong>heartbeats</strong> (latidos): se activan en un horario programado o quiando ocurre un evento (se les asigna una tarea, alguien los menciona), revisan su trabajo pendiente, y actúan. La delegación fluye hacia arriba y abajo del organigrama según haga falta.</p>

<table>
<tr><th>Concepto</th><th>Qué resuelve</th></tr>
<tr><td>Checkout atómico</td><td>Evita que dos agentes trabajen sobre la misma tarea sin saberlo (doble trabajo).</td></tr>
<tr><td>Estado persistente</td><td>Un agente retoma exactamente donde se quedó en su próximo heartbeat, en vez de empezar de cero.</td></tr>
<tr><td>Rutinas programadas</td><td>Tareas recurrentes (soporte al cliente, reportes) se activan solas según un horario, sin que tengas que iniciarlas a mano cada vez.</td></tr>
</table>

<h2>Espacios de trabajo aislados</h2>
<p>Cada agente trabaja en su propio espacio de ejecución aislado (por ejemplo, un <em>git worktree</em> separado — si tomaste algún curso de Git de esta escuela, ya conoces el concepto), con el directorio y contexto correctos cada vez, evitando que el trabajo de un agente interfiera con el de otro.</p>
`,
      quiz('¿Qué son los "heartbeats" en Paperclip?',
        ['Un indicador de la salud física del servidor', 'El mecanismo por el que los agentes se activan según un horario o un evento, revisan su trabajo pendiente y actúan, en vez de correr sin parar', 'Un tipo de error del sistema', 'El nombre del organigrama de la empresa'], 1)),

    text('Presupuestos y gobernanza: nada se sale de control',
      'Cómo Paperclip evita que un agente autónomo gaste de más o actúe sin supervisión.',
      `
<h2>El problema del gasto descontrolado</h2>
<p>Un agente de IA autónomo, corriendo sin supervisión, puede quedarse en un ciclo repitiendo llamadas al modelo sin avanzar realmente — y cada una de esas llamadas cuesta dinero real. Sin control, esto puede consumir cientos de dólares en tokens antes de que alguien se dé cuenta.</p>

<h2>Control de costos por capas</h2>
<table>
<tr><th>Nivel de seguimiento</th><th>Qué controla</th></tr>
<tr><td>Por compañía</td><td>Presupuesto total de toda la organización de agentes.</td></tr>
<tr><td>Por agente</td><td>Presupuesto mensual individual — cuando un agente llega a su límite, se detiene.</td></tr>
<tr><td>Por proyecto/objetivo/ticket</td><td>Seguimiento granular de en qué se está gastando exactamente.</td></tr>
</table>
<p>Cuando un presupuesto se agota, el sistema puede pausar automáticamente al agente responsable y cancelar el trabajo en cola, evitando el gasto descontrolado.</p>

<h2>Gobernanza: aprobar, pausar, revertir</h2>
<p>Las <strong>puertas de aprobación</strong> (approval gates) son puntos donde un humano debe revisar y aprobar antes de que el trabajo continúe — puedes aprobar contrataciones de agentes, anular una estrategia, pausar o terminar cualquier agente en cualquier momento. Los cambios de configuración quedan versionados, así que un cambio problemático se puede revertir de forma segura.</p>

<h2>Auditoría completa</h2>
<p>Cada acción que modifica algo, cada cambio de estado de un heartbeat, cada evento de costo, cada aprobación, queda registrado como actividad duradera — para que quien opera el sistema pueda auditar qué pasó y por qué, en cualquier momento.</p>

<div class="warn">
⚠️ Este es exactamente el principio de "confirma antes de una acción difícil de revertir" que viste en <em>Actualidad de la IA</em> y en <em>Domina Claude</em>, aplicado a escala de todo un equipo de agentes en vez de a uno solo. Cuanta más autonomía le das a un sistema de este tipo, más importante es tener presupuestos y puertas de aprobación bien configuradas.
</div>
`,
      quiz('¿Qué pasa cuando un agente en Paperclip llega a su límite de presupuesto?',
        ['Nada, sigue gastando sin límite', 'El sistema puede pausarlo automáticamente y cancelar el trabajo en cola, evitando gasto descontrolado', 'Se elimina permanentemente de la organización', 'El presupuesto de toda la compañía se duplica automáticamente'], 1)),

    text('Instala y prueba Paperclip',
      'De cero a tu primera "empresa" de agentes, con el modo de prueba sin instalación permanente.',
      `
<h2>Requisitos</h2>
<p>Paperclip requiere Node.js 24.11 o más reciente y pnpm 9.15 o más reciente. Es de código abierto y autoalojado (self-hosted) — no requiere una cuenta de Paperclip para usarlo.</p>

<h2>Instalación estándar</h2>
<pre><code>curl -fsSLO https://paperclip.ing/install.sh
curl -fsSLO https://paperclip.ing/install.sh.sha256
sha256sum -c install.sh.sha256
bash install.sh</code></pre>
<p>El instalador verifica que tengas Node.js, instala una CLI administrada, y arranca la configuración inicial interactiva. También puede instalar Paperclip como servicio en segundo plano en sistemas Linux y macOS soportados.</p>

<div class="tip">
💡 Fíjate en el paso de verificación con <code>sha256sum</code>: es exactamente la misma técnica que viste en el curso de <em>Instala Linux</em> de la Academia de Linux para confirmar que un archivo descargado no está dañado ni alterado — aparece aquí por la misma razón.
</div>

<h2>Probarlo sin instalar nada permanente</h2>
<p>Si solo quieres probarlo, existe un modo de "prueba de manejo" (test-drive) que se queda en primer plano, nunca instala un servicio, y ya viene inicializado con un agente "CEO" listo para empezar:</p>
<pre><code>ANTHROPIC_API_KEY=... npx paperclipai test-drive</code></pre>
<p>También puedes usar otros proveedores, especificando el "harness" (el tipo de agente) que quieres probar:</p>
<pre><code>OPENAI_API_KEY=... npx paperclipai test-drive --harness codex</code></pre>

<h2>Instalación manual (para desarrolladores)</h2>
<pre><code>git clone https://github.com/paperclipai/paperclip.git
cd paperclip
pnpm install
pnpm dev</code></pre>
<p>Esto arranca el servidor de API en <code>http://localhost:3100</code>, con una base de datos PostgreSQL incrustada que se crea automáticamente — sin configuración manual de base de datos necesaria para probarlo localmente.</p>

<div class="warn">
⚠️ Cualquier llave de API que uses (Anthropic, OpenAI) es una credencial real — trátala con el mismo cuidado que viste en <em>Domina Claude</em> sobre no compartir tus llaves ni subirlas a un repositorio público.
</div>
`,
      quiz('¿Para qué sirve el modo "test-drive" de Paperclip?',
        ['Para desinstalar Paperclip permanentemente', 'Para probarlo sin instalar nada permanente — se queda en primer plano y ya viene inicializado con un agente listo', 'Es obligatorio usarlo antes de cualquier instalación', 'Solo funciona sin conexión a internet'], 1)),

    text('Casos de uso reales: qué se puede coordinar con Paperclip',
      'De "20 pestañas de Claude Code abiertas" a un proceso ordenado con roles y presupuesto.',
      `
<h2>El "antes y después" que resuelve Paperclip</h2>
<table>
<tr><th>Sin Paperclip</th><th>Con Paperclip</th></tr>
<tr><td>20 pestañas de un agente de código abierto, sin saber cuál hace qué; al reiniciar, se pierde todo.</td><td>Tareas basadas en tickets, conversaciones organizadas por hilos, las sesiones persisten entre reinicios.</td></tr>
<tr><td>Reunir manualmente contexto de varios lugares cada vez que le hablas a tu agente.</td><td>El contexto fluye desde la tarea hacia arriba, pasando por el proyecto y los objetivos de la empresa — el agente siempre sabe el "por qué".</td></tr>
<tr><td>Carpetas de configuraciones de agentes desorganizadas, reinventando gestión de tareas cada vez.</td><td>Organigrama, tickets, delegación y gobernanza ya integrados de fábrica.</td></tr>
<tr><td>Ciclos que gastan cientos de dólares antes de notarlo.</td><td>Seguimiento de costos y presupuestos que detienen a los agentes automáticamente al llegar al límite.</td></tr>
<tr><td>Trabajos recurrentes que hay que recordar iniciar manualmente.</td><td>Rutinas (heartbeats) que se activan solas según un horario.</td></tr>
</table>

<h2>Un ejemplo de flujo completo</h2>
<div class="example">
Defines el objetivo: "Construir la app de notas número 1 de IA hasta $1M de ingresos mensuales." Contratas al equipo: un CEO, un CTO, ingenieros, diseñadores, marketing — cada rol puede ser cualquier agente, de cualquier proveedor. Apruebas la estrategia, defines presupuestos, y monitoreas desde el panel — en vez de coordinar manualmente cada pieza tú mismo.
</div>

<h2>Con quién funciona</h2>
<p>Paperclip está diseñado para trabajar con OpenClaw, Claude Code, Codex, Cursor, y prácticamente cualquier cosa que pueda "recibir un heartbeat" — incluidos scripts de Bash o servicios por HTTP. No te obliga a un solo proveedor de IA.</p>

<h2>Para quién es (y para quién no)</h2>
<table>
<tr><th>Te conviene si...</th><th>Probablemente no lo necesitas si...</th></tr>
<tr><td>Coordinas varios agentes distintos hacia un objetivo común.</td><td>Usas un solo agente ocasionalmente para tareas simples.</td></tr>
<tr><td>Necesitas auditar el trabajo y controlar costos de un equipo de agentes.</td><td>No te importa el seguimiento formal de tareas ni presupuestos.</td></tr>
<tr><td>Quieres supervisar agentes autónomos corriendo 24/7 desde tu teléfono.</td><td>Prefieres supervisar directamente cada sesión de forma manual.</td></tr>
</table>
`,
      quiz('¿Con qué tipo de agentes o herramientas puede trabajar Paperclip, según esta clase?',
        ['Solo con un proveedor exclusivo de IA', 'Con OpenClaw, Claude Code, Codex, Cursor, y prácticamente cualquier cosa que pueda "recibir un heartbeat", incluidos scripts propios', 'Únicamente con modelos de código cerrado', 'Solo puede coordinar un agente a la vez'], 1)),

    text('Cierre: el panorama completo de la automatización con IA',
      'De un prompt suelto a un equipo completo — repaso de todo el camino que recorriste.',
      `
<h2>El camino completo, en una tabla</h2>
<table>
<tr><th>Nivel</th><th>Qué hace</th><th>Dónde lo viste</th></tr>
<tr><td>Un prompt</td><td>Le pides algo a un chatbot y lees la respuesta.</td><td><em>Trucos y Consejos</em></td></tr>
<tr><td>Un asistente con herramientas</td><td>El modelo busca en internet, ejecuta código, usa integraciones.</td><td><em>Domina Claude</em>, <em>Domina Gemini</em></td></tr>
<tr><td>Un agente de código</td><td>Trabaja sobre un proyecto completo, con supervisión puntual.</td><td><em>Domina Claude</em> (Claude Code)</td></tr>
<tr><td>Un asistente personal siempre activo</td><td>Corre en tu propio dispositivo, te encuentra en tus canales de siempre.</td><td><em>OpenClaw</em></td></tr>
<tr><td>Un equipo completo de agentes</td><td>Varios agentes coordinados con organigrama, presupuesto y gobernanza.</td><td><em>Paperclip</em> (este curso)</td></tr>
</table>

<h2>Un recordatorio importante para cerrar</h2>
<div class="warn">
⚠️ Cuanto más alto subes en esta escalera de autonomía, más importante se vuelve todo lo que viste en <em>Ética e Impacto de la IA</em> y en <em>Actualidad de la IA</em>: supervisión humana real, presupuestos claros, y la costumbre de revisar antes de confiar ciegamente. Un equipo de agentes mal supervisado no es solo un chatbot equivocado — puede significar código en producción, gasto real, o decisiones de negocio tomadas sin ti.
</div>

<h2>Lo que aprendiste en este curso</h2>
<ul>
<li>Qué es Paperclip y en qué se diferencia de un asistente individual como OpenClaw.</li>
<li>Sus cuatro pilares: tareas, organigrama, entrenamiento e infraestructura.</li>
<li>Cómo funcionan los heartbeats, los tickets y los espacios de trabajo aislados.</li>
<li>Cómo controla presupuestos y aplica gobernanza sobre agentes autónomos.</li>
<li>Cómo instalarlo y probarlo, incluido el modo sin instalación permanente.</li>
</ul>

<h2>Siguiente paso</h2>
<p>Si te interesa este espacio, revisa también <em>Fundamentos del Código Abierto</em> (las reglas generales de licencias y contribución que aplican a cualquier proyecto como estos dos) y <em>Historia de los Agentes de IA Autónomos</em> (de dónde viene esta ola de herramientas y hacia dónde parece ir).</p>
`,
      quiz('Según el cierre del curso, ¿qué se vuelve más importante a medida que subes en la "escalera de autonomía" (de un prompt suelto a un equipo completo de agentes)?',
        ['Nada cambia, la supervisión importa igual en todos los niveles', 'La supervisión humana real, los presupuestos claros y el hábito de revisar antes de confiar ciegamente', 'Ya no hace falta ninguna supervisión en absoluto', 'Solo importa la velocidad de respuesta'], 1)),
  ],
}
