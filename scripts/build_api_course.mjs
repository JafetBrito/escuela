// Genera supabase/migration_040.sql: inserta el curso "APIs con Python: Crea
// tu Bot Consultor de Telegram" en public.courses. Corre una vez, no forma
// parte de la app. Uso: node scripts/build_api_course.mjs
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const COURSE_ID = 'course-apis-python-telegram-bot'

const modules = [
  // ── 0. Video: bienvenida ────────────────────────────────────────────────
  {
    id: 0,
    order: 0,
    type: 'video',
    title: 'Bienvenida: vas a construir tu propio bot consultor de Telegram',
    description: 'Qué vas a lograr en este curso y por qué las APIs son la habilidad que conecta todo lo demás que ya sabes programar.',
    videoId: 'aqz-KE-bpKQ',
    exercises: [],
    resources: [],
  },

  // ── 1. ¿Qué es una API? ──────────────────────────────────────────────────
  {
    id: 1,
    order: 1,
    type: 'text',
    title: '¿Qué es una API? El mesero del restaurante',
    description: 'La analogía que te va a acompañar todo el curso — y el concepto más importante que vas a aprender hoy.',
    content: `
<h2>El problema que resuelve una API</h2>
<p>Imagina que quieres el clima de tu ciudad ahora mismo. Ese dato vive en la computadora de una empresa de meteorología, en algún servidor, en algún lugar del mundo. Tú no tienes acceso directo a esa computadora — ni deberías necesitarlo. Necesitas una forma <strong>estandarizada</strong> de pedirle ese dato, sin tener que entender cómo está construida por dentro.</p>
<p>Eso es exactamente lo que resuelve una <strong>API</strong> (Application Programming Interface, "Interfaz de Programación de Aplicaciones"): un contrato claro que dice "pídeme esto de esta forma, y te devuelvo esto otro".</p>

<h2>La analogía del restaurante</h2>
<div class="example">
<p>Estás en un restaurante. No entras a la cocina a buscar tu comida — le pides al <strong>mesero</strong> algo del <strong>menú</strong>, el mesero lleva tu orden a la cocina, y te trae de vuelta el platillo.</p>
<ul>
<li><strong>Tú</strong> = tu programa (o tu bot de Telegram)</li>
<li><strong>El mesero</strong> = la API</li>
<li><strong>El menú</strong> = la documentación de la API (qué le puedes pedir)</li>
<li><strong>La cocina</strong> = el servidor, con toda su lógica y sus datos</li>
<li><strong>El platillo</strong> = la respuesta que recibes (normalmente en formato JSON)</li>
</ul>
</div>

<p>No te importa cómo la cocina prepara el platillo (qué base de datos usa, en qué lenguaje está escrito el servidor, cómo está organizado internamente) — solo te importa que, si pides algo que está en el menú, en la forma correcta, vas a recibir tu platillo.</p>

<h2>¿Por qué esto te importa como programador?</h2>
<ul>
<li><strong>No tienes que reinventar nada</strong> — si quieres el clima, no necesitas montar tu propia red de estaciones meteorológicas. Alguien ya lo hizo, y expone esos datos vía una API.</li>
<li><strong>Puedes combinar servicios de todo el mundo</strong> — tu programa puede consultar la NASA, el clima, una base de datos de videojuegos, y una red social, todo en el mismo script.</li>
<li><strong>Es la base de casi todo lo que usas</strong> — cuando una app del clima te muestra la temperatura, cuando pagas con tarjeta, cuando inicias sesión con Google: todo eso son APIs conversando entre sí.</li>
</ul>

<div class="tip">
💡 En este curso vas a construir un <strong>bot de Telegram</strong> — que en el fondo es un programa que hace exactamente dos cosas: escucha mensajes de Telegram (usando la API de Telegram) y le pide datos a otra API (la que tú elijas) para responder algo útil.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: 'En la analogía del restaurante, ¿qué representa la API?',
      options: [
        'El cliente que pide la comida',
        'El mesero: recibe tu pedido y te trae la respuesta, sin que veas la cocina',
        'La comida que te sirven',
        'La cocina completa, con todos sus detalles internos',
      ],
      correctIndex: 1,
    },
  },

  // ── 2. HTTP y JSON ────────────────────────────────────────────────────────
  {
    id: 2,
    order: 2,
    type: 'text',
    title: 'HTTP y JSON: el lenguaje de las APIs',
    description: 'Los dos ingredientes que necesitas entender antes de escribir una sola línea de código.',
    content: `
<h2>HTTP: cómo "se habla" con un servidor</h2>
<p>Casi todas las APIs que vas a usar funcionan sobre <strong>HTTP</strong>, el mismo protocolo que usa tu navegador para cargar páginas web. Cada petición HTTP tiene un <strong>método</strong> que dice qué quieres hacer:</p>

<table>
<tr><th>Método</th><th>Para qué se usa</th></tr>
<tr><td><code>GET</code></td><td>Pedir/leer datos (lo que vas a usar casi todo el curso: "dame el clima", "dame la foto del día")</td></tr>
<tr><td><code>POST</code></td><td>Enviar/crear datos nuevos (por ejemplo, crear una cuenta)</td></tr>
<tr><td><code>PUT</code></td><td>Actualizar algo que ya existe por completo</td></tr>
<tr><td><code>DELETE</code></td><td>Borrar algo</td></tr>
</table>

<div class="tip">
💡 Como tu bot de Telegram solo va a <strong>consultar</strong> información de otras APIs (nunca va a crear ni borrar nada en ellas), vas a usar <code>GET</code> prácticamente siempre en este curso.
</div>

<h2>Endpoints: las "direcciones" del menú</h2>
<p>Cada cosa que puedes pedirle a una API vive en una URL específica, llamada <strong>endpoint</strong>. Por ejemplo, la API de la NASA tiene un endpoint para la foto astronómica del día:</p>
<pre><code>https://api.nasa.gov/planetary/apod</code></pre>
<p>Y muchas veces le agregas <strong>parámetros</strong> después de un <code>?</code>, para pedir algo más específico:</p>
<pre><code>https://api.nasa.gov/planetary/apod?date=2024-01-01</code></pre>

<h2>Códigos de estado: ¿salió bien o mal?</h2>
<p>Cada respuesta HTTP incluye un <strong>código de estado</strong> — un número de 3 dígitos que te dice, sin tener que leer el mensaje completo, si tu petición funcionó:</p>
<table>
<tr><th>Código</th><th>Significa</th></tr>
<tr><td><code>200</code></td><td>✅ Todo salió bien</td></tr>
<tr><td><code>401</code></td><td>🔒 No estás autenticado (te falta o está mal tu API key)</td></tr>
<tr><td><code>404</code></td><td>❓ Ese endpoint/recurso no existe</td></tr>
<tr><td><code>429</code></td><td>🚦 Hiciste demasiadas peticiones, muy rápido (límite de uso)</td></tr>
<tr><td><code>500</code></td><td>💥 Algo se rompió del lado del servidor, no es tu culpa</td></tr>
</table>

<h2>JSON: el formato en el que llega la comida</h2>
<p>La gran mayoría de las APIs modernas responden en <strong>JSON</strong> (JavaScript Object Notation) — un formato de texto que se ve casi idéntico a un diccionario de Python: pares de <code>"llave": valor</code>, entre llaves <code>{}</code>.</p>
<pre><code>{
  "title": "Una nebulosa espectacular",
  "date": "2024-06-01",
  "explanation": "Esta imagen muestra...",
  "url": "https://apod.nasa.gov/imagen.jpg"
}</code></pre>

<div class="example">
JSON puede anidar objetos y listas, igual que Python puede anidar diccionarios y listas:
<pre><code>{
  "pokemon": "pikachu",
  "tipos": ["electrico"],
  "habilidades": [
    { "nombre": "electricidad-estatica" },
    { "nombre": "para-rayos" }
  ]
}</code></pre>
</div>

<div class="warn">
⚠️ JSON usa comillas <strong>dobles</strong> siempre (nunca simples), y no permite comas al final del último elemento — si alguna vez escribes JSON a mano y te da un error raro, revisa primero estas dos cosas.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Qué código de estado HTTP significa "todo salió bien"?',
      options: ['200', '404', '500', '401'],
      correctIndex: 0,
    },
  },

  // ── 3. requests (+ terminal) ─────────────────────────────────────────────
  {
    id: 3,
    order: 3,
    type: 'text',
    title: 'Tu primera petición con Python: la librería requests',
    description: 'La herramienta que vas a usar durante todo el curso para hablar con cualquier API.',
    content: `
<h2>requests: la librería más popular de Python para APIs</h2>
<p>Python no trae incluida una forma cómoda de hacer peticiones HTTP — para eso existe <strong>requests</strong>, la librería externa más usada del ecosistema Python para este trabajo. Se instala con pip, el gestor de paquetes de Python (lo vas a practicar en la consola interactiva de esta clase).</p>
<pre><code>pip install requests</code></pre>

<h2>Tu primera petición GET</h2>
<pre><code>import requests

respuesta = requests.get("https://api.github.com")
print(respuesta.status_code)   # 200
print(respuesta.json())        # el JSON ya convertido a diccionario de Python</code></pre>

<table>
<tr><th>Atributo/método</th><th>Qué te da</th></tr>
<tr><td><code>respuesta.status_code</code></td><td>El código de estado HTTP (200, 404...) como número</td></tr>
<tr><td><code>respuesta.json()</code></td><td>El cuerpo de la respuesta, YA convertido de JSON a diccionario/lista de Python</td></tr>
<tr><td><code>respuesta.text</code></td><td>El cuerpo de la respuesta como texto plano (sin convertir)</td></tr>
</table>

<div class="tip">
💡 <code>.json()</code> es la razón por la que Python es tan cómodo para trabajar con APIs: en cuanto llamas ese método, ya puedes tratar la respuesta como un diccionario normal de Python — <code>respuesta.json()["title"]</code>, por ejemplo.
</div>

<h2>Pasando parámetros con param</h2>
<p>En vez de armar la URL a mano pegando texto, <code>requests</code> te deja pasar los parámetros como un diccionario — es más limpio y evita errores de formato:</p>
<pre><code>respuesta = requests.get(
    "https://api.github.com/search/repositories",
    params={"q": "python", "sort": "stars"}
)</code></pre>

<h2>Siempre revisa si funcionó</h2>
<p>Nunca asumas que una petición funcionó — el internet falla, los servidores se caen, los límites de uso se agotan. La forma más simple de revisarlo:</p>
<pre><code>respuesta = requests.get("https://api.github.com")
if respuesta.status_code == 200:
    datos = respuesta.json()
else:
    print(f"Algo salió mal: código {respuesta.status_code}")</code></pre>

<div class="tip">
💡 Una alternativa más estricta es <code>respuesta.raise_for_status()</code> — si el código es de error (4xx o 5xx), lanza automáticamente una excepción de Python que puedes capturar con <code>try/except</code> (lo vas a ver a fondo más adelante en el curso).
</div>
`,
    exercises: [],
    resources: [],
    terminalSim: {
      title: 'Simulador: instala requests',
      intro: 'Practica los dos comandos que vas a usar para instalar y confirmar cualquier librería de Python con pip.',
      checkpoints: [
        {
          instruction: 'Instala la librería requests con pip.',
          placeholder: 'pip install requests',
          pattern: '^pip3?\\s+install\\s+requests\\s*$',
          hint: 'Usa: pip install requests',
          success: '¡Listo! requests ya está instalada y lista para importarse en tu código.',
        },
        {
          instruction: 'Confirma que quedó instalada revisando su información.',
          placeholder: 'pip show requests',
          pattern: '^pip3?\\s+show\\s+requests\\s*$',
          hint: 'Usa: pip show requests',
          success: 'Ahí ves la versión instalada y dónde vive en tu sistema.',
        },
      ],
    },
    quiz: {
      question: '¿Qué hace `respuesta.json()` en la librería requests?',
      options: [
        'Envía la respuesta de vuelta al servidor',
        'Convierte el cuerpo de la respuesta (JSON) en un diccionario/lista de Python, listo para usar',
        'Borra la respuesta de la memoria',
        'Muestra el código de estado HTTP',
      ],
      correctIndex: 1,
    },
  },

  // ── 4. API keys ───────────────────────────────────────────────────────────
  {
    id: 4,
    order: 4,
    type: 'text',
    title: 'API keys, límites y autenticación',
    description: 'Por qué algunas APIs te piden una clave y otras no — y cómo protegerla.',
    content: `
<h2>¿Por qué algunas APIs necesitan una clave?</h2>
<p>No todas las APIs son iguales: algunas son completamente abiertas (como Open-Meteo o PokéAPI, que vas a conocer en la próxima clase), y otras te piden una <strong>API key</strong> — una cadena de texto única que identifica quién eres haciendo la petición.</p>
<p>Una API key le sirve al dueño de la API para tres cosas:</p>
<ul>
<li><strong>Saber quién eres</strong> — para poder contactarte si algo cambia, o si hay un problema.</li>
<li><strong>Controlar cuánto usas el servicio</strong> — la mayoría de las APIs con clave tienen un <strong>límite de uso</strong> (rate limit): por ejemplo, "1000 peticiones por hora".</li>
<li><strong>Cobrar, si el servicio no es gratis</strong> — muchas APIs tienen un plan gratuito con límites bajos, y planes de pago con más capacidad.</li>
</ul>

<h2>Cómo se envía una API key</h2>
<p>Depende de la API, pero las dos formas más comunes son:</p>
<table>
<tr><th>Forma</th><th>Ejemplo</th></tr>
<tr><td>Como parámetro en la URL</td><td><code>?api_key=TU_CLAVE_AQUI</code></td></tr>
<tr><td>En un header HTTP</td><td><code>Authorization: Bearer TU_CLAVE_AQUI</code></td></tr>
</table>

<div class="example">
La API de la NASA (que vas a usar si eliges esa aventura) acepta la clave como parámetro:
<pre><code>requests.get(
    "https://api.nasa.gov/planetary/apod",
    params={"api_key": "TU_CLAVE_AQUI"}
)</code></pre>
Y para empezar a probar sin registrarte, la NASA ofrece una clave pública compartida: <code>DEMO_KEY</code> — funciona igual, solo que con un límite de uso mucho más bajo (30 peticiones por hora). Cuando quieras usar tu bot en serio, regístrate gratis en <code>api.nasa.gov</code> para obtener tu propia clave con más margen.
</div>

<h2 class="wiki-title">La regla más importante: nunca subas tu API key a GitHub</h2>
<div class="bad">
🚫 Si escribes tu API key directamente en tu código y lo subes a un repositorio público, cualquier persona puede verla, copiarla, y usarla como si fuera suya — agotando tu límite de uso, o peor, generando cargos si la API es de pago. Recuerda: aunque borres la clave después, queda en el historial de Git para siempre (a menos que reescribas todo el historial).
</div>

<h2>La solución: variables de entorno</h2>
<p>En vez de escribir la clave directo en tu código, la guardas en un archivo <code>.env</code> (que agregas a tu <code>.gitignore</code>, para que Git nunca lo suba) y la lees desde ahí:</p>
<pre><code># archivo .env (nunca se sube a GitHub)
NASA_API_KEY=tu_clave_secreta_aqui</code></pre>
<pre><code># tu código Python
from dotenv import load_dotenv
import os

load_dotenv()
clave = os.getenv("NASA_API_KEY")</code></pre>

<div class="tip">
💡 <code>python-dotenv</code> es la librería que lee el archivo <code>.env</code> por ti (<code>pip install python-dotenv</code>). Vas a usar exactamente este patrón más adelante para guardar el token de tu bot de Telegram, que es igual de sensible que una API key.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Por qué NO deberías escribir tu API key directamente en tu código y subirlo a un repositorio público de GitHub?',
      options: [
        'Porque Git no permite subir archivos con texto largo',
        'Porque cualquiera puede verla y usarla como si fuera suya, y queda en el historial para siempre',
        'No hay ningún problema en hacerlo',
        'Porque hace que el código corra más lento',
      ],
      correctIndex: 1,
    },
  },

  // ── 5. Track selector ────────────────────────────────────────────────────
  {
    id: 5,
    order: 5,
    type: 'text',
    title: 'Elige tu aventura: la API que vas a consultar',
    description: 'A partir de aquí, el curso se adapta a la API que elijas — puedes cambiarla cuando quieras.',
    content: `
<h2>Tres caminos, una sola habilidad</h2>
<p>Ya sabes lo esencial: qué es una API, cómo hablarle con <code>requests</code>, y cómo manejar claves con cuidado. A partir de aquí, el resto del curso te va a mostrar código real — y quiero que ese código sea sobre algo que te interese a ti.</p>
<p>Elige una de las tres APIs de abajo. Las clases que digan <strong>"según tu API elegida"</strong> van a mostrar automáticamente el ejemplo de la que hayas elegido.</p>
`,
    exercises: [],
    resources: [],
    trackSelector: {
      title: 'Elige tu aventura',
      intro: 'Las tres son completamente gratuitas. Puedes volver a esta clase y cambiar tu elección cuando quieras — o incluso hacer las tres.',
      options: [
        {
          id: 'nasa',
          icon: '🚀',
          label: 'NASA — Imagen Astronómica del Día',
          tagline: 'Tu bot va a mandar la foto astronómica que publica la NASA cada día, con su explicación científica.',
        },
        {
          id: 'clima',
          icon: '🌦️',
          label: 'Open-Meteo — Clima en Tiempo Real',
          tagline: 'Tu bot va a mandar el clima actual de cualquier ciudad — sin necesitar ninguna API key.',
        },
        {
          id: 'pokemon',
          icon: '🎮',
          label: 'PokéAPI — Datos de Pokémon',
          tagline: 'Tu bot va a mandar estadísticas, habilidades y la imagen de cualquier Pokémon que le pidan.',
        },
      ],
    },
  },

  // ── 6. Consultando tu API elegida (trackContent) ─────────────────────────
  {
    id: 6,
    order: 6,
    type: 'text',
    title: 'Consultando tu API elegida en Python',
    description: 'El código completo para pedirle datos a tu API, ya adaptado a tu elección.',
    content: `
<h2>Ya elegiste tu API — hora de hablarle de verdad</h2>
<p>Abajo tienes el código completo para consultar la API que elegiste desde Python. Cópialo en un archivo (por ejemplo, <code>consulta.py</code>), guárdalo, y ejecútalo con <code>python consulta.py</code> para ver la respuesta en tu terminal.</p>
`,
    exercises: [],
    resources: [],
    trackContent: {
      default: 'nasa',
      variants: {
        nasa: `
<h2>🚀 NASA — Imagen Astronómica del Día (APOD)</h2>
<p>Este endpoint no necesita registro para probarlo: puedes usar la clave pública <code>DEMO_KEY</code> (límite bajo) o registrarte gratis en <code>api.nasa.gov</code> para tu propia clave.</p>
<pre><code>import requests

API_KEY = "DEMO_KEY"  # o tu propia clave de api.nasa.gov

respuesta = requests.get(
    "https://api.nasa.gov/planetary/apod",
    params={"api_key": API_KEY}
)

if respuesta.status_code == 200:
    datos = respuesta.json()
    print("Título:", datos["title"])
    print("Fecha:", datos["date"])
    print("Explicación:", datos["explanation"][:200], "...")
    print("Imagen:", datos["url"])
else:
    print("Error:", respuesta.status_code)</code></pre>
<div class="tip">
💡 El campo <code>media_type</code> puede ser <code>"image"</code> o <code>"video"</code> — algunos días la NASA publica un video en vez de una foto. Un bot completo revisa ese campo antes de intentar mostrar una imagen.
</div>`,
        clima: `
<h2>🌦️ Open-Meteo — Clima en Tiempo Real</h2>
<p>Open-Meteo es completamente gratuita y <strong>no necesita API key</strong> — solo le pasas latitud y longitud. Este ejemplo usa las coordenadas de Ciudad de México, pero puedes usar las de cualquier ciudad.</p>
<pre><code>import requests

LATITUD = 19.43   # Ciudad de México (cambia por tu ciudad)
LONGITUD = -99.13

respuesta = requests.get(
    "https://api.open-meteo.com/v1/forecast",
    params={
        "latitude": LATITUD,
        "longitude": LONGITUD,
        "current_weather": "true",
    }
)

if respuesta.status_code == 200:
    datos = respuesta.json()
    clima = datos["current_weather"]
    print("Temperatura:", clima["temperature"], "°C")
    print("Velocidad del viento:", clima["windspeed"], "km/h")
else:
    print("Error:", respuesta.status_code)</code></pre>
<div class="tip">
💡 Open-Meteo es un excelente primer ejemplo justamente porque NO necesita clave — es la prueba de que no todas las APIs requieren autenticación, algo que viste en la clase anterior.
</div>`,
        pokemon: `
<h2>🎮 PokéAPI — Datos de Pokémon</h2>
<p>Tampoco necesita API key. Solo le pasas el nombre (o número) del Pokémon como parte de la URL.</p>
<pre><code>import requests

NOMBRE = "pikachu"  # cambia por cualquier Pokémon

respuesta = requests.get(f"https://pokeapi.co/api/v2/pokemon/{NOMBRE}")

if respuesta.status_code == 200:
    datos = respuesta.json()
    print("Nombre:", datos["name"].capitalize())
    print("Altura:", datos["height"] / 10, "m")
    print("Peso:", datos["weight"] / 10, "kg")
    habilidades = [h["ability"]["name"] for h in datos["abilities"]]
    print("Habilidades:", ", ".join(habilidades))
    print("Imagen:", datos["sprites"]["front_default"])
else:
    print("Error: ese Pokémon no existe (revisa el nombre)")</code></pre>
<div class="tip">
💡 Fíjate en el <code>f"...{NOMBRE}"</code> — es un f-string de Python, la forma más limpia de meter una variable dentro de un texto (y, en este caso, dentro de la URL misma).
</div>`,
      },
    },
    quiz: {
      question: 'Si `datos = respuesta.json()` y la API devuelve una lista de objetos, ¿qué tipo de dato es `datos` en Python?',
      options: [
        'Un número',
        'Una lista de diccionarios de Python',
        'Un archivo de texto',
        'Siempre es un error',
      ],
      correctIndex: 1,
    },
  },

  // ── 7. BotFather ──────────────────────────────────────────────────────────
  {
    id: 7,
    order: 7,
    type: 'text',
    title: 'Crea tu bot de Telegram con BotFather',
    description: 'Los 5 minutos que necesitas dentro de la app de Telegram, antes de escribir una línea de código de tu bot.',
    content: `
<h2>BotFather: el bot que crea otros bots</h2>
<p>Telegram tiene un bot oficial llamado <strong>@BotFather</strong> que se encarga de crear y administrar todos los demás bots de la plataforma. Es la única forma de conseguir un bot propio — no hay panel web, todo se hace conversando con él.</p>

<h2>Paso a paso</h2>
<ol>
<li>Abre Telegram (celular o escritorio) y busca <strong>@BotFather</strong> en la barra de búsqueda (tiene una insignia de verificado ✔️).</li>
<li>Envíale <code>/start</code> para ver el menú de comandos.</li>
<li>Envíale <code>/newbot</code> para empezar a crear tu bot.</li>
<li>Te va a pedir un <strong>nombre</strong> (el que van a ver los usuarios, puede tener espacios) — por ejemplo <em>"Explorador Espacial"</em>.</li>
<li>Luego te va a pedir un <strong>username</strong> único — debe terminar en <code>bot</code>, por ejemplo <code>explorador_espacial_bot</code>.</li>
</ol>

<div class="example">
Si el username que quieres ya está en uso (es muy común), BotFather te lo va a decir de inmediato — solo intenta con otra variación hasta que uno esté libre.
</div>

<h2>Tu TOKEN: la llave de tu bot</h2>
<p>En cuanto termines, BotFather te va a mandar un mensaje con un <strong>token</strong> — una cadena larga parecida a esto:</p>
<pre><code>7234567890:AAHk3jd8fK2lP9qR7sT1uV5wX8yZ0aB3cD</code></pre>

<div class="bad">
🚫 Este token es EXACTAMENTE tan sensible como una API key — cualquiera que lo tenga puede controlar tu bot por completo (leer sus mensajes, responder en tu nombre). Aplica todo lo que aprendiste en la clase de API keys: nunca lo escribas directo en tu código, guárdalo en un <code>.env</code>, y nunca lo subas a GitHub.
</div>

<h2>Personaliza tu bot (opcional, pero recomendado)</h2>
<p>BotFather también te deja, con otros comandos, ponerle una foto de perfil (<code>/setuserpic</code>), una descripción (<code>/setdescription</code>), y una lista de comandos que aparecen como sugerencia al escribir "/" en el chat (<code>/setcommands</code>).</p>

<div class="tip">
💡 Guarda tu token en un lugar seguro ahora mismo — lo vas a necesitar en la próxima clase, y si lo pierdes, BotFather te deja generar uno nuevo con <code>/token</code> (el viejo deja de funcionar).
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Qué te entrega @BotFather al terminar de crear tu bot?',
      options: [
        'Un número de teléfono nuevo',
        'Un token único que usas para controlar tu bot por código — tan sensible como una contraseña',
        'Una cuenta de correo',
        'Nada, el bot ya funciona automáticamente sin ninguna clave',
      ],
      correctIndex: 1,
    },
  },

  // ── 8. python-telegram-bot (+ terminal) ──────────────────────────────────
  {
    id: 8,
    order: 8,
    type: 'text',
    title: 'python-telegram-bot: instala y arranca tu primer "Hola Mundo"',
    description: 'La librería que traduce mensajes de Telegram en código Python que puedes controlar.',
    content: `
<h2>python-telegram-bot: tu puente hacia Telegram</h2>
<p>Igual que <code>requests</code> te facilita hablar con cualquier API, <strong>python-telegram-bot</strong> te facilita hablar específicamente con la API de Telegram — te evita tener que armar peticiones HTTP a mano por cada mensaje.</p>
<pre><code>pip install python-telegram-bot</code></pre>

<h2>La estructura mínima de un bot</h2>
<p>Todo bot hecho con esta librería sigue el mismo patrón: creas una <code>Application</code> con tu token, le agregas <strong>handlers</strong> (funciones que responden a comandos o mensajes específicos), y lo pones a escuchar.</p>
<pre><code>from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

TOKEN = "TU_TOKEN_AQUI"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("¡Hola! Soy tu bot. Escribe /ayuda para ver qué puedo hacer.")

app = Application.builder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.run_polling()</code></pre>

<table>
<tr><th>Pieza</th><th>Qué hace</th></tr>
<tr><td><code>Application.builder().token(TOKEN).build()</code></td><td>Crea la aplicación de tu bot, conectada a tu token</td></tr>
<tr><td><code>CommandHandler("start", start)</code></td><td>Cuando alguien envíe <code>/start</code>, ejecuta la función <code>start</code></td></tr>
<tr><td><code>app.run_polling()</code></td><td>Pone a tu bot a escuchar mensajes nuevos, sin parar, hasta que detengas el programa</td></tr>
</table>

<div class="tip">
💡 Fíjate en <code>async def</code> y <code>await</code> — python-telegram-bot usa <strong>código asíncrono</strong>, lo que le permite atender a varios usuarios "al mismo tiempo" sin bloquearse esperando la respuesta de uno solo. No necesitas dominar todo async/await para este curso — solo recuerda: cada función que maneja un mensaje se define con <code>async def</code>, y cualquier llamada que "espera algo" lleva <code>await</code> adelante.
</div>

<h2>update y context: qué te llega en cada mensaje</h2>
<ul>
<li><code>update</code> — el mensaje que llegó: quién lo mandó, qué texto tiene, en qué chat.</li>
<li><code>update.message.reply_text("...")</code> — responde en el mismo chat de donde vino el mensaje.</li>
<li><code>context</code> — información extra del bot en general (poco usado en bots simples, pero siempre se recibe).</li>
</ul>

<div class="warn">
⚠️ Nunca dejes tu token escrito directo en el código como en el ejemplo de arriba (ahí está así solo para que se entienda). En la clase de "Manejo de errores y buenas prácticas", más adelante, vas a moverlo a un archivo <code>.env</code>.
</div>
`,
    exercises: [],
    resources: [],
    terminalSim: {
      title: 'Simulador: arranca tu primer bot',
      intro: 'Practica instalar la librería y correr tu archivo de Python, tal como lo harías en tu propia terminal.',
      checkpoints: [
        {
          instruction: 'Instala la librería python-telegram-bot.',
          placeholder: 'pip install python-telegram-bot',
          pattern: '^pip3?\\s+install\\s+python-telegram-bot\\s*$',
          hint: 'Usa: pip install python-telegram-bot',
          success: '¡Listo! Ya tienes todo lo necesario para hablar con la API de Telegram desde Python.',
        },
        {
          instruction: 'Corre tu archivo bot.py para arrancar el bot.',
          placeholder: 'python bot.py',
          pattern: '^python3?\\s+bot\\.py\\s*$',
          hint: 'Usa: python bot.py',
          success: 'Tu bot ya está escuchando — mándale /start desde Telegram para probarlo.',
        },
      ],
    },
    quiz: {
      question: '¿Qué hace `app.run_polling()`?',
      options: [
        'Sube tu bot a internet de forma permanente y gratuita',
        'Pone a tu programa a revisar constantemente si Telegram tiene mensajes nuevos para tu bot, mientras el programa siga corriendo',
        'Borra el token de tu bot',
        'Envía un mensaje automático a todos los usuarios',
      ],
      correctIndex: 1,
    },
  },

  // ── 9. Video: práctico ───────────────────────────────────────────────────
  {
    id: 9,
    order: 9,
    type: 'video',
    title: 'Tu Bot en Acción: uniendo Telegram + tu API (ejemplo con NASA)',
    description: 'Recorrido práctico completo, de cero a un bot funcionando — el mismo patrón aplica a las 3 aventuras.',
    videoId: 'aqz-KE-bpKQ',
    exercises: [],
    resources: [],
    quiz: {
      question: 'En el patrón que viste en el video, ¿qué dispara la función que consulta la API externa?',
      options: [
        'Cualquier mensaje de texto, sin excepción',
        'Un comando específico, como /apod, registrado con un CommandHandler',
        'Se ejecuta solo, una vez por hora',
        'No hace falta ningún comando',
      ],
      correctIndex: 1,
    },
  },

  // ── 10. Bot completo (trackContent) ──────────────────────────────────────
  {
    id: 10,
    order: 10,
    type: 'text',
    title: 'El código completo: tu bot conectado a tu API elegida',
    description: 'Todas las piezas juntas — copia esto en bot.py, pon tu token, y arráncalo.',
    content: `
<h2>La pieza final</h2>
<p>Abajo tienes el archivo <code>bot.py</code> completo, ya integrando <code>python-telegram-bot</code> con la API que elegiste. Reemplaza <code>"TU_TOKEN_AQUI"</code> con el token real que te dio BotFather, guárdalo, y arráncalo con <code>python bot.py</code>.</p>
`,
    exercises: [],
    resources: [],
    trackContent: {
      default: 'nasa',
      variants: {
        nasa: `
<h2>🚀 Bot conectado a la NASA</h2>
<pre><code>from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
import requests

TOKEN = "TU_TOKEN_AQUI"
NASA_API_KEY = "DEMO_KEY"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "¡Hola! Soy tu bot astronómico. Escribe /apod para ver la foto del día de la NASA."
    )

async def apod(update: Update, context: ContextTypes.DEFAULT_TYPE):
    respuesta = requests.get(
        "https://api.nasa.gov/planetary/apod",
        params={"api_key": NASA_API_KEY}
    )
    if respuesta.status_code != 200:
        await update.message.reply_text("No pude consultar la NASA ahora mismo, intenta más tarde.")
        return

    datos = respuesta.json()
    mensaje = f"🚀 {datos['title']}\\n\\n{datos['explanation'][:400]}..."

    if datos.get("media_type") == "image":
        await update.message.reply_photo(photo=datos["url"], caption=mensaje)
    else:
        await update.message.reply_text(f"{mensaje}\\n\\n{datos['url']}")

app = Application.builder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("apod", apod))
app.run_polling()</code></pre>
<div class="tip">
💡 <code>reply_photo</code> envía la imagen directo en el chat, en vez de solo mandar el link — mucho mejor experiencia para quien usa tu bot.
</div>`,
        clima: `
<h2>🌦️ Bot conectado a Open-Meteo</h2>
<pre><code>from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
import requests

TOKEN = "TU_TOKEN_AQUI"

# Coordenadas de algunas ciudades — agrega las que quieras
CIUDADES = {
    "cdmx": (19.43, -99.13),
    "madrid": (40.42, -3.70),
    "bogota": (4.71, -74.07),
}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "¡Hola! Soy tu bot del clima. Escribe /clima cdmx (o madrid, bogota) para ver el clima actual."
    )

async def clima(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.args:
        await update.message.reply_text("Usa: /clima cdmx")
        return

    ciudad = context.args[0].lower()
    if ciudad not in CIUDADES:
        await update.message.reply_text(f"No conozco esa ciudad. Prueba: {', '.join(CIUDADES)}")
        return

    lat, lon = CIUDADES[ciudad]
    respuesta = requests.get(
        "https://api.open-meteo.com/v1/forecast",
        params={"latitude": lat, "longitude": lon, "current_weather": "true"}
    )
    if respuesta.status_code != 200:
        await update.message.reply_text("No pude consultar el clima ahora mismo.")
        return

    actual = respuesta.json()["current_weather"]
    await update.message.reply_text(
        f"🌦️ Clima en {ciudad.title()}:\\n"
        f"Temperatura: {actual['temperature']}°C\\n"
        f"Viento: {actual['windspeed']} km/h"
    )

app = Application.builder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("clima", clima))
app.run_polling()</code></pre>
<div class="tip">
💡 <code>context.args</code> te da la lista de palabras que el usuario escribió después del comando — así <code>/clima cdmx</code> te llega como <code>["cdmx"]</code>. Es la forma estándar de recibir "argumentos" en un comando de Telegram.
</div>`,
        pokemon: `
<h2>🎮 Bot conectado a PokéAPI</h2>
<pre><code>from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
import requests

TOKEN = "TU_TOKEN_AQUI"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "¡Hola, entrenador! Escribe /pokemon pikachu para ver sus datos."
    )

async def pokemon(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.args:
        await update.message.reply_text("Usa: /pokemon pikachu")
        return

    nombre = context.args[0].lower()
    respuesta = requests.get(f"https://pokeapi.co/api/v2/pokemon/{nombre}")

    if respuesta.status_code != 200:
        await update.message.reply_text("No encontré ese Pokémon — revisa el nombre.")
        return

    datos = respuesta.json()
    habilidades = ", ".join(h["ability"]["name"] for h in datos["abilities"])
    mensaje = (
        f"🎮 {datos['name'].capitalize()}\\n"
        f"Altura: {datos['height'] / 10} m\\n"
        f"Peso: {datos['weight'] / 10} kg\\n"
        f"Habilidades: {habilidades}"
    )
    imagen = datos["sprites"]["front_default"]

    if imagen:
        await update.message.reply_photo(photo=imagen, caption=mensaje)
    else:
        await update.message.reply_text(mensaje)

app = Application.builder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("pokemon", pokemon))
app.run_polling()</code></pre>
<div class="tip">
💡 Igual que con el clima, <code>context.args[0]</code> toma la primera palabra después del comando — el nombre del Pokémon que el usuario escribió.
</div>`,
      },
    },
    quiz: {
      question: '¿Por qué es buena práctica guardar el token de tu bot en una variable de entorno (.env) en vez de escribirlo directo en el código como en estos ejemplos?',
      options: [
        'Porque el código corre más rápido así',
        'Porque si subes tu código a un repositorio (incluso privado por error), el token queda expuesto y cualquiera podría controlar tu bot',
        'No hay ninguna diferencia real',
        'Porque Python no permite variables largas dentro del código',
      ],
      correctIndex: 1,
    },
  },

  // ── 11. Manejo de errores ────────────────────────────────────────────────
  {
    id: 11,
    order: 11,
    type: 'text',
    title: 'Manejo de errores y buenas prácticas',
    description: 'Lo que separa un bot de prueba de un bot que no se cae al primer problema.',
    content: `
<h2>try/except: cuando una petición falla</h2>
<p>Una petición HTTP puede fallar por muchas razones que no controlas: el internet se corta, el servidor tarda demasiado, la API está caída. Sin manejo de errores, cualquiera de estos casos <strong>rompe tu bot por completo</strong>.</p>
<pre><code>import requests

try:
    respuesta = requests.get("https://api.ejemplo.com/datos", timeout=10)
    respuesta.raise_for_status()  # lanza un error si el código es 4xx o 5xx
    datos = respuesta.json()
except requests.exceptions.Timeout:
    print("La API tardó demasiado en responder")
except requests.exceptions.ConnectionError:
    print("No hay conexión a internet")
except requests.exceptions.HTTPError as error:
    print(f"La API respondió con un error: {error}")</code></pre>

<h2>timeout: nunca lo olvides</h2>
<div class="warn">
⚠️ Si no defines un <code>timeout</code>, y el servidor de la API se queda "colgado" sin responder ni cerrar la conexión, tu programa se queda esperando <strong>indefinidamente</strong> — congelado, sin ningún error que te avise qué pasó. <code>timeout=10</code> (segundos) es una buena práctica en absolutamente todas tus peticiones.
</div>

<h2>Aplicado a tu bot de Telegram</h2>
<p>La misma idea aplica dentro de cada handler — si la API que consultas falla, tu bot debería responderle algo útil al usuario, nunca quedarse sin contestar ni romperse:</p>
<pre><code>async def apod(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        respuesta = requests.get(
            "https://api.nasa.gov/planetary/apod",
            params={"api_key": NASA_API_KEY},
            timeout=10
        )
        respuesta.raise_for_status()
        datos = respuesta.json()
        await update.message.reply_text(datos["title"])
    except requests.exceptions.RequestException:
        await update.message.reply_text("😕 No pude consultar la NASA ahora mismo, intenta en un momento.")</code></pre>

<h2>Protegiendo tu token con .env</h2>
<p>Aplicando lo que viste en la clase de API keys, así se ve tu bot con el token protegido de verdad:</p>
<pre><code># .env (agregado a .gitignore)
TELEGRAM_TOKEN=7234567890:AAHk3jd8fK2lP9qR7sT1uV5wX8yZ0aB3cD
NASA_API_KEY=tu_clave_de_nasa</code></pre>
<pre><code># bot.py
from dotenv import load_dotenv
import os

load_dotenv()
TOKEN = os.getenv("TELEGRAM_TOKEN")
NASA_API_KEY = os.getenv("NASA_API_KEY")</code></pre>

<h2>Límites de uso: no abuses de las APIs gratuitas</h2>
<p>Si tu bot recibe muchos mensajes y consulta la API en cada uno, puedes agotar tu límite de uso rápido (recuerda el código <code>429</code> de la clase de HTTP). Una técnica simple para bots pequeños: <strong>guardar la respuesta en memoria por unos minutos</strong> (caché) en vez de pedirla de nuevo cada vez que alguien escribe el mismo comando.</p>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Qué puede pasar si haces una petición con requests SIN definir un `timeout`?',
      options: [
        'Nada, siempre responde al instante',
        'Tu programa puede quedarse esperando indefinidamente una respuesta que nunca llega',
        'Python cancela la petición automáticamente después de 1 segundo',
        'La API rechaza la petición por falta de timeout',
      ],
      correctIndex: 1,
    },
  },

  // ── 12. Desplegar ────────────────────────────────────────────────────────
  {
    id: 12,
    order: 12,
    type: 'text',
    title: 'Desplegar tu bot: que siga corriendo',
    description: 'Cómo mantener tu bot escuchando, incluso si apagas tu computadora.',
    content: `
<h2>Recordatorio: run_polling() necesita que el programa siga vivo</h2>
<p><code>app.run_polling()</code> pone a tu programa en un ciclo infinito, preguntándole a Telegram cada cierto tiempo "¿hay mensajes nuevos para mí?" (esto se llama <strong>polling</strong>). Mientras corras <code>python bot.py</code> en tu computadora, tu bot funciona — en cuanto cierras la terminal o apagas la computadora, tu bot deja de responder.</p>

<h2>Polling vs. webhooks</h2>
<div class="example">
<strong>Polling</strong> (lo que usaste en este curso): tu programa <em>pregunta</em> activamente cada cierto tiempo si hay algo nuevo — simple de configurar, ideal para aprender y para bots pequeños.<br/><br/>
<strong>Webhook</strong>: en vez de preguntar, le dices a Telegram "avísame tú cuando llegue algo" (push) — Telegram le manda la petición directo a un servidor tuyo con una URL pública. Es más eficiente a gran escala, pero necesita un servidor con una dirección accesible desde internet — más configuración de la que necesitas para este curso.
</div>

<h2>Para que tu bot siga corriendo 24/7</h2>
<p>Para pruebas, correr <code>python bot.py</code> en tu propia computadora es suficiente. Si quieres que tu bot esté disponible todo el tiempo, sin depender de que tu computadora esté encendida, necesitas correrlo en algún tipo de servidor:</p>
<ul>
<li><strong>Un servicio con plan gratuito</strong> (por ejemplo Railway, Render, PythonAnywhere) — subes tu código y ellos lo mantienen corriendo.</li>
<li><strong>Una computadora dedicada</strong> que dejes encendida (una Raspberry Pi es una opción muy común y barata para esto).</li>
<li><strong>Un VPS</strong> (servidor virtual, de pago) si ya tienes experiencia administrando servidores Linux.</li>
</ul>

<div class="tip">
💡 No necesitas desplegar tu bot en ningún servidor para terminar este curso — todo lo que aprendiste funciona perfecto corriendo localmente con <code>python bot.py</code>. El despliegue es el siguiente paso natural cuando quieras que otras personas usen tu bot sin depender de tu computadora.
</div>

<h2>Mantén tu bot corriendo en segundo plano (opcional, en tu propia computadora)</h2>
<table>
<tr><th>Sistema</th><th>Cómo</th></tr>
<tr><td>Linux/macOS</td><td><code>nohup python bot.py &</code>, o el comando <code>screen</code>/<code>tmux</code> para dejarlo corriendo en una sesión aparte</td></tr>
<tr><td>Windows</td><td>El Programador de Tareas, o simplemente dejar la terminal abierta minimizada mientras pruebas</td></tr>
</table>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es la diferencia principal entre "polling" y "webhooks" para que un bot reciba mensajes?',
      options: [
        'Son exactamente lo mismo, solo cambia el nombre',
        'Polling pregunta activamente cada cierto tiempo si hay mensajes nuevos; un webhook espera a que Telegram le avise (push) cuando llega uno',
        'Webhooks solo funcionan con JavaScript, nunca con Python',
        'Polling solo funciona si tienes un servidor con dirección pública',
      ],
      correctIndex: 1,
    },
  },

  // ── 13. Proyecto final ───────────────────────────────────────────────────
  {
    id: 13,
    order: 13,
    type: 'text',
    title: 'Proyecto final: dale superpoderes a tu bot',
    description: 'Todo lo que aprendiste, ahora tuyo para seguir construyendo.',
    content: `
<h2>Lo que ya sabes hacer</h2>
<p>Empezaste este curso sin saber qué era una API. Ahora sabes: qué es HTTP y JSON, cómo hacer peticiones con <code>requests</code>, cómo proteger claves sensibles, cómo crear un bot de Telegram con BotFather, cómo conectarlo con <code>python-telegram-bot</code>, y cómo manejar errores como se hace en código real. Eso es, literalmente, el mismo patrón que usan miles de aplicaciones profesionales todos los días.</p>

<h2>Retos para seguir practicando</h2>
<div class="example">
<ol>
<li><strong>Agrega un segundo comando</strong> a tu bot que consulte una de las OTRAS dos APIs — vuelve a la clase "Elige tu aventura", cambia tu elección, y copia también ese código.</li>
<li><strong>Agrega un comando <code>/ayuda</code></strong> que le muestre al usuario la lista de comandos disponibles y qué hace cada uno.</li>
<li><strong>Mejora los mensajes de error</strong> — en vez de un genérico "algo salió mal", dale contexto específico al usuario según qué falló.</li>
<li><strong>Agrega una caché simple</strong> con un diccionario de Python, para no volver a pedirle el mismo dato a la API si alguien lo pidió hace menos de un minuto.</li>
<li><strong>Explora la documentación oficial</strong> de tu API elegida (api.nasa.gov, open-meteo.com, o pokeapi.co) — cada una tiene decenas de endpoints más que no viste en este curso.</li>
</ol>
</div>

<h2>Hacia dónde seguir</h2>
<p>Este curso te dio las bases con las que puedes conectar tu código a prácticamente cualquier servicio del mundo moderno: redes sociales, bancos, videojuegos, ciencia, clima, transporte. La habilidad no era "la API de la NASA" ni "Telegram" específicamente — era <strong>pedir datos con confianza a cualquier API que te encuentres de ahora en adelante</strong>.</p>

<div class="tip">
💡 Si te gustó construir con Telegram, el mismo patrón de <code>CommandHandler</code> + una API externa funciona para armar bots de casi cualquier tema: recordatorios, trivia, traducción, noticias — el límite es qué API decidas conectar.
</div>
`,
    exercises: [],
    resources: [
      { title: 'Documentación de la API de la NASA', url: 'https://api.nasa.gov' },
      { title: 'Documentación de Open-Meteo', url: 'https://open-meteo.com/en/docs' },
      { title: 'Documentación de PokéAPI', url: 'https://pokeapi.co/docs/v2' },
      { title: 'Documentación de python-telegram-bot', url: 'https://docs.python-telegram-bot.org' },
    ],
  },
]

