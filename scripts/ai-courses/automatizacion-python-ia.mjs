// Curso "Automatización con Python e IA". Solo texto + quizzes.
import { quiz, text } from '../linux-courses/helpers.mjs'

export const automatizacionPythonIa = {
  id: 'course-automatizacion-python-ia',
  title: 'Automatización con Python e IA',
  description: 'Haz que tu computadora trabaje sola: scripts de Python que organizan archivos, leen correos, llaman a una IA para resumir o clasificar, y corren solos en un horario — sin que tengas que acordarte de hacerlo tú. De cero a tu primera automatización real, con manejo de errores incluido.',
  ai_instructions: 'Eres el Mago, profesor de la Escuela de Programación de Oliver Academy, guiando el curso "Automatización con Python e IA". Explica código Python con paciencia, asumiendo que el alumno puede no tener experiencia previa de programación. Sé muy insistente en las buenas prácticas de seguridad al manejar llaves de API (nunca en el código, siempre en variables de entorno) y en el manejo de errores — una automatización que falla en silencio es peor que una que no existe. Da siempre el porqué antes que el cómo.',
  icon: '🐍',
  color: '#eab308',
  category: 'Programación',
  subcategory: 'APIs y Automatización',
  difficulty: 'intermedio',
  locked: false,
  modules: [
    text('Bienvenida: haz que tu computadora trabaje mientras tú no',
      'La diferencia entre programar y automatizar, y qué vas a construir.',
      `
<h2>Programar vs. automatizar</h2>
<p><strong>Programar</strong> es escribir instrucciones para que una computadora haga algo cuando tú se lo pides. <strong>Automatizar</strong> es un paso más allá: escribir instrucciones que la computadora ejecuta <strong>por sí sola</strong>, en un horario o cuando ocurre algo específico, sin que tú tengas que estar ahí para iniciarlas cada vez.</p>

<h2>Por qué Python + IA es una combinación tan poderosa</h2>
<p>Python es, desde hace años, el lenguaje más usado para scripts y automatización — simple de leer, con librerías para casi cualquier tarea. Combinado con una IA (llamada desde tu código, no solo desde un chat), puedes automatizar tareas que antes requerían <strong>juicio humano</strong>: resumir un texto, clasificar un correo, decidir si una foto necesita revisión — no solo tareas mecánicas repetitivas.</p>

<h2>El mapa del curso</h2>
<table>
<tr><th>Parte</th><th>Qué vas a construir</th></tr>
<tr><td>1. Fundamentos rápidos</td><td>Lo mínimo de Python que necesitas si nunca programaste.</td></tr>
<tr><td>2. Llama a una IA desde tu código</td><td>No desde un chat — desde un script que tú controlas.</td></tr>
<tr><td>3. Automatiza archivos</td><td>Que Python organice, lea y escriba archivos por ti.</td></tr>
<tr><td>4. Ponlo en horario</td><td>Que corra solo, sin que tengas que acordarte.</td></tr>
<tr><td>5. Un proyecto completo</td><td>Un resumidor automático de archivos de principio a fin.</td></tr>
<tr><td>6. Manejo de errores</td><td>Para que tu automatización no falle en silencio.</td></tr>
</table>

<div class="tip">
💡 Si ya tomaste <em>APIs con Python: Crea tu Bot Consultor de Telegram</em> de esta escuela, ya tienes buena base de Python y de llamar APIs — este curso amplía esa base hacia la automatización general (archivos, horarios) en vez de un solo bot específico.
</div>
`,
      quiz('¿Cuál es la diferencia entre "programar" y "automatizar"?',
        ['Son exactamente lo mismo', 'Programar es escribir instrucciones que ejecutas cuando quieres; automatizar es que esas instrucciones corran solas, en un horario o evento, sin que tú las inicies cada vez', 'Automatizar no requiere ningún código', 'Programar solo aplica a páginas web'], 1)),

    text('Fundamentos rápidos de Python (si nunca programaste)',
      'Lo mínimo indispensable para seguir el resto del curso, en una sola clase.',
      `
<h2>Instala Python</h2>
<p>Descarga Python desde <code>python.org</code> (o instálalo con <code>pkg install python</code> si ya tomaste el curso de <em>Termux</em>). Confirma la instalación:</p>
<pre><code>python --version</code></pre>

<h2>Variables: guardar información con un nombre</h2>
<pre><code>nombre = "Ada"
edad = 16
print(f"Hola {nombre}, tienes {edad} años")</code></pre>
<p>Una <strong>variable</strong> guarda un valor bajo un nombre que puedes reutilizar. El texto con <code>f</code> antes de las comillas (<em>f-string</em>) te deja insertar variables directamente dentro de un texto.</p>

<h2>Listas: varios valores juntos</h2>
<pre><code>tareas = ["Estudiar", "Hacer ejercicio", "Leer"]
for tarea in tareas:
    print(f"Pendiente: {tarea}")</code></pre>
<p>Una <strong>lista</strong> guarda varios valores en orden. El <code>for</code> recorre cada elemento, uno por uno — la base de casi toda automatización que procesa "muchas cosas".</p>

<h2>Funciones: código que reutilizas</h2>
<pre><code>def saludar(nombre):
    return f"Hola, {nombre}"

print(saludar("Ada"))</code></pre>
<p>Una <strong>función</strong> empaqueta código para reutilizarlo con distintos valores, sin copiar y pegar el mismo bloque una y otra vez.</p>

<h2>Instalar librerías con pip</h2>
<pre><code>pip install requests</code></pre>
<p><code>pip</code> es el instalador de paquetes de Python — instala código que otras personas ya escribieron, para no reinventar todo desde cero. Lo vas a usar en la siguiente clase para llamar a una IA desde tu código.</p>

<div class="tip">
💡 Con estas cuatro piezas (variables, listas, funciones, pip) ya tienes suficiente Python para seguir el resto del curso. Si quieres profundizar más en el lenguaje en sí, el curso <em>APIs con Python</em> de esta escuela tiene más fundamentos, y la Academia de Linux tiene consolas interactivas de Python para practicar.
</div>
`,
      quiz('¿Para qué sirve "pip" en Python?',
        ['Para ejecutar programas más rápido', 'Es el instalador de paquetes de Python: instala código que otras personas ya escribieron, sin tener que reinventarlo tú mismo', 'Es un editor de texto', 'Solo sirve para instalar Python mismo'], 1)),

    text('Llama a una IA desde tu código, no desde un chat',
      'La diferencia entre conversar con una IA y programar con ella.',
      `
<h2>Del chat a la API</h2>
<p>Cuando conversas con Claude, GPT o Gemini en su app, estás usando una interfaz pensada para humanos. Cuando quieres que <strong>tu propio código</strong> le pida algo a una IA (sin que tú lo escribas a mano cada vez), usas su <strong>API</strong> — la misma idea que viste en <em>APIs con Python: Crea tu Bot Consultor de Telegram</em>, aplicada aquí a un proveedor de IA en vez de a NASA o Pokémon.</p>

<h2>Guarda tu llave de forma segura — nunca en el código</h2>
<div class="warn">
⚠️ Como viste en <em>Domina Claude</em>: tu llave de API es una credencial real, como una contraseña. <strong>Nunca</strong> la escribas directamente en tu código — si subes ese archivo a un repositorio público, cualquiera podría usar tu llave y generarte cargos. Guárdala en una <strong>variable de entorno</strong> en su lugar.
</div>
<pre><code># En una terminal (no en tu código):
export ANTHROPIC_API_KEY="tu-llave-aqui"</code></pre>
<p>O mejor aún, en un archivo <code>.env</code> que <strong>nunca</strong> subes a Git (agrégalo a tu <code>.gitignore</code> — repasa el curso de Git y GitHub si no recuerdas cómo).</p>

<h2>Un ejemplo mínimo de llamada</h2>
<pre><code>import os
import anthropic

cliente = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

respuesta = cliente.messages.create(
    model="claude-sonnet-5",
    max_tokens=200,
    messages=[{"role": "user", "content": "Resume esto en una línea: " + texto_largo}]
)

print(respuesta.content[0].text)</code></pre>

<h2>Qué está pasando en este código</h2>
<table>
<tr><th>Línea</th><th>Qué hace</th></tr>
<tr><td><code>os.environ["ANTHROPIC_API_KEY"]</code></td><td>Lee la llave desde la variable de entorno, nunca escrita directamente en el código.</td></tr>
<tr><td><code>cliente.messages.create(...)</code></td><td>Envía tu mensaje a la IA y espera la respuesta.</td></tr>
<tr><td><code>respuesta.content[0].text</code></td><td>Extrae el texto de la respuesta, para poder usarlo en el resto de tu programa.</td></tr>
</table>

<div class="tip">
💡 Este mismo patrón (llamar a una API de IA desde código, procesar la respuesta, usarla en algo más grande) es exactamente cómo Oliver Academy conecta con tu propia mascota de IA — no es teoría, es el mecanismo real detrás de una función que ya usaste como estudiante.
</div>
`,
      quiz('¿Dónde NUNCA debe escribirse una llave de API?',
        ['En una variable de entorno', 'Directamente en el código, especialmente si ese código se sube a un repositorio público', 'En un archivo .env agregado al .gitignore', 'En la terminal al configurar el entorno'], 1)),

    text('Automatiza archivos: que Python organice y procese por ti',
      'Leer, escribir y mover archivos — la base de casi cualquier automatización.',
      `
<h2>Leer un archivo de texto</h2>
<pre><code>with open("notas.txt", "r", encoding="utf-8") as archivo:
    contenido = archivo.read()
print(contenido)</code></pre>
<p>El <code>with</code> asegura que el archivo se cierre automáticamente al terminar, incluso si ocurre un error — una buena práctica que evita archivos "atascados" abiertos.</p>

<h2>Escribir un archivo nuevo</h2>
<pre><code>with open("resumen.txt", "w", encoding="utf-8") as archivo:
    archivo.write("Este es el resumen generado por la IA.")</code></pre>

<h2>Recorrer todos los archivos de una carpeta</h2>
<pre><code>import os

for nombre_archivo in os.listdir("documentos"):
    if nombre_archivo.endswith(".txt"):
        print(f"Encontrado: {nombre_archivo}")</code></pre>
<p>Este patrón — recorrer una carpeta, filtrar por tipo de archivo, y hacer algo con cada uno — es la base de la mayoría de las automatizaciones de archivos: renombrar en lote, convertir formatos, o (como verás en el proyecto de este curso) resumir cada archivo con IA.</p>

<h2>Mover y organizar archivos automáticamente</h2>
<pre><code>import shutil

shutil.move("documentos/reporte.txt", "archivados/reporte.txt")</code></pre>
<p>La librería <code>shutil</code> (incluida en Python, sin instalar nada extra) te deja mover, copiar y organizar archivos por código — la base de un "organizador automático de carpetas".</p>

<h2>Combinando todo: un mini ejemplo</h2>
<div class="example">
<strong>Idea de automatización simple:</strong> un script que recorre tu carpeta de Descargas, y mueve cada archivo <code>.pdf</code> a una carpeta llamada "Documentos", y cada imagen a una carpeta llamada "Fotos" — usando exactamente los tres patrones que acabas de ver: recorrer, filtrar por tipo, y mover.
</div>

<div class="tip">
💡 Prueba siempre tus scripts de archivos primero sobre una carpeta de prueba con copias, nunca sobre tus archivos originales importantes — un error en el código podría mover o sobrescribir algo que no querías tocar.
</div>
`,
      quiz('¿Qué hace la librería "shutil" en Python?',
        ['Instala nuevas versiones de Python', 'Permite mover, copiar y organizar archivos por código', 'Se conecta a APIs de IA', 'Solo sirve para leer archivos, no para moverlos'], 1)),

    text('Ponlo en horario: que corra solo, sin que tengas que acordarte',
      'De ejecutar un script a mano a que se ejecute automáticamente.',
      `
<h2>El problema: acordarte de correrlo tú mismo</h2>
<p>Un script que solo corre cuando tú lo ejecutas manualmente no es realmente una automatización todavía — sigue dependiendo de tu memoria. El siguiente paso es que corra <strong>solo</strong>, en un horario.</p>

<h2>Opción 1: la librería schedule (simple, dentro de Python)</h2>
<pre><code>import schedule
import time

def tarea_diaria():
    print("Ejecutando mi automatización...")

schedule.every().day.at("09:00").do(tarea_diaria)

while True:
    schedule.run_pending()
    time.sleep(60)</code></pre>
<p>Este script se queda corriendo, revisando cada minuto si es hora de ejecutar la tarea programada. Es simple de entender, pero requiere que la computadora (o un servidor) esté encendida y el script corriendo todo el tiempo.</p>

<h2>Opción 2: el planificador del sistema operativo</h2>
<table>
<tr><th>Sistema</th><th>Herramienta</th></tr>
<tr><td>Linux / macOS</td><td><code>cron</code> — programa tareas para que el propio sistema operativo las ejecute, incluso si tu script no está corriendo activamente.</td></tr>
<tr><td>Windows</td><td>Programador de tareas (Task Scheduler)</td></tr>
</table>
<p>Con <code>cron</code>, por ejemplo, agregarías una línea como esta (editando con <code>crontab -e</code>):</p>
<pre><code>0 9 * * * python /ruta/a/tu_script.py</code></pre>
<p>Esto ejecuta tu script todos los días a las 9:00 AM, sin que necesites dejar nada corriendo manualmente de fondo.</p>

<h2>¿Cuál elegir?</h2>
<table>
<tr><th>Opción</th><th>Ventaja</th><th>Cuándo usarla</th></tr>
<tr><td><code>schedule</code> (dentro de Python)</td><td>Simple, todo en un solo archivo</td><td>Scripts pequeños que ya planeas dejar corriendo de fondo.</td></tr>
<tr><td><code>cron</code> / Task Scheduler</td><td>Más confiable, integrado al sistema operativo</td><td>Automatizaciones serias que necesitas que corran sí o sí.</td></tr>
</table>

<div class="tip">
💡 Si tomaste el curso de <em>Termux</em> de la Academia de Linux, ya viste <code>cron</code> (con el paquete <code>cronie</code>) — puedes usar exactamente ese conocimiento para programar tus automatizaciones de Python incluso desde tu teléfono.
</div>
`,
      quiz('¿Cuál es la ventaja de usar "cron" (o el Programador de tareas de Windows) sobre la librería schedule de Python?',
        ['No tiene ninguna ventaja real', 'cron ejecuta tu script según el horario definido incluso si tu script no está corriendo activamente de fondo, integrado directamente al sistema operativo', 'schedule es más confiable que cron', 'cron solo funciona en Windows'], 1)),

    text('Proyecto: un resumidor automático de archivos',
      'Combina todo lo que aprendiste en un proyecto completo, de principio a fin.',
      `
<h2>Lo que vas a construir</h2>
<p>Un script que, cada día a una hora fija: revisa una carpeta en busca de archivos de texto nuevos, le pide a una IA un resumen de cada uno, y guarda esos resúmenes en una carpeta separada — combinando exactamente lo que viste en las clases 3, 4 y 5.</p>

<h2>El esqueleto completo</h2>
<pre><code>import os
import anthropic

cliente = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

def resumir_texto(texto):
    respuesta = cliente.messages.create(
        model="claude-sonnet-5",
        max_tokens=150,
        messages=[{"role": "user", "content": f"Resume esto en 3 líneas:\\n\\n{texto}"}]
    )
    return respuesta.content[0].text

def procesar_carpeta():
    for nombre in os.listdir("documentos"):
        if not nombre.endswith(".txt"):
            continue
        ruta_original = os.path.join("documentos", nombre)
        with open(ruta_original, "r", encoding="utf-8") as f:
            texto = f.read()

        resumen = resumir_texto(texto)

        ruta_resumen = os.path.join("resumenes", f"resumen_{nombre}")
        with open(ruta_resumen, "w", encoding="utf-8") as f:
            f.write(resumen)
        print(f"Resumido: {nombre}")

procesar_carpeta()</code></pre>

<h2>Cómo se conecta cada pieza</h2>
<table>
<tr><th>Parte del código</th><th>De qué clase viene</th></tr>
<tr><td><code>cliente.messages.create(...)</code></td><td>Clase 3 — llamar a una IA desde código.</td></tr>
<tr><td><code>os.listdir(...)</code>, <code>open(...)</code></td><td>Clase 4 — recorrer y leer archivos.</td></tr>
<tr><td>Falta agregar <code>schedule</code> o <code>cron</code></td><td>Clase 5 — para que corra sola cada día.</td></tr>
</table>

<h2>Tu turno: personalízalo</h2>
<ul>
<li>Cambia el prompt para pedir algo distinto a un resumen (por ejemplo, extraer solo las fechas mencionadas).</li>
<li>Agrega un filtro para solo procesar archivos que no se hayan resumido antes.</li>
<li>Combínalo con la clase 5 para que corra automáticamente cada mañana.</li>
</ul>

<div class="tip">
💡 Usa a tu propio asistente de IA para adaptar este esqueleto a tu caso: pégale el código y dile exactamente qué quieres cambiar, como practicaste en <em>Crea tu Primera App con IA</em>.
</div>
`,
      quiz('¿Qué tres piezas de las clases anteriores se combinan en el proyecto de esta clase?',
        ['Solo el manejo de errores', 'Llamar a una IA desde código, leer/recorrer archivos, y (para completarlo del todo) programarlo en un horario', 'Solo la instalación de Python', 'Ninguna, es contenido completamente nuevo'], 1)),

    text('Manejo de errores: que tu automatización no falle en silencio',
      'La diferencia entre una automatización confiable y una que te falla sin avisarte.',
      `
<h2>El peor tipo de fallo: el silencioso</h2>
<p>Un script que se detiene con un error visible es molesto, pero al menos lo notas. El peligro real es una automatización que falla <strong>en silencio</strong> — deja de funcionar y tú no te enteras hasta días después, cuando notas que faltan resúmenes, o que tu carpeta de organización no se movió como esperabas.</p>

<h2>try/except: atrapa errores sin que todo se detenga</h2>
<pre><code>try:
    resumen = resumir_texto(texto)
except Exception as error:
    print(f"Error al resumir {nombre}: {error}")
    continue  # sigue con el siguiente archivo, en vez de detener todo el script</code></pre>
<p>El bloque <code>try</code> intenta ejecutar el código; si algo falla, el bloque <code>except</code> lo atrapa en vez de que el programa entero se detenga — útil especialmente cuando procesas muchos archivos y uno solo con un problema no debería arruinar el resto.</p>

<h2>No te quedes solo con "algo falló" — registra qué y cuándo</h2>
<pre><code>import logging

logging.basicConfig(filename="automatizacion.log", level=logging.INFO)

logging.info(f"Procesando {nombre}")
logging.error(f"Fallo al procesar {nombre}: {error}")</code></pre>
<p>Un archivo de <strong>log</strong> (registro) guarda un historial de qué pasó y cuándo — así, si algo falla, puedes revisar el log en vez de intentar recordar o adivinar qué salió mal.</p>

<h2>Notifícate a ti mismo cuando algo falla</h2>
<p>Para automatizaciones importantes, no basta con guardar el error en un log que quizás nunca revises — considera enviarte una notificación real (un mensaje de Telegram, como viste en <em>APIs con Python: Crea tu Bot Consultor de Telegram</em>, o un correo) cuando algo falla, para enterarte de inmediato en vez de días después.</p>

<h2>Checklist de una automatización confiable</h2>
<table>
<tr><th>Pregunta</th><th>Por qué importa</th></tr>
<tr><td>¿Qué pasa si un archivo está vacío o corrupto?</td><td>No debería tumbar todo el script.</td></tr>
<tr><td>¿Qué pasa si la API de IA no responde (sin internet, límite alcanzado)?</td><td>Debe registrarse el error, no fallar en silencio.</td></tr>
<tr><td>¿Cómo me entero si algo salió mal?</td><td>Un log como mínimo; una notificación activa, idealmente.</td></tr>
<tr><td>¿Puedo volver a correrlo sin duplicar trabajo ya hecho?</td><td>Evita reprocesar archivos ya resumidos innecesariamente.</td></tr>
</table>

<div class="warn">
⚠️ Cuanto más "invisible" es una automatización (corre sola, sin que la veas), más importante es que tenga buen manejo de errores — nadie está mirando en tiempo real para notar si algo salió mal.
</div>

<h2>Cierre del curso</h2>
<p>Ya sabes llamar a una IA desde tu propio código, automatizar archivos, programar tareas en horario, y hacerlo con manejo de errores confiable. Con estas piezas, puedes automatizar prácticamente cualquier tarea repetitiva de tu día a día que combine archivos, decisiones simples, y ayuda de una IA.</p>
`,
      quiz('¿Por qué es peligroso que una automatización falle "en silencio"?',
        ['No es peligroso, es lo ideal', 'Porque dejas de notar que algo dejó de funcionar hasta días después, cuando ya causó un problema mayor', 'Porque hace que el código sea más lento', 'Porque consume más memoria que un error visible'], 1)),
  ],
}
