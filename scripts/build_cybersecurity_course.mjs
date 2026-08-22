// Genera supabase/migration_041.sql: inserta el curso "Ciberseguridad para
// Todos: Protege tu Vida Digital" en public.courses. Corre una vez, no forma
// parte de la app. Uso: node scripts/build_cybersecurity_course.mjs
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const COURSE_ID = 'course-ciberseguridad-basica'

const modules = [
  // ── 0. Video: bienvenida / gancho de la historia ────────────────────────
  {
    id: 0,
    order: 0,
    type: 'video',
    title: 'Bienvenida: el día que Raúl perdió el control de su cuenta',
    description: 'Conoce a Emma y a Raúl — vas a seguir a los dos a lo largo de todo el curso.',
    videoId: 'aqz-KE-bpKQ',
    verticalVideoId: 'aqz-KE-bpKQ',
    exercises: [],
    resources: [],
  },

  // ── 1. Por qué importa ────────────────────────────────────────────────────
  {
    id: 1,
    order: 1,
    type: 'text',
    title: '¿Por qué importa la ciberseguridad?',
    description: 'No es solo para "gente de sistemas" — es para cualquiera que use un correo, un banco o redes sociales.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<div class="tip">
🛡️ Este curso es presentado por <strong>Rúbics Digital Solutions</strong> — "Crear un mundo digital más seguro". Todas las técnicas que vas a aprender son reales y aplicables hoy mismo, en tus cuentas de verdad.
</div>

<h2>Emma y Raúl</h2>
<p>A lo largo de este curso vas a seguir la historia de <strong>Emma</strong> y <strong>Raúl</strong>, dos compañeros de trabajo en la misma empresa. Emma aplica, uno por uno, cada consejo de este curso. Raúl piensa que "eso nunca le va a pasar a él" y se salta la mayoría. Vas a ver exactamente a dónde los lleva cada camino — incluyendo el momento en que a Raúl le abren un crédito a su nombre sin que él se entere.</p>
<div class="example">
📖 Esta es una historia ficticia, creada solo para este curso — pero cada técnica que usa el atacante en la historia (phishing, contraseñas reutilizadas, ingeniería social) es 100% real y pasa todos los días.
</div>

<h2>El mito de "a mí no me va a pasar"</h2>
<p>La mayoría de los ataques no van dirigidos a "gente importante" — van dirigidos a <strong>cualquiera</strong>, en masa, porque es barato para el atacante enviar un millón de correos falsos y solo necesita que 1 de cada 1000 personas caiga. No necesitas ser un objetivo especial para ser víctima: basta con ser descuidado en el momento equivocado.</p>

<h2>Lo que vas a aprender</h2>
<ul>
<li>Contraseñas seguras y gestores de contraseñas (con una herramienta gratuita real)</li>
<li>Autenticación de dos factores (2FA)</li>
<li>Cómo detectar phishing e ingeniería social</li>
<li>Malware, ransomware y cómo protegerte (antivirus real, gratis)</li>
<li>Wi-Fi pública, VPN, actualizaciones y copias de seguridad</li>
<li>Privacidad en redes sociales y navegación segura</li>
<li>Seguridad en el trabajo — y qué hacer si ya te hackearon</li>
</ul>

<div class="warn">
⚠️ No necesitas saber programar ni tener experiencia técnica para este curso. Cada herramienta que se menciona es gratuita, real, y te vamos a explicar exactamente cómo instalarla y usarla.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Por qué los atacantes envían ataques de phishing a millones de personas en vez de elegir "objetivos importantes"?',
      options: [
        'Porque es ilegal atacar a gente importante',
        'Porque es barato enviar muchísimos correos falsos, y solo necesitan que una pequeña fracción caiga para que valga la pena',
        'Porque solo pueden atacar a una persona a la vez',
        'Porque la gente común no tiene nada que robar',
      ],
      correctIndex: 1,
    },
  },

  // ── 2. Contraseñas seguras ───────────────────────────────────────────────
  {
    id: 2,
    order: 2,
    type: 'text',
    title: 'Contraseñas seguras: tu primera línea de defensa',
    description: 'El error más común — y el más fácil de arreglar hoy mismo.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<h2>El error de Raúl</h2>
<div class="bad">
🚫 Raúl usa la misma contraseña, <code>Futbol2015</code>, en su correo, su banco, sus redes sociales y hasta en la cuenta del trabajo. "Así no se me olvida", dice. El problema: si UNA sola de esas cuentas se filtra alguna vez (y las filtraciones de datos son constantes, incluso en empresas grandes), un atacante prueba esa misma contraseña en todas tus demás cuentas — a esto se le llama <strong>credential stuffing</strong>, y es completamente automatizado.
</div>

<h2>Qué hace fuerte a una contraseña</h2>
<table>
<tr><th>Débil</th><th>Por qué</th></tr>
<tr><td><code>123456</code>, <code>password</code>, <code>qwerty</code></td><td>Están en las primeras líneas de cualquier lista de contraseñas comunes — se prueban en segundos</td></tr>
<tr><td><code>Futbol2015</code></td><td>Palabra de diccionario + año — un ataque de "fuerza bruta inteligente" la adivina rápido</td></tr>
<tr><td>Tu nombre, cumpleaños, nombre de tu mascota</td><td>Información que cualquiera puede sacar de tus redes sociales</td></tr>
</table>

<div class="example">
✅ <strong>Mejor enfoque: una frase larga y aleatoria.</strong> <code>correcto-caballo-batería-grapa</code> es más difícil de adivinar por fuerza bruta que <code>P@ssw0rd1!</code>, y más fácil de recordar para un humano. Entre más larga la contraseña, exponencialmente más tiempo le toma a una computadora adivinarla.
</div>

<h2>La regla de oro: nunca repitas contraseñas</h2>
<p>Cada cuenta importante (correo, banco, redes sociales, trabajo) necesita su <strong>propia</strong> contraseña, distinta a todas las demás. Sabemos lo que estás pensando: "es imposible recordar 20 contraseñas distintas" — tienes razón, y por eso en la próxima clase vas a instalar una herramienta gratuita que las recuerda por ti.</p>

<div class="tip">
💡 Tu correo electrónico es tu cuenta MÁS importante de todas — con acceso a él, un atacante puede resetear las contraseñas de casi cualquier otra cuenta tuya ("Olvidé mi contraseña" → enlace al correo). Protégelo con la contraseña más fuerte que tengas.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Qué es el "credential stuffing"?',
      options: [
        'Un tipo de virus que borra contraseñas',
        'Cuando un atacante prueba automáticamente una contraseña filtrada de un sitio en muchos OTROS sitios, apostando a que la reutilizaste',
        'Guardar demasiadas contraseñas en un papel',
        'Un método para crear contraseñas más fuertes',
      ],
      correctIndex: 1,
    },
  },

  // ── 3. Gestor de contraseñas ─────────────────────────────────────────────
  {
    id: 3,
    order: 3,
    type: 'text',
    title: 'Herramienta real: un gestor de contraseñas (gratis)',
    description: 'La única forma práctica de tener una contraseña distinta y fuerte en cada cuenta.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<h2>Qué es un gestor de contraseñas</h2>
<p>Un <strong>gestor de contraseñas</strong> es una aplicación que genera y recuerda contraseñas larguísimas y aleatorias por ti — tú solo memorizas UNA contraseña maestra para abrir el gestor, y él se encarga del resto. Es, hoy, la herramienta individual más efectiva contra el robo de cuentas.</p>

<div class="example">
🔑 <strong>Herramienta recomendada: Bitwarden</strong> — gratuito, de código abierto (cualquiera puede revisar su código en busca de fallas de seguridad, lo cual es una señal de confianza), y disponible para computadora, celular y navegador. Descárgalo en <strong>bitwarden.com</strong> — es un enlace en los recursos de esta clase.
</div>

<h2>Cómo instalarlo y usarlo (paso a paso)</h2>
<ol>
<li>Ve a <strong>bitwarden.com</strong> y crea una cuenta gratuita con tu correo.</li>
<li>Elige una <strong>contraseña maestra</strong> fuerte y larga — esta es la ÚNICA contraseña que vas a tener que recordar de memoria. No la reutilices en ningún otro lugar.</li>
<li>Instala la extensión de Bitwarden en tu navegador (Chrome, Firefox, Edge) y la app en tu celular.</li>
<li>Cuando crees una cuenta nueva en cualquier sitio, deja que Bitwarden <strong>genere</strong> la contraseña por ti (un botón dentro de la extensión) — larga, aleatoria, imposible de adivinar.</li>
<li>Bitwarden la guarda y te la rellena automáticamente la próxima vez que entres a ese sitio.</li>
</ol>

<div class="tip">
💡 Empieza por tu correo, tu banco y tus redes sociales — no necesitas cambiar las 50 contraseñas que tengas el mismo día. Cambia primero las cuentas más importantes, y ve agregando el resto poco a poco cada vez que entres a un sitio nuevo.
</div>

<h2>Emma vs. Raúl</h2>
<div class="example">
Emma instaló Bitwarden hace 6 meses. Cada cuenta suya tiene una contraseña distinta de 20+ caracteres que ella nunca tuvo que inventar ni memorizar. Raúl sigue pensando que instalar "otra app" es una pérdida de tiempo.
</div>
`,
    exercises: [],
    resources: [
      { label: 'Bitwarden — gestor de contraseñas gratuito y de código abierto', url: 'https://bitwarden.com' },
    ],
    quiz: {
      question: '¿Qué es lo ÚNICO que tienes que memorizar al usar un gestor de contraseñas como Bitwarden?',
      options: [
        'Todas tus contraseñas, igual que antes',
        'Solo la contraseña maestra que abre el gestor — él recuerda el resto por ti',
        'Nada, no hace falta recordar nada',
        'El correo de cada cuenta',
      ],
      correctIndex: 1,
    },
  },

  // ── 4. Autenticación de dos factores ─────────────────────────────────────
  {
    id: 4,
    order: 4,
    type: 'text',
    title: 'Autenticación de dos factores (2FA): el candado extra',
    description: 'Incluso si te roban la contraseña, esto puede detener al atacante en seco.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<h2>¿Qué es 2FA?</h2>
<p>La <strong>autenticación de dos factores</strong> (2FA, o "verificación en dos pasos") pide algo MÁS que tu contraseña para entrar a una cuenta — normalmente un código de 6 dígitos que cambia cada 30 segundos, generado por una app en tu celular. Aunque un atacante tenga tu contraseña, sin ese código no puede entrar.</p>

<div class="example">
Piénsalo como la puerta de tu casa: la contraseña es la llave, y el 2FA es la cadena de seguridad adicional — incluso si alguien copia tu llave, la cadena sigue trabada por dentro.
</div>

<h2>Tipos de 2FA (de menos a más seguro)</h2>
<table>
<tr><th>Tipo</th><th>Cómo funciona</th><th>Nota</th></tr>
<tr><td>SMS (código por mensaje de texto)</td><td>Te llega un código por SMS</td><td>Mejor que nada, pero vulnerable a un ataque llamado "SIM swapping"</td></tr>
<tr><td>App de autenticación</td><td>Una app (Google Authenticator, Aegis) genera el código en tu celular, sin necesitar señal</td><td>Recomendado — es gratis y más seguro que SMS</td></tr>
<tr><td>Llave física de seguridad</td><td>Un dispositivo USB/NFC que conectas o acercas al celular</td><td>El más seguro, común en empresas grandes</td></tr>
</table>

<h2>Cómo activarlo (pasos generales)</h2>
<ol>
<li>Descarga una app de autenticación gratuita (Google Authenticator o Aegis, disponibles en la tienda de tu celular).</li>
<li>Entra a la configuración de seguridad de tu cuenta (correo, banco, redes sociales) y busca "Verificación en dos pasos" o "2FA".</li>
<li>Escanea el código QR que te muestra el sitio con la app de autenticación.</li>
<li>Guarda los <strong>códigos de respaldo</strong> que te den en un lugar seguro — los vas a necesitar si pierdes tu celular.</li>
</ol>

<div class="warn">
⚠️ Activa 2FA primero en tu correo — es la cuenta que un atacante usaría para resetear todas las demás.
</div>

<h2>Emma vs. Raúl</h2>
<div class="example">
Emma tiene 2FA activo en su correo, su banco y sus redes sociales. Raúl lo desactivó hace tiempo porque "le daba flojera sacar el código cada vez". Ese código de 6 dígitos es exactamente lo que le va a faltar al atacante para completar el ataque contra él.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Por qué una app de autenticación (como Google Authenticator) es generalmente más segura que recibir el código por SMS?',
      options: [
        'No hay ninguna diferencia real',
        'El SMS es vulnerable a un ataque llamado SIM swapping, donde el atacante transfiere tu número a su propio celular',
        'Las apps de autenticación son más lentas',
        'El SMS es más caro de usar',
      ],
      correctIndex: 1,
    },
  },

  // ── 5. Phishing ────────────────────────────────────────────────────────────
  {
    id: 5,
    order: 5,
    type: 'text',
    title: 'Phishing: cómo reconocer un correo o mensaje falso',
    description: 'El correo que recibió Raúl — y las 6 señales que se saltó.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<h2>¿Qué es el phishing?</h2>
<p><strong>Phishing</strong> (pronunciado como "fishing", pescar) es cuando un atacante se hace pasar por una empresa, banco o persona de confianza para engañarte y que reveles tu contraseña, datos bancarios, o hagas clic en un enlace malicioso.</p>

<h2>El correo que recibió Raúl</h2>
<div class="bad">
📧 <strong>Asunto:</strong> "Actividad inusual detectada en tu cuenta — verifica ahora"<br/><br/>
"Estimado cliente, hemos detectado un inicio de sesión sospechoso. Por tu seguridad, verifica tu cuenta en las próximas 24 horas o será suspendida permanentemente. [Verificar mi cuenta ahora]"
</div>

<h2>Las 6 señales que Raúl no notó</h2>
<table>
<tr><th>Señal</th><th>Por qué es sospechosa</th></tr>
<tr><td>🚨 Urgencia extrema</td><td>"24 horas o se suspende" — el miedo te hace actuar sin pensar, esa es la intención</td></tr>
<tr><td>👤 Saludo genérico</td><td>"Estimado cliente" en vez de tu nombre real — tu banco de verdad sabe cómo te llamas</td></tr>
<tr><td>🔗 Enlace sospechoso</td><td>Al pasar el mouse sobre el enlace (sin hacer clic), la URL real no coincide con el sitio oficial del banco</td></tr>
<tr><td>✉️ Correo del remitente raro</td><td>Algo como <code>soporte@banc0-seguridad.com</code> en vez del dominio oficial del banco</td></tr>
<tr><td>📝 Errores de ortografía/redacción</td><td>Empresas grandes revisan sus comunicaciones — errores extraños son una bandera roja</td></tr>
<tr><td>💳 Piden datos que tu banco NUNCA pide por correo</td><td>Ningún banco serio te pide tu contraseña completa o el CVV de tu tarjeta por correo o mensaje</td></tr>
</table>

<div class="tip">
💡 Truco rápido y seguro: si un correo dice ser de tu banco, NUNCA hagas clic en su enlace. Abre tu navegador aparte y escribe tú mismo la dirección oficial del banco, o usa su app. Así, si el correo era falso, nunca llegas al sitio falso.
</div>

<h2>No es solo correo: smishing y vishing</h2>
<p>El mismo engaño existe por SMS (<strong>smishing</strong>) y por llamada telefónica (<strong>vishing</strong>) — vas a ver ambos a fondo en la siguiente clase.</p>

<div class="warn">
⚠️ Raúl hizo clic. La página se veía idéntica al sitio real de su banco — porque el atacante la copió pixel por pixel. Escribió su usuario y contraseña ahí mismo. Ese fue el primer dominó en caer.
</div>
`,
    exercises: [],
    resources: [
      { label: 'Google — Cómo reportar y reconocer phishing', url: 'https://safety.google/security/phishing/' },
    ],
    quiz: {
      question: 'Recibes un correo de tu "banco" pidiendo que verifiques tu cuenta URGENTEMENTE en un enlace, o será suspendida en 24 horas. ¿Cuál es la acción más segura?',
      options: [
        'Hacer clic de inmediato para evitar que se suspenda',
        'Ignorar el enlace, abrir el navegador aparte, y entrar directamente al sitio oficial del banco escribiendo la dirección tú mismo',
        'Responder el correo pidiendo más información',
        'Reenviarlo a un compañero de trabajo para que lo revise',
      ],
      correctIndex: 1,
    },
  },

  // ── 6. Ingeniería social ─────────────────────────────────────────────────
  {
    id: 6,
    order: 6,
    type: 'text',
    title: 'Ingeniería social: manipular personas, no computadoras',
    description: 'Por qué el eslabón más débil de la seguridad casi siempre es humano.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<h2>La técnica más antigua del mundo, aplicada a internet</h2>
<p>La <strong>ingeniería social</strong> es el arte de manipular a una persona para que haga algo que compromete su seguridad — sin necesitar hackear ningún sistema técnico. Es, con mucho, la forma más efectiva de ataque, porque los humanos confiamos, tenemos miedo, y queremos ayudar.</p>

<h2>Vishing: la llamada falsa</h2>
<div class="bad">
📞 "Buenos días, le hablo del departamento de fraudes de su banco. Detectamos un cargo sospechoso de $8,500 en su tarjeta. Para cancelarlo, necesito confirmar su número de tarjeta y el código de seguridad."
</div>
<p>Suena urgente, oficial, y da miedo — exactamente el punto. Un banco real NUNCA te va a llamar para pedirte tu número completo de tarjeta o tu contraseña.</p>

<h2>Smishing: el SMS falso</h2>
<div class="bad">
📱 "Tu paquete no pudo entregarse. Paga $15 de aduana aquí: [enlace falso]"
</div>
<p>Muy común porque casi todos esperan un paquete en algún momento — el atacante apuesta a la probabilidad, no a ti en específico.</p>

<h2>Pretexting: crear una historia creíble</h2>
<p>El atacante inventa una situación (se hace pasar por un compañero nuevo, un proveedor, hasta un jefe) para pedir información o acceso. En empresas, esto puede sonar así: "Habla Carlos de IT, necesito tu contraseña para resolver un problema del sistema urgente."</p>

<div class="tip">
💡 Regla de oro: <strong>ningún departamento de IT legítimo, banco o empresa seria te va a pedir tu contraseña completa por teléfono, correo o mensaje — nunca.</strong> Si alguien la pide, es un ataque, sin excepción.
</div>

<h2>Por qué funciona: las 3 palancas psicológicas</h2>
<ul>
<li><strong>Urgencia</strong> — "actúa ya, no tienes tiempo de pensarlo"</li>
<li><strong>Autoridad</strong> — "soy tu jefe / tu banco / la policía"</li>
<li><strong>Miedo</strong> — "vas a perder dinero / tu cuenta / tu trabajo si no actúas"</li>
</ul>
<div class="example">
Cuando sientas estas tres cosas juntas — urgencia, autoridad, miedo — en un mensaje inesperado, es la señal más clara de que estás frente a un ataque de ingeniería social. Detente y verifica por otro canal antes de actuar.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuáles son las 3 palancas psicológicas que casi siempre usa un ataque de ingeniería social?',
      options: [
        'Aburrimiento, curiosidad y humor',
        'Urgencia, autoridad y miedo',
        'Tristeza, nostalgia y confusión',
        'Ninguna — estos ataques son puramente técnicos',
      ],
      correctIndex: 1,
    },
  },

  // ── 7. Malware y ransomware ───────────────────────────────────────────────
  {
    id: 7,
    order: 7,
    type: 'text',
    title: 'Malware y ransomware: cuando el ataque ya entró',
    description: 'Qué son, cómo se propagan, y por qué el ransomware es especialmente peligroso.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<h2>Malware: el término general</h2>
<p><strong>Malware</strong> (software malicioso) es cualquier programa diseñado para dañar, espiar, o tomar control de tu dispositivo sin tu permiso. Es un término paraguas que incluye varios tipos:</p>

<table>
<tr><th>Tipo</th><th>Qué hace</th></tr>
<tr><td>Virus</td><td>Se copia a sí mismo y se propaga a otros archivos/dispositivos</td></tr>
<tr><td>Spyware</td><td>Te espía en silencio — captura lo que escribes, tus contraseñas, tu actividad</td></tr>
<tr><td>Troyano</td><td>Se disfraza de programa legítimo ("un juego gratis", "un crack de software") para que tú mismo lo instales</td></tr>
<tr><td>Ransomware</td><td>Cifra (bloquea) todos tus archivos y exige un pago para "liberarlos"</td></tr>
</table>

<h2>Ransomware: el más destructivo</h2>
<div class="bad">
🔒 Un ataque de ransomware puede cifrar en minutos TODOS los documentos, fotos y archivos de tu computadora (y de cualquier disco conectado a ella), mostrando un mensaje: "Paga $500 en criptomoneda en 72 horas o pierdes todo para siempre." Pagar no garantiza que recuperes tus archivos — y financia al atacante para su próximo ataque.
</div>

<h2>¿Cómo entra el malware a tu dispositivo?</h2>
<ul>
<li>Adjuntos de correo que abres sin verificar al remitente</li>
<li>Descargas de software "pirata" o de sitios no oficiales</li>
<li>Memorias USB desconocidas conectadas a tu computadora</li>
<li>Anuncios maliciosos ("malvertising") en sitios web</li>
<li>Enlaces de phishing (retomando la clase anterior)</li>
</ul>

<h2>Tu mejor defensa</h2>
<div class="example">
✅ La combinación que realmente funciona: un antivirus activo (siguiente clase), no abrir adjuntos/enlaces de remitentes desconocidos, descargar software SOLO de fuentes oficiales, y tener copias de seguridad recientes — si el ransomware llega a cifrar tus archivos, con un backup reciente simplemente restauras y sigues, sin pagarle nada al atacante.
</div>

<div class="tip">
💡 El backup no es una clase aparte "para nerds" — es literalmente la única defensa que vuelve inútil al ransomware. Lo vas a ver a fondo más adelante.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Por qué tener una copia de seguridad reciente vuelve casi inútil a un ataque de ransomware?',
      options: [
        'Porque el ransomware no puede infectar dispositivos con backups',
        'Porque si tus archivos son cifrados, puedes restaurar la copia de seguridad y seguir sin pagarle nada al atacante',
        'Porque los backups eliminan el ransomware automáticamente',
        'No hay ninguna relación entre ambas cosas',
      ],
      correctIndex: 1,
    },
  },

  // ── 8. Antivirus y firewall ───────────────────────────────────────────────
  {
    id: 8,
    order: 8,
    type: 'text',
    title: 'Herramienta real: antivirus y firewall (gratis)',
    description: 'Ya tienes una defensa básica instalada sin saberlo — y cómo reforzarla gratis.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<h2>Windows Defender: ya lo tienes</h2>
<p>Si usas Windows 10 u 11, ya tienes <strong>Microsoft Defender</strong> integrado y activo por defecto — es un antivirus y firewall real, gratuito, que Microsoft mejora constantemente. No necesitas comprar un antivirus de paga para tener protección básica sólida.</p>

<h2>Verifica que esté activo</h2>
<ol>
<li>Busca "Seguridad de Windows" en el menú de inicio.</li>
<li>Entra a "Protección contra virus y amenazas" — debe decir que la protección en tiempo real está activada.</li>
<li>Entra a "Firewall y protección de red" — confirma que el firewall esté activado en tu red actual.</li>
</ol>

<div class="warn">
⚠️ Nunca instales DOS antivirus a la vez — se interfieren entre sí y pueden dejarte MENOS protegido, no más.
</div>

<h2>Refuerzo gratuito: Malwarebytes</h2>
<div class="example">
🔎 <strong>Malwarebytes</strong> (versión gratuita) es una herramienta de escaneo bajo demanda — no reemplaza a Defender, lo complementa. Corre un escaneo completo cada mes o si sospechas que algo anda mal (tu computadora muy lenta, anuncios raros apareciendo solos). Descárgalo en <strong>malwarebytes.com</strong>.
</div>

<h2>Cómo usarlo</h2>
<ol>
<li>Descarga la versión gratuita desde el sitio oficial.</li>
<li>Instálalo y ábrelo.</li>
<li>Haz clic en "Escanear" (escaneo completo la primera vez).</li>
<li>Si encuentra algo, sigue las instrucciones para ponerlo en cuarentena o eliminarlo.</li>
</ol>

<h2>Emma vs. Raúl</h2>
<div class="example">
Emma nunca desactiva Windows Defender y corre un escaneo con Malwarebytes cada mes, sin falta. Raúl desactivó su antivirus hace un año porque "hacía lenta la computadora" para jugar — y nunca lo volvió a activar.
</div>
`,
    exercises: [],
    resources: [
      { label: 'Malwarebytes — escáner anti-malware gratuito', url: 'https://www.malwarebytes.com' },
    ],
    quiz: {
      question: '¿Por qué NUNCA deberías instalar dos programas antivirus al mismo tiempo?',
      options: [
        'Porque es ilegal',
        'Porque se interfieren entre sí y pueden dejarte con menos protección real, no más',
        'Porque ocupan demasiado espacio en disco',
        'No hay ningún problema en hacerlo',
      ],
      correctIndex: 1,
    },
  },

  // ── 9. Wi-Fi pública y VPN ────────────────────────────────────────────────
  {
    id: 9,
    order: 9,
    type: 'text',
    title: 'Wi-Fi pública y VPN: cuidado con las redes que no controlas',
    description: 'Ese café con Wi-Fi gratis puede no ser tan gratis como crees.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<h2>El riesgo real de la Wi-Fi pública</h2>
<p>Cuando te conectas a una red Wi-Fi pública (cafetería, aeropuerto, hotel), no tienes forma de saber quién más está en esa misma red, ni si el punto de acceso es siquiera legítimo. Un atacante en la misma red puede, con las herramientas correctas, interceptar tráfico no cifrado.</p>

<div class="bad">
📡 Ataque de "gemelo malvado" (evil twin): un atacante crea una red Wi-Fi con un nombre parecido al oficial (<code>Cafe_WiFi_Free</code> en vez de <code>CafeWiFi</code>) — te conectas pensando que es la del establecimiento, y todo tu tráfico pasa primero por su equipo.
</div>

<h2>Qué es una VPN</h2>
<p>Una <strong>VPN</strong> (Red Privada Virtual) cifra TODO tu tráfico de internet y lo hace pasar por un túnel seguro hasta un servidor de confianza — incluso si estás en una red Wi-Fi comprometida, nadie en esa red puede ver lo que haces.</p>

<div class="example">
🔒 <strong>Herramienta recomendada: ProtonVPN</strong> — tiene un plan gratuito real (no una "prueba" que expira), hecho por el mismo equipo detrás de ProtonMail, con buena reputación en privacidad. Descárgalo en <strong>protonvpn.com</strong>.
</div>

<h2>Cuándo SÍ necesitas VPN</h2>
<ul>
<li>Wi-Fi pública (cafés, aeropuertos, hoteles) — siempre</li>
<li>Trabajar remoto accediendo a sistemas de tu empresa desde fuera</li>
<li>Cualquier red que no controles tú mismo</li>
</ul>

<h2>Cuándo NO es tan crítico</h2>
<p>En tu propia red de casa (con contraseña fuerte y router actualizado), el riesgo es mucho menor — una VPN sigue siendo útil por privacidad general, pero no es la emergencia que sí es en Wi-Fi pública.</p>

<div class="tip">
💡 Señal simple para saber si un sitio cifra bien tu conexión (aparte de la VPN): revisa que la URL empiece con <code>https://</code> (con el candado en el navegador), no solo <code>http://</code>. Vas a ver esto a fondo en la clase de navegación segura.
</div>
`,
    exercises: [],
    resources: [
      { label: 'ProtonVPN — VPN con plan gratuito real', url: 'https://protonvpn.com' },
    ],
    quiz: {
      question: '¿Qué hace una VPN cuando estás conectado a una Wi-Fi pública?',
      options: [
        'Hace tu internet más rápido',
        'Cifra todo tu tráfico en un túnel seguro, así nadie más en esa red puede ver lo que haces',
        'Elimina virus automáticamente',
        'Cambia tu contraseña de Wi-Fi',
      ],
      correctIndex: 1,
    },
  },

  // ── 10. Actualizaciones de software ──────────────────────────────────────
  {
    id: 10,
    order: 10,
    type: 'text',
    title: 'Actualizaciones de software: la defensa que ignoras sin darte cuenta',
    description: 'Ese "Recordarme más tarde" tiene un costo real.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<h2>Por qué las actualizaciones importan tanto</h2>
<p>Cada vez que una empresa (Microsoft, Apple, Google, o el creador de cualquier app) encuentra una falla de seguridad en su software, la corrige y publica una actualización. Pero también, al publicar la corrección, básicamente le está avisando a los atacantes exactamente dónde estaba la falla — cualquiera que NO haya actualizado sigue siendo vulnerable a un problema ya conocido públicamente.</p>

<div class="bad">
🚫 Algunos de los ataques de ransomware más grandes de la historia se propagaron explotando fallas que YA tenían una corrección disponible meses antes — simplemente millones de dispositivos nunca se actualizaron.
</div>

<h2>Qué actualizar (y con qué frecuencia)</h2>
<table>
<tr><th>Qué</th><th>Frecuencia recomendada</th></tr>
<tr><td>Sistema operativo (Windows, macOS, Android, iOS)</td><td>Automático, apenas esté disponible</td></tr>
<tr><td>Navegador (Chrome, Firefox, Edge)</td><td>Automático — casi todos ya se autoactualizan</td></tr>
<tr><td>Apps del celular</td><td>Automático o revisar semanalmente</td></tr>
<tr><td>Router de tu casa</td><td>Revisar cada pocos meses — mucha gente nunca lo hace</td></tr>
</table>

<h2>Cómo activar actualizaciones automáticas</h2>
<ol>
<li><strong>Windows:</strong> Configuración → Windows Update → activa "Recibir actualizaciones automáticamente".</li>
<li><strong>Celular (Android/iOS):</strong> en la tienda de apps, busca "Actualizar automáticamente" en configuración.</li>
<li><strong>Router:</strong> entra al panel de administración (normalmente escribiendo <code>192.168.1.1</code> en el navegador) y busca "Actualización de firmware".</li>
</ol>

<div class="tip">
💡 Sí, a veces una actualización llega en mal momento (a mitad de una videollamada importante). Aun así, nunca la pospongas indefinidamente — agenda 5 minutos para instalarla el mismo día, no "algún día".
</div>

<h2>Emma vs. Raúl</h2>
<div class="example">
El teléfono de Raúl lleva 3 meses pidiendo actualizar el sistema operativo. Sigue posponiéndolo. Cada día que pasa, sigue expuesto a fallas que ya fueron corregidas — para todos menos para él.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Por qué posponer una actualización de seguridad es especialmente riesgoso DESPUÉS de que la empresa la publica?',
      options: [
        'No es riesgoso, se puede posponer indefinidamente',
        'Porque al publicar la corrección, la falla que arregla se vuelve pública — y quien no actualiza sigue expuesto a un problema ya conocido',
        'Porque las actualizaciones borran tus archivos',
        'Porque cuestan dinero',
      ],
      correctIndex: 1,
    },
  },

  // ── 11. Copias de seguridad ───────────────────────────────────────────────
  {
    id: 11,
    order: 11,
    type: 'text',
    title: 'Copias de seguridad: la regla 3-2-1',
    description: 'La única defensa que vuelve inútil un ransomware — y protege contra fallas de hardware también.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<h2>La regla 3-2-1</h2>
<div class="example">
📦 <strong>3</strong> copias de tus archivos importantes (el original + 2 copias) · en <strong>2</strong> tipos de almacenamiento distintos (por ejemplo, tu computadora + un disco externo) · con <strong>1</strong> copia fuera de tu casa/oficina (la nube, o un disco en otro lugar físico).
</div>
<p>El motivo del "1 fuera de casa": si tu casa sufre un robo, incendio, o inundación, un backup que estaba junto a tu computadora original no te sirve de nada — se pierde exactamente al mismo tiempo que el original.</p>

<h2>Herramientas gratuitas reales</h2>
<table>
<tr><th>Opción</th><th>Espacio gratis</th></tr>
<tr><td>Google Drive</td><td>15 GB gratis (compartido con Gmail/Fotos)</td></tr>
<tr><td>Microsoft OneDrive</td><td>5 GB gratis (viene con cuentas de Microsoft)</td></tr>
<tr><td>Disco duro externo</td><td>Compra única, sin límite de nube — ideal como tu segunda copia local</td></tr>
</table>

<h2>Cómo empezar hoy</h2>
<ol>
<li>Identifica tus archivos realmente importantes: fotos familiares, documentos, contratos, trabajo.</li>
<li>Súbelos a Google Drive o OneDrive (arrastra la carpeta a la app de escritorio — se sincroniza sola después).</li>
<li>Si tienes un disco externo, copia esos mismos archivos ahí también, cada mes.</li>
<li>Activa la sincronización automática donde puedas, para no depender de acordarte cada vez.</li>
</ol>

<div class="warn">
⚠️ Un backup que nunca pruebas restaurar es una falsa sensación de seguridad — de vez en cuando, abre un archivo desde tu copia de respaldo para confirmar que sí funciona.
</div>

<div class="tip">
💡 Si algún día un ransomware cifra tus archivos, con un backup reciente el proceso es simple: formatea o limpia el dispositivo infectado, y restauras tus archivos desde la copia — sin pagarle un solo peso al atacante.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: 'En la regla 3-2-1 de copias de seguridad, ¿por qué es importante que 1 copia esté FUERA de tu casa u oficina?',
      options: [
        'Para que ocupe menos espacio',
        'Porque si tu casa sufre un robo, incendio o inundación, una copia guardada ahí mismo se pierde junto con el original',
        'No es realmente necesario, es solo una recomendación sin motivo',
        'Porque las copias locales son ilegales',
      ],
      correctIndex: 1,
    },
  },

  // ── 12. Privacidad en redes sociales ─────────────────────────────────────
  {
    id: 12,
    order: 12,
    type: 'text',
    title: 'Privacidad en redes sociales: lo que publicas es munición',
    description: 'Cómo un atacante usa tu propio perfil en tu contra.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<h2>Lo que publicas alimenta la ingeniería social</h2>
<p>Recuerda la clase de ingeniería social: entre más sabe un atacante sobre ti, más creíble puede hacer su ataque. Tu fecha de nacimiento, el nombre de tu mascota, dónde trabajas, cuándo te vas de vacaciones — todo eso, público en tus redes, es información que un atacante puede usar para adivinar contraseñas o construir una historia convincente.</p>

<div class="bad">
🎂 Muchas preguntas de seguridad ("¿nombre de tu primera mascota?", "¿en qué ciudad naciste?") tienen respuestas que cualquiera puede encontrar en un perfil público en minutos.
</div>

<h2>Ajustes de privacidad recomendados</h2>
<ul>
<li><strong>Perfil privado</strong> en vez de público, cuando la plataforma lo permita.</li>
<li><strong>Limita quién ve tu lista de amigos/seguidores</strong> — reduce el material para suplantación.</li>
<li><strong>Revisa qué apps de terceros tienen acceso</strong> a tu cuenta (configuración → aplicaciones conectadas) y elimina las que ya no uses.</li>
<li><strong>No publiques en tiempo real</strong> que estás de vacaciones — mejor comparte las fotos cuando ya regresaste a casa.</li>
</ul>

<h2>Cómo revisar tu configuración (pasos generales)</h2>
<ol>
<li>Entra a Configuración → Privacidad en la app.</li>
<li>Cambia la visibilidad de tu perfil, publicaciones y lista de contactos a "Solo amigos" o el nivel más restrictivo que te sirva.</li>
<li>Revisa la sección de "Apps conectadas" o "Aplicaciones y sitios web" y elimina accesos que no reconozcas.</li>
</ol>

<div class="tip">
💡 No se trata de dejar de usar redes sociales — se trata de decidir a propósito qué compartes, en vez de dejarlo en la configuración pública por defecto sin pensarlo.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Por qué compartir en tiempo real que estás de vacaciones puede ser un riesgo de seguridad?',
      options: [
        'No es ningún riesgo',
        'Porque le informa públicamente a cualquiera (incluyendo posibles atacantes) que tu casa está vacía en ese momento',
        'Porque consume muchos datos móviles',
        'Porque las redes sociales lo prohíben',
      ],
      correctIndex: 1,
    },
  },

  // ── 13. Navegación segura ─────────────────────────────────────────────────
  {
    id: 13,
    order: 13,
    type: 'text',
    title: 'Navegación segura: HTTPS, extensiones y descargas',
    description: 'Hábitos simples que evitan la mayoría de los problemas antes de que empiecen.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<h2>HTTPS: el candado en la barra de direcciones</h2>
<p>Cuando un sitio usa <strong>HTTPS</strong> (verás un candado 🔒 junto a la URL), la conexión entre tu navegador y el sitio está cifrada — nadie en el camino puede leer lo que envías. La mayoría de sitios serios lo usan hoy por defecto.</p>
<div class="warn">
⚠️ HTTPS confirma que la conexión está cifrada, pero NO confirma que el sitio sea legítimo — un sitio de phishing también puede tener HTTPS. Sigue verificando la URL exacta, no solo el candado.
</div>

<h2>Extensiones de navegador: revisa antes de instalar</h2>
<p>Una extensión maliciosa puede leer todo lo que escribes, incluidas contraseñas. Antes de instalar cualquiera:</p>
<ul>
<li>Revisa cuántas reseñas tiene y qué dicen.</li>
<li>Revisa qué permisos pide — si una extensión de "notas" pide "leer todo lo que escribes en cualquier sitio", es una bandera roja.</li>
<li>Desinstala las que ya no uses — menos extensiones activas, menos superficie de ataque.</li>
</ul>

<h2>Descargas seguras</h2>
<div class="example">
✅ Descarga software SOLO del sitio oficial del creador, o de tiendas oficiales (Microsoft Store, App Store, Google Play). Nunca de "sitios de descarga gratis" de terceros que empaquetan el instalador real junto con malware adicional.
</div>

<h2>Verifica antes de dar clic</h2>
<p>En computadora, pasa el mouse sobre cualquier enlace (sin hacer clic) para ver la URL real que aparece abajo del navegador — si no coincide con lo que esperabas, no hagas clic. En celular, mantén presionado el enlace para ver una vista previa antes de abrirlo.</p>

<div class="tip">
💡 Instala un bloqueador de anuncios confiable (uBlock Origin es una opción gratuita muy usada) — además de quitarte publicidad molesta, bloquea muchos anuncios maliciosos ("malvertising") antes de que puedan cargar.
</div>
`,
    exercises: [],
    resources: [
      { label: 'uBlock Origin — bloqueador de anuncios gratuito y de código abierto', url: 'https://ublockorigin.com' },
    ],
    quiz: {
      question: '¿El candado 🔒 (HTTPS) en la barra de direcciones garantiza que un sitio es legítimo y seguro de usar?',
      options: [
        'Sí, siempre',
        'No — solo confirma que la conexión está cifrada, un sitio de phishing también puede tener HTTPS',
        'Solo en sitios bancarios',
        'El candado ya no se usa en navegadores modernos',
      ],
      correctIndex: 1,
    },
  },

  // ── 14. Seguridad en el trabajo ───────────────────────────────────────────
  {
    id: 14,
    order: 14,
    type: 'text',
    title: 'Seguridad en el trabajo: tu responsabilidad no termina en casa',
    description: 'Un error en la computadora del trabajo puede afectar a toda la empresa, no solo a ti.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<h2>Por qué las empresas son un blanco especialmente atractivo</h2>
<p>Un atacante que compromete la cuenta de un solo empleado a veces puede moverse lateralmente hacia sistemas más sensibles, datos de clientes, o información financiera de la empresa entera. Por eso muchos ataques de phishing e ingeniería social se dirigen específicamente a direcciones de correo corporativas.</p>

<h2>Reglas básicas en el entorno de trabajo</h2>
<ul>
<li><strong>Nunca conectes una USB desconocida</strong> a tu computadora del trabajo — dejar USBs infectadas "perdidas" en el estacionamiento es una técnica real de ataque, apostando a que la curiosidad gane.</li>
<li><strong>Bloquea tu pantalla</strong> siempre que te alejes de tu escritorio (Windows + L en Windows), incluso "solo un momento".</li>
<li><strong>No uses tu contraseña del trabajo en sitios personales</strong>, ni al revés.</li>
<li><strong>Reporta cualquier correo sospechoso</strong> al equipo de IT en vez de solo borrarlo — así pueden avisarle al resto de la empresa antes de que alguien más caiga.</li>
<li><strong>Verifica peticiones inusuales</strong> (transferencias, cambios de datos bancarios de un proveedor) por un segundo canal — una llamada directa, no respondiendo al mismo correo.</li>
</ul>

<div class="bad">
🚫 Un fraude muy común en empresas: un correo que parece venir del "CEO" pidiéndole a alguien de finanzas una transferencia urgente y confidencial. El atacante investigó previamente en LinkedIn quién es el CEO y quién maneja los pagos — otra vez, ingeniería social con datos públicos.
</div>

<h2>BYOD (usar tu propio dispositivo para el trabajo)</h2>
<p>Si usas tu celular o computadora personal para trabajo, aplica exactamente las mismas reglas de este curso ahí también — contraseñas fuertes, 2FA, actualizaciones al día. Un dispositivo personal comprometido puede ser la puerta de entrada a los sistemas de la empresa igual que uno corporativo.</p>

<div class="tip">
💡 Si algo se siente raro — un correo, una llamada, una petición fuera de lo normal — repórtalo. Ningún equipo de seguridad se molesta por una alerta que resultó ser falsa; sí les preocupa mucho una que nadie reportó.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Por qué es peligroso conectar una memoria USB desconocida (encontrada, por ejemplo, en el estacionamiento) a la computadora del trabajo?',
      options: [
        'Puede dañar el puerto USB físicamente',
        'Puede contener malware preparado para infectar tu computadora en cuanto la conectas — es una técnica real de ataque',
        'No hay ningún riesgo real en esto',
        'Solo es un problema si la USB no tiene contraseña',
      ],
      correctIndex: 1,
    },
  },

  // ── 15. Video: el clímax ──────────────────────────────────────────────────
  {
    id: 15,
    order: 15,
    type: 'video',
    title: 'El clímax: Raúl cae en la trampa',
    description: 'El momento en que todo lo que Raúl se saltó, se junta en un solo ataque.',
    videoId: 'aqz-KE-bpKQ',
    verticalVideoId: 'aqz-KE-bpKQ',
    exercises: [],
    resources: [],
    quiz: {
      question: 'En la historia, ¿cuáles de las medidas de este curso NO tenía activas Raúl cuando cayó en el ataque? (elige la combinación correcta)',
      options: [
        'Todas las tenía activas, no pudo evitarlo de todos modos',
        'Contraseña única fuerte, 2FA en su correo/banco, y el hábito de verificar enlaces antes de hacer clic',
        'Solo le faltaba el antivirus',
        'El ataque no tuvo relación con nada visto en el curso',
      ],
      correctIndex: 1,
    },
  },

  // ── 16. Robo de identidad y respuesta ────────────────────────────────────
  {
    id: 16,
    order: 16,
    type: 'text',
    title: 'Robo de identidad: qué hacer si ya te hackearon',
    description: 'La checklist exacta que Raúl necesitaba — y que tú puedes usar ahora mismo si algo así te pasa.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<h2>Lo que le pasó a Raúl</h2>
<p>Con su contraseña y sin 2FA que lo detuviera, el atacante entró a la cuenta bancaria de Raúl, cambió su información de contacto, y usando esos mismos datos (más lo que encontró en sus redes sociales) solicitó un crédito a su nombre en otra institución. Raúl se enteró semanas después, al recibir una llamada de cobranza por una deuda que nunca pidió.</p>

<h2>Checklist de respuesta inmediata (primeras 24 horas)</h2>
<ol>
<li><strong>Cambia la contraseña</strong> de la cuenta comprometida de inmediato, desde un dispositivo que sepas que está limpio.</li>
<li><strong>Activa 2FA</strong> si todavía no lo tenías (nunca es tarde).</li>
<li><strong>Contacta a tu banco directamente</strong> — por teléfono, con el número oficial en el reverso de tu tarjeta, no el que venga en cualquier correo — y reporta la actividad sospechosa.</li>
<li><strong>Revisa y cambia contraseñas reutilizadas</strong> en cualquier otra cuenta que compartiera esa misma contraseña.</li>
<li><strong>Revisa los dispositivos/sesiones activas</strong> de la cuenta comprometida (casi todas las plataformas tienen esta opción) y cierra las que no reconozcas.</li>
</ol>

<h2>Si sospechas robo de identidad (créditos, cuentas a tu nombre)</h2>
<ol>
<li><strong>Solicita tu reporte de crédito</strong> ante el buró de crédito de tu país — revisa si hay cuentas o créditos que no reconoces.</li>
<li><strong>Denuncia formalmente</strong> ante la institución financiera involucrada y, si aplica, ante la autoridad correspondiente.</li>
<li><strong>Pide un "bloqueo" o alerta de fraude</strong> en tu buró de crédito, para dificultar que se abran más cuentas a tu nombre sin verificación extra.</li>
<li><strong>Documenta todo</strong> — fechas, capturas de pantalla, números de folio de cada reporte que hagas.</li>
</ol>

<div class="tip">
💡 Herramienta real y gratuita: en <strong>haveibeenpwned.com</strong> puedes escribir tu correo y ver si apareció en alguna filtración de datos conocida — si aparece, es momento de cambiar esa contraseña donde la hayas usado.
</div>

<div class="warn">
⚠️ Entre más rápido actúes, menos daño alcanza a hacer el atacante — no esperes "a ver si se resuelve solo".
</div>
`,
    exercises: [],
    resources: [
      { label: 'Have I Been Pwned — revisa si tu correo apareció en una filtración de datos', url: 'https://haveibeenpwned.com' },
    ],
    quiz: {
      question: '¿Qué debes hacer PRIMERO si descubres que una de tus cuentas fue comprometida?',
      options: [
        'Esperar unos días a ver si el problema se resuelve solo',
        'Cambiar la contraseña de inmediato desde un dispositivo limpio, y activar 2FA si no lo tenías',
        'Borrar la cuenta por completo',
        'No hacer nada hasta consultarlo con alguien',
      ],
      correctIndex: 1,
    },
  },

  // ── 17. Cierre ─────────────────────────────────────────────────────────────
  {
    id: 17,
    order: 17,
    type: 'text',
    title: 'Cierre: así se mantuvo protegida Emma',
    description: 'Tu checklist final — y las herramientas gratuitas que ya conoces para aplicarla hoy.',
    videoId: 'aqz-KE-bpKQ',
    content: `
<h2>La misma historia, dos finales distintos</h2>
<p>Cuando el mismo atacante intentó el mismo ataque contra Emma semanas después (usando una lista de correos filtrada de la empresa), su intento no llegó a ningún lado: la contraseña de Emma era única y estaba en Bitwarden, así que aunque el atacante hubiera adivinado algo, no le habría servido en ninguna otra cuenta. Y aunque hubiera conseguido su contraseña, el 2FA de su correo lo habría detenido en seco. Emma ni se enteró de que fue un objetivo — su rutina de seguridad simplemente funcionó, en silencio.</p>

<h2>Tu checklist final — hazlo esta semana</h2>
<div class="example">
✅ Instala Bitwarden y cambia la contraseña de tu correo primero.<br/>
✅ Activa 2FA en tu correo, banco y redes sociales principales.<br/>
✅ Confirma que Windows Defender esté activo; agenda un escaneo con Malwarebytes.<br/>
✅ Revisa tu correo en haveibeenpwned.com.<br/>
✅ Sube tus archivos importantes a Google Drive u OneDrive (regla 3-2-1).<br/>
✅ Revisa la configuración de privacidad de tus redes sociales.<br/>
✅ Activa actualizaciones automáticas en tu computadora y celular.<br/>
✅ Guarda una VPN gratuita (ProtonVPN) para la próxima vez que uses Wi-Fi pública.
</div>

<h2>Lo más importante de todo el curso</h2>
<p>No necesitas hacer las 8 cosas de esa lista hoy mismo — necesitas empezar por UNA, hoy, y seguir con la siguiente mañana. La diferencia entre Emma y Raúl nunca fue conocimiento técnico avanzado; fue simplemente aplicar, de forma constante, hábitos simples que cualquiera puede aprender.</p>

<div class="tip">
🛡️ Este curso fue posible gracias a <strong>Rúbics Digital Solutions</strong> — "Crear un mundo digital más seguro". Comparte lo que aprendiste con alguien que, como Raúl, todavía piensa que "a mí no me va a pasar".
</div>
`,
    exercises: [],
    resources: [],
  },

  // ── 18. Reto final: detector de phishing ─────────────────────────────────
  {
    id: 18,
    order: 18,
    type: 'text',
    title: '🎣 Reto Final: Detecta el Phishing',
    description: 'Pon a prueba todo lo que aprendiste — elige cuál de estos 3 correos NO es phishing.',
    content: `
<h2>Última prueba antes de graduarte</h2>
<p>Abajo hay 3 correos. Dos son phishing — el tercero es legítimo. Usa todo lo que aprendiste en la clase de phishing (urgencia, saludo genérico, dominio raro) para identificar cuál es el real.</p>
`,
    exercises: [],
    resources: [],
    phishingGame: {
      title: 'Detector de Phishing',
      intro: 'Elige el correo que SÍ es legítimo — los otros dos son phishing.',
      emails: [
        {
          id: 'legit',
          sender: 'notificaciones@bancoseguro.com.mx',
          subject: 'Tu estado de cuenta de agosto ya está disponible',
          preview: 'Hola, tu estado de cuenta del mes está listo para consultar. Ingresa a la app o a bancoseguro.com.mx directamente para verlo. No es necesario hacer nada más.',
          isPhishing: false,
          explanation: '✅ Legítimo: te habla por tu nombre real, no pide ninguna acción urgente ni tu contraseña, y te invita a entrar TÚ MISMO al sitio oficial, no con un enlace del correo.',
        },
        {
          id: 'urgente',
          sender: 'seguridad@bancoseguro-alertas.com',
          subject: '🚨 URGENTE: Verifica tu cuenta en 24 horas o será suspendida',
          preview: 'Estimado cliente, hemos detectado actividad sospechosa. Haz clic aquí para verificar tu identidad de inmediato o tu cuenta quedará bloqueada permanentemente.',
          isPhishing: true,
          explanation: '🎣 Phishing: dominio sospechoso (no es el oficial del banco), saludo genérico ("Estimado cliente"), y urgencia extrema con amenaza — las tres señales clásicas.',
        },
        {
          id: 'soporte',
          sender: 'soporte-ti@0liver-academy-help.com',
          subject: 'Tu contraseña expira hoy — restablécela aquí',
          preview: 'Hola, somos el equipo de soporte técnico. Tu contraseña vence hoy y necesitamos que la confirmes en este enlace para no perder acceso a tu cuenta.',
          isPhishing: true,
          explanation: '🎣 Phishing: ningún equipo de soporte real pide confirmar tu contraseña por correo, y el dominio usa un CERO en vez de la letra O — un truco común para parecer legítimo a primera vista.',
        },
      ],
    },
  },
]

