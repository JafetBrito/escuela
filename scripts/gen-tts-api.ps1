# Genera el audio de los 2 videos del curso de APIs con Python
# (course-apis-python-telegram-bot): "Bienvenida" y "Tu Bot en Accion".
# Una sola vez.
Add-Type -AssemblyName System.Speech

$outDir = "remotion\public\audio"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$lines = @(
  @{ id = "apiw1"; text = "Bienvenida a APIs con Python, crea tu bot consultor de Telegram. En internet hay miles de fuentes de datos abiertas: el clima en tiempo real, la foto astronomica del dia de la NASA, estadisticas de cualquier Pokemon. En este curso vas a aprender a conectarte a cualquiera de ellas, y a construir tu propio bot de Telegram que las consulte por ti." },
  @{ id = "apiw2"; text = "Empezamos por lo mas importante: entender que es una API, con una analogia sencilla, la del mesero de un restaurante. Vas a aprender el lenguaje que usan todas las APIs del mundo: peticiones HTTP, y respuestas en formato JSON." },
  @{ id = "apiw3"; text = "Luego vas a escribir tu primera peticion real en Python, usando la libreria requests, y vas a aprender a proteger tus claves de acceso, algo que todo programador necesita saber hacer bien desde el principio." },
  @{ id = "apiw4"; text = "Aqui viene la parte divertida: vas a elegir tu propia aventura. Puedes conectar tu bot a la NASA, para mandar la foto astronomica del dia. Al clima en tiempo real, con datos de cualquier ciudad del mundo. O a PokeAPI, para consultar estadisticas de cualquier Pokemon. Tu decides, y el curso se adapta a tu eleccion." },
  @{ id = "apiw5"; text = "Despues vas a crear tu bot de verdad, hablando con BotFather dentro de Telegram, y vas a conectar Python a esa conversacion usando la libreria python telegram bot." },
  @{ id = "apiw6"; text = "Vas a aprender a manejar errores como se hace en codigo profesional, para que tu bot nunca se quede colgado ni se rompa por una falla de conexion. Y al final, vas a entender como mantenerlo corriendo." },
  @{ id = "apiw7"; text = "No necesitas experiencia previa con APIs para este curso, solo conocimientos basicos de Python. Al terminar, vas a tener un bot real, funcionando en tu computadora, hecho por ti de principio a fin. Empecemos." },

  @{ id = "apid1"; text = "Tu bot en accion, uniendo Telegram y tu API. En este video vas a ver el patron completo, de principio a fin, usando la NASA como ejemplo, pero la misma estructura exacta aplica sin importar que aventura hayas elegido." },
  @{ id = "apid2"; text = "Ya tienes tu token, el que te dio BotFather al crear tu bot. Ese token va a vivir en la primera linea de tu archivo bot punto py, la pieza que conecta tu codigo con Telegram." },
  @{ id = "apid3"; text = "Primero armas la base: creas una Application con tu token, usando Application punto builder, punto token, y punto build. Esa es la aplicacion que va a escuchar cada mensaje que le llegue a tu bot." },
  @{ id = "apid4"; text = "Le agregas un primer comando, slash start, con una funcion que simplemente saluda al usuario y le explica que puede pedirle a tu bot." },
  @{ id = "apid5"; text = "Ahora la parte importante: defines una segunda funcion, para el comando slash apod, que es donde va a vivir toda la magia de consultar la API." },
  @{ id = "apid6"; text = "Dentro de esa funcion, usas requests punto get, apuntando al endpoint de la NASA, y le pasas tu clave de API como parametro." },
  @{ id = "apid7"; text = "Antes de confiar en la respuesta, revisas el codigo de estado. Si no es doscientos, le avisas al usuario que algo salio mal, en vez de dejar que tu bot se rompa en silencio." },
  @{ id = "apid8"; text = "Si todo salio bien, conviertes la respuesta a JSON con punto json, y extraes el titulo, la explicacion, y la url de la imagen del dia." },
  @{ id = "apid9"; text = "Como quieres que la imagen se vea directo en el chat, usas reply guion bajo photo en vez de solo mandar el link como texto." },
  @{ id = "apid10"; text = "Registras ese nuevo comando con add guion bajo handler, exactamente igual que registraste slash start, y por ultimo llamas a run guion bajo polling, para que tu bot se quede escuchando." },
  @{ id = "apid11"; text = "Corres tu archivo con python, bot punto py, abres Telegram, le escribes slash apod a tu propio bot, y ahi esta: la foto astronomica del dia, respondida por codigo que tu escribiste." },
  @{ id = "apid12"; text = "Si elegiste la aventura del clima, el patron es identico, solo cambia el endpoint que consultas, y los parametros que le mandas: latitud y longitud en vez de una clave de API." },
  @{ id = "apid13"; text = "Y si elegiste PokeAPI, tambien es el mismo patron otra vez: cambias el endpoint, y usas el nombre del Pokemon como parte de la url." },
  @{ id = "apid14"; text = "En la proxima clase vas a ver el codigo completo, ya con manejo de errores incluido, para que tu bot nunca se quede colgado si la API tarda o falla. Ese es el ultimo paso antes de tener un bot verdaderamente solido." }
)

foreach ($line in $lines) {
  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $synth.SelectVoice("Microsoft Sabina Desktop")
  $synth.Rate = -1
  $path = Join-Path (Get-Location) "$outDir\$($line.id).wav"
  $synth.SetOutputToWaveFile($path)
  $synth.Speak($line.text)
  $synth.Dispose()
  Write-Host "OK: $path"
}