// ── Reestructura: cada terminalSim pasa a ser su PROPIA clase dedicada
// ("🖥️ Consola Interactiva: ..."), igual que en el curso de Git — pedido
// explícito del dueño para cualquier curso con ejercicios de terminal.
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
  for (const m of mods) {
    if (m.terminalSim) {
      const { terminalSim, ...concept } = m
      result.push(concept)
      result.push({
        type: 'text',
        title: `🖥️ Consola Interactiva: ${terminalSim.title.replace(/^Simulador:\s*/, '')}`,
        description: 'Practica en una consola interactiva simulada — sin arriesgar nada real.',
        content: buildConsoleIntroHtml(terminalSim),
        exercises: [],
        resources: [],
        terminalSim,
      })
    } else {
      result.push(m)
    }
  }
  return result.map((m, i) => ({ ...m, id: i, order: i }))
}

const splitModules = splitConsoleModules(modules)

const course = {
  id: COURSE_ID,
  title: 'APIs con Python: Crea tu Bot Consultor de Telegram',
  description: 'Curso práctico de 0 a un bot funcionando: qué es una API, HTTP y JSON, peticiones con requests, protección de claves, y cómo construir tu propio bot de Telegram con python-telegram-bot. Tú eliges qué API consulta tu bot: NASA, clima en tiempo real, o datos de Pokémon.',
  ai_instructions: 'Eres el Mago, profesor de la Escuela de Programación de Oliver Academy, guiando el curso "APIs con Python: Crea tu Bot Consultor de Telegram". Explica con la analogía del restaurante (mesero = API) cuando haga falta, sé muy claro sobre por qué nunca se debe exponer una API key o el token de un bot, y recuerda que el alumno eligió una de tres APIs (NASA, Open-Meteo o PokéAPI) — si preguntan por su código, ayúdales con el ejemplo de la API que hayan elegido en la clase "Elige tu aventura".',
  icon: '🤖',
  color: '#06b6d4',
  category: 'Programación',
  subcategory: 'APIs y Automatización',
  difficulty: 'intermedio',
  locked: false,
  modules: splitModules,
}

// ── SQL ─────────────────────────────────────────────────────────────────
function sqlStr(js) {
  return `'${JSON.stringify(js).replace(/'/g, "''")}'`
}

const sql = `-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 040 — Curso "APIs con Python: Crea tu Bot Consultor de Telegram"
-- (course-apis-python-telegram-bot)
-- ${course.modules.length} clases: qué es una API, HTTP/JSON, requests, API keys,
-- selector de "aventura" (NASA / Open-Meteo / PokéAPI), BotFather,
-- python-telegram-bot, manejo de errores y despliegue. Incluye
-- ${course.modules.filter((m) => m.terminalSim).length} clases dedicadas de "Consola Interactiva" y
-- ${course.modules.filter((m) => m.trackContent).length} clases de contenido condicional según la API elegida
-- (trackSelector/trackContent — ver ApiTrackSelector.jsx y TrackContent.jsx).
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

writeFileSync(path.join(process.cwd(), 'supabase', 'migration_040.sql'), sql)
console.log('✓ supabase/migration_040.sql —', course.modules.length, 'módulos,', JSON.stringify(sql).length, 'bytes de SQL')