const course = {
  id: COURSE_ID,
  title: 'Ciberseguridad para Todos: Protege tu Vida Digital',
  description: 'El curso de seguridad digital para personas comunes y trabajadores de empresa, presentado por Rúbics Digital Solutions ("Crear un mundo digital más seguro"). Contraseñas, 2FA, phishing, malware, VPN, backups y más — con herramientas gratuitas reales y la historia de Emma y Raúl, dos compañeros de trabajo que eligen caminos muy distintos.',
  ai_instructions: 'Eres el Centinela, guía de la Academia de Ciberseguridad de Oliver Academy, en el curso "Ciberseguridad para Todos: Protege tu Vida Digital". Tu tono es claro, cercano y sin jerga técnica innecesaria — el público son personas comunes y trabajadores de empresa, no especialistas. Usa la historia de Emma (quien aplica cada consejo) y Raúl (quien no lo hace y termina con un crédito robado a su nombre) para ilustrar por qué cada técnica importa. Cuando recomiendes herramientas, menciona solo las gratuitas y reales del curso (Bitwarden, Malwarebytes, ProtonVPN, Have I Been Pwned) y explica los pasos concretos para usarlas.',
  icon: '🛡️',
  color: '#14b8a6',
  category: 'Ciberseguridad',
  subcategory: 'Seguridad Personal',
  difficulty: 'principiante',
  locked: false,
  modules: modules.map((m, i) => ({ ...m, id: i, order: i })),
}

