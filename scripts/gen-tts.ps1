# Genera las 7 lineas del guion de "Cómo crear tu cuenta" como .wav con la
# voz Sabina (es-MX) de Windows. No se importa desde la app -- solo se corre
# una vez para producir remotion/public/audio/*.wav.
Add-Type -AssemblyName System.Speech

$outDir = "remotion\public\audio"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$lines = @(
  @{ id = "scene1"; text = "¿Quieres aprender algo nuevo, a tu propio ritmo? Bienvenido a Oliver Academy." },
  @{ id = "scene2"; text = "Empezar es gratis. Solo entra a la página principal y dale clic a Registrarme gratis." },
  @{ id = "scene3"; text = "Escribe tu nombre, tu correo y una contraseña segura, o si prefieres, entra directo con tu cuenta de Google, en un solo paso." },
  @{ id = "scene4"; text = "Confirma tus datos, y listo: tu cuenta ya está creada." },
  @{ id = "scene5"; text = "La próxima vez que quieras entrar, usa el botón Iniciar sesión con el mismo correo y contraseña, o con Google." },
  @{ id = "scene6"; text = "Ahí vas a encontrar tu Dashboard: tus cursos, tu progreso, y tu propia mascota de inteligencia artificial que te acompaña en cada clase." },
  @{ id = "scene7"; text = "Crea tu cuenta hoy y empieza a aprender con Oliver Academy." }
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
