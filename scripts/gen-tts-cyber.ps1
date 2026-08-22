# Genera el audio de los 2 videos narrativos del curso de Ciberseguridad
# (course-ciberseguridad-basica): "Bienvenida" (gancho de Emma y Raul) y
# "El Climax" (Raul cae en la trampa). El mismo audio se reutiliza para las
# versiones horizontal Y vertical de cada video (solo cambia el layout).
Add-Type -AssemblyName System.Speech

$outDir = "remotion\public\audio"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$lines = @(
  @{ id = "cyberw1"; text = "Bienvenida a Ciberseguridad para Todos, un curso presentado por Rubics Digital Solutions, con el lema: crear un mundo digital mas seguro." },
  @{ id = "cyberw2"; text = "A lo largo de este curso vas a seguir a dos companeros de trabajo: Emma y Raul." },
  @{ id = "cyberw3"; text = "Emma aplica, una por una, cada tecnica que vas a aprender aqui. Nunca reutiliza una contrasena, activa la verificacion en dos pasos en cada cuenta importante, y desconfia de cualquier mensaje que le pida actuar con urgencia." },
  @{ id = "cyberw4"; text = "Raul piensa distinto. Usa la misma contrasena en casi todas sus cuentas desde hace anos, y cada vez que una aplicacion le pide activar la verificacion en dos pasos, la pospone para despues." },
  @{ id = "cyberw5"; text = "Vas a ver a donde lleva cada camino. Incluyendo el dia exacto en que, sin que Raul se diera cuenta, alguien abrio un credito a su nombre." },
  @{ id = "cyberw6"; text = "Esta historia es ficticia, creada solo para este curso. Pero cada tecnica que usa el atacante es completamente real, y pasa todos los dias." },
  @{ id = "cyberw7"; text = "Vas a aprender a crear contrasenas realmente seguras, y a usar un gestor de contrasenas gratuito para no tener que memorizarlas nunca mas." },
  @{ id = "cyberw8"; text = "Vas a aprender a reconocer phishing, ingenieria social y malware, ademas de herramientas gratuitas reales: un antivirus, una VPN, y como revisar si tu correo ya fue filtrado alguna vez." },
  @{ id = "cyberw9"; text = "No necesitas experiencia tecnica para este curso. Solo necesitas estar dispuesto a hacer, esta semana, lo que Raul siguio posponiendo." },

  @{ id = "cyberc1"; text = "El climax: Raul cae en la trampa." },
  @{ id = "cyberc2"; text = "Un lunes por la manana, a Raul le llega un correo de su banco. Asunto: actividad inusual detectada, verifica tu cuenta en las proximas veinticuatro horas o sera suspendida." },
  @{ id = "cyberc3"; text = "El correo se ve profesional. Tiene el logo correcto, los colores correctos. Raul, con prisa antes de una junta, hace clic en el enlace sin pensarlo dos veces." },
  @{ id = "cyberc4"; text = "La pagina que se abre es identica al sitio real de su banco, pixel por pixel. Raul escribe ahi mismo su usuario y su contrasena." },
  @{ id = "cyberc5"; text = "Esa contrasena es la misma que usa en su correo, en sus redes sociales, y en el sistema del trabajo. Al escribirla ahi, sin darse cuenta, se la esta entregando al atacante." },
  @{ id = "cyberc6"; text = "Sin verificacion en dos pasos que lo detenga, el atacante entra directo a la cuenta bancaria de Raul, cambia su informacion de contacto, y con esos mismos datos solicita un credito a su nombre en otra institucion." },
  @{ id = "cyberc7"; text = "Semanas despues, Raul recibe una llamada de cobranza, por una deuda que el nunca pidio." },
  @{ id = "cyberc8"; text = "El mismo atacante intento el mismo truco con Emma. Su contrasena era unica, y estaba a salvo en su gestor de contrasenas. Y aunque la hubiera conseguido, la verificacion en dos pasos de Emma lo habria detenido de inmediato." },
  @{ id = "cyberc9"; text = "Emma ni siquiera se entero de que fue un objetivo. Su rutina de seguridad, simplemente, funciono en silencio." },
  @{ id = "cyberc10"; text = "En la siguiente clase vas a ver, paso a paso, que hacer si esto llega a pasarte a ti." }
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