// ── SQL ─────────────────────────────────────────────────────────────────
function sqlStr(js) {
  return `'${JSON.stringify(js).replace(/'/g, "''")}'`
}

const sql = `-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 041 — Curso "Ciberseguridad para Todos: Protege tu Vida Digital"
-- (course-ciberseguridad-basica) — presentado por Rúbics Digital Solutions.
-- ${course.modules.length} clases: contraseñas, gestor de contraseñas (Bitwarden), 2FA,
-- phishing, ingeniería social, malware/ransomware, antivirus (Malwarebytes),
-- Wi-Fi pública/VPN (ProtonVPN), actualizaciones, backups (regla 3-2-1),
-- privacidad en redes sociales, navegación segura, seguridad en el trabajo,
-- robo de identidad y respuesta a incidentes (Have I Been Pwned). Narrativa
-- de Emma y Raúl a lo largo de todo el curso, con 2 videos (bienvenida +
-- clímax) en formato horizontal Y vertical (verticalVideoId).
-- Sin traducción a inglés (no se pidió para este curso).
-- ════════════════════════════════════════════════════════════════════════

insert into public.courses
  (id, title, description, ai_instructions, icon, color, category, subcategory, difficulty, locked, modules)
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
  ${sqlStr(course.modules)}
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
  updated_at = now();
`

writeFileSync(path.join(process.cwd(), 'supabase', 'migration_041.sql'), sql)
console.log('✓ supabase/migration_041.sql —', course.modules.length, 'módulos,', JSON.stringify(sql).length, 'bytes de SQL')
