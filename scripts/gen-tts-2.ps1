# Genera el audio de las 2 lecciones-video (Anatomia de un Prompt Perfecto,
# Como Piensa Realmente una IA) para course-003. Una sola vez.
Add-Type -AssemblyName System.Speech

$outDir = "remotion\public\audio"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$lines = @(
  @{ id = "anat1"; text = "Anatomía de un prompt perfecto. En este video vas a ver los 5 elementos que tiene todo prompt poderoso." },
  @{ id = "anat2"; text = "El primero es el Rol: dile a la IA quién es para esta tarea. Por ejemplo, eres un oncólogo con 20 años de experiencia. Esto activa el conocimiento relevante del modelo." },
  @{ id = "anat3"; text = "El segundo es el Contexto: la IA no sabe nada de tu situación específica, así que dale el trasfondo necesario antes de pedir algo." },
  @{ id = "anat4"; text = "El tercero es la Tarea: específica y accionable, con verbos claros como analiza, genera o resume. El cuarto es el Formato de salida: dile cómo quieres la respuesta, en lista, tabla, JSON, o un número de palabras." },
  @{ id = "anat5"; text = "El quinto elemento son las Restricciones: qué NO debe hacer la IA. Junta los cinco y tienes el framework RCTFS: Rol, Contexto, Tarea, Formato, Sin restricciones." },
  @{ id = "anat6"; text = "No siempre necesitas los cinco. Para tareas simples, Tarea más Formato es suficiente. Nos vemos en la siguiente clase." },
  @{ id = "mente1"; text = "¿Cómo piensa realmente una IA? Antes de seguir con más técnicas, vamos a abrir la caja negra." },
  @{ id = "mente2"; text = "Un modelo de lenguaje no piensa como una persona. Es una función matemática enorme que recibe texto y devuelve texto, sin memoria entre conversaciones." },
  @{ id = "mente3"; text = "El modelo no ve palabras completas, ve tokens: fragmentos de texto. Por eso el largo de tu prompt se mide en tokens, no en palabras." },
  @{ id = "mente4"; text = "Generar una respuesta es un proceso repetitivo: el modelo calcula la probabilidad de cada token siguiente, lo elige, y vuelve a calcular. Así se construye toda la respuesta, token por token." },
  @{ id = "mente5"; text = "Un mecanismo llamado atención le permite al modelo revisar todo tu prompt a la vez, y decidir qué partes son más relevantes para cada token que genera." },
  @{ id = "mente6"; text = "Esto explica por qué el orden importa, por qué el razonamiento paso a paso funciona, y por qué a veces alucina. No es magia, es estadística a gran escala." }
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
