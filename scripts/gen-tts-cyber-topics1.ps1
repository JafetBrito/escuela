# Videos por tema del curso de Ciberseguridad (course-ciberseguridad-basica),
# tanda 1: modulos 1-8. Cada video da el mismo contenido de la clase de forma
# mas breve y entretenida; el texto completo se queda abajo del video.
Add-Type -AssemblyName System.Speech

$outDir = "remotion\public\audio"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$lines = @(
  @{ id = "cyb1_1"; text = "Por que importa la ciberseguridad. La mayoria de los ataques no buscan a alguien importante, te buscan a ti, junto con un millon de personas mas." },
  @{ id = "cyb1_2"; text = "Es barato para un atacante mandar un millon de correos falsos. Si solo uno de cada mil cae, ya le valio la pena." },
  @{ id = "cyb1_3"; text = "No necesitas ser un objetivo especial. Basta con estar descuidado en el momento equivocado." },
  @{ id = "cyb1_4"; text = "En este curso vas a aprender exactamente que hacer, con herramientas gratuitas reales, siguiendo la historia de Emma y Raul." },

  @{ id = "cyb2_1"; text = "Contrasenas seguras: tu primera linea de defensa." },
  @{ id = "cyb2_2"; text = "Raul usa la misma contrasena en todo. Si una sola cuenta se filtra, un atacante la prueba automaticamente en todas las demas, se llama credential stuffing." },
  @{ id = "cyb2_3"; text = "Una contrasena fuerte no es un monton de simbolos raros, es una frase larga y aleatoria. Entre mas larga, exponencialmente mas dificil de adivinar." },
  @{ id = "cyb2_4"; text = "La regla de oro: nunca repitas contrasenas. Sobre todo la de tu correo, con acceso a el se puede resetear casi cualquier otra cuenta tuya." },

  @{ id = "cyb3_1"; text = "Como tener una contrasena distinta y fuerte en cada cuenta, sin volverte loco memorizandolas. Con un gestor de contrasenas." },
  @{ id = "cyb3_2"; text = "Bitwarden es gratuito, de codigo abierto, y funciona en tu computadora, tu celular y tu navegador." },
  @{ id = "cyb3_3"; text = "Solo memorizas una contrasena maestra. Bitwarden genera y recuerda el resto por ti, largas, aleatorias, imposibles de adivinar." },
  @{ id = "cyb3_4"; text = "Empieza por tu correo, tu banco y tus redes sociales. El resto lo vas agregando poco a poco." },

  @{ id = "cyb4_1"; text = "La autenticacion de dos factores, o dos efe a, es el candado extra de tus cuentas." },
  @{ id = "cyb4_2"; text = "Aunque un atacante tenga tu contrasena, sin el codigo de tu celular no puede entrar." },
  @{ id = "cyb4_3"; text = "Una aplicacion de autenticacion, como Google Authenticator, es mas segura que recibir el codigo por mensaje de texto." },
  @{ id = "cyb4_4"; text = "Activalo primero en tu correo, es la cuenta que un atacante usaria para resetear todas las demas." },

  @{ id = "cyb5_1"; text = "Phishing: cuando alguien se hace pasar por tu banco, o por una empresa de confianza, para robarte informacion." },
  @{ id = "cyb5_2"; text = "Las senales: urgencia extrema, un saludo generico como estimado cliente, y un remitente con un dominio raro." },
  @{ id = "cyb5_3"; text = "Ningun banco real te pide tu contrasena completa por correo. Nunca." },
  @{ id = "cyb5_4"; text = "Truco seguro: nunca uses el enlace del correo. Abre tu navegador aparte, y escribe tu mismo la direccion oficial." },

  @{ id = "cyb6_1"; text = "Ingenieria social: manipular a una persona, no a una computadora." },
  @{ id = "cyb6_2"; text = "Vishing es la llamada falsa. Smishing es el mensaje de texto falso. Mismo engano, canal distinto." },
  @{ id = "cyb6_3"; text = "Casi todos estos ataques usan las mismas tres palancas: urgencia, autoridad, y miedo." },
  @{ id = "cyb6_4"; text = "Cuando sientas las tres juntas en un mensaje inesperado, detente, y verifica por otro canal antes de actuar." },

  @{ id = "cyb7_1"; text = "Malware es cualquier programa disenado para daniarte o espiarte. El mas peligroso: el ransomware." },
  @{ id = "cyb7_2"; text = "El ransomware cifra todos tus archivos, y pide un pago para liberarlos. Pagar no garantiza nada." },
  @{ id = "cyb7_3"; text = "Entra por adjuntos de correo, software pirata, y memorias USB desconocidas." },
  @{ id = "cyb7_4"; text = "Tu mejor defensa real: un antivirus activo, y copias de seguridad recientes. Si te cifran los archivos, simplemente restauras, sin pagarle nada al atacante." },

  @{ id = "cyb8_1"; text = "Herramienta real: tu antivirus, y como reforzarlo, gratis." },
  @{ id = "cyb8_2"; text = "Si usas Windows, ya tienes Microsoft Defender integrado y activo, un antivirus real, sin costo." },
  @{ id = "cyb8_3"; text = "Refuerzo gratuito: Malwarebytes, para un escaneo completo cada mes." },
  @{ id = "cyb8_4"; text = "Nunca instales dos antivirus a la vez, se interfieren entre si, y te dejan menos protegido, no mas." }
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
