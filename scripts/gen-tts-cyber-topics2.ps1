# Videos por tema del curso de Ciberseguridad (course-ciberseguridad-basica),
# tanda 2: modulos 9-14, 16, 17.
Add-Type -AssemblyName System.Speech

$outDir = "remotion\public\audio"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$lines = @(
  @{ id = "cyb9_1"; text = "Wifi publica y VPN: cuidado con las redes que no controlas." },
  @{ id = "cyb9_2"; text = "En una red wifi publica, no sabes quien mas esta conectado, ni si el punto de acceso es siquiera legitimo." },
  @{ id = "cyb9_3"; text = "Una VPN cifra todo tu trafico. Incluso en una red comprometida, nadie mas puede ver lo que haces." },
  @{ id = "cyb9_4"; text = "ProtonVPN tiene un plan gratuito real. Usalo siempre que estes en un cafe, aeropuerto, o cualquier red que no sea tuya." },

  @{ id = "cyb10_1"; text = "Actualizaciones de software: la defensa que ignoras sin darte cuenta." },
  @{ id = "cyb10_2"; text = "Cuando una empresa corrige una falla de seguridad, tambien le esta avisando a los atacantes exactamente donde estaba." },
  @{ id = "cyb10_3"; text = "Quien no actualiza, sigue expuesto a un problema que ya es publico." },
  @{ id = "cyb10_4"; text = "Activa las actualizaciones automaticas en tu sistema, tu navegador, y tu celular. Es la defensa mas simple que existe." },

  @{ id = "cyb11_1"; text = "Copias de seguridad: la regla tres, dos, uno." },
  @{ id = "cyb11_2"; text = "Tres copias de tus archivos. Dos tipos de almacenamiento distintos. Una copia fuera de tu casa." },
  @{ id = "cyb11_3"; text = "Google Drive y OneDrive dan varios gigas gratis. Sube ahi tus fotos y documentos importantes." },
  @{ id = "cyb11_4"; text = "Si un ransomware cifra tus archivos algun dia, simplemente restauras tu copia. Sin pagarle nada a nadie." },

  @{ id = "cyb12_1"; text = "Privacidad en redes sociales: lo que publicas es municion." },
  @{ id = "cyb12_2"; text = "Tu fecha de nacimiento, el nombre de tu mascota, donde trabajas, todo eso ayuda a un atacante a construir un ataque mas creible." },
  @{ id = "cyb12_3"; text = "Pon tu perfil en privado, y limita quien ve tu lista de amigos." },
  @{ id = "cyb12_4"; text = "No se trata de dejar las redes sociales. Se trata de decidir a proposito que compartes." },

  @{ id = "cyb13_1"; text = "Navegacion segura: habitos simples que evitan la mayoria de los problemas." },
  @{ id = "cyb13_2"; text = "El candado, o https, confirma que tu conexion esta cifrada, pero no que el sitio sea de fiar." },
  @{ id = "cyb13_3"; text = "Descarga software solo de la fuente oficial, nunca de sitios de descarga gratis de terceros." },
  @{ id = "cyb13_4"; text = "Antes de hacer clic en un enlace, pasa el mouse encima para ver la direccion real." },

  @{ id = "cyb14_1"; text = "Seguridad en el trabajo: tu responsabilidad no termina en casa." },
  @{ id = "cyb14_2"; text = "Nunca conectes una memoria USB desconocida a tu computadora del trabajo." },
  @{ id = "cyb14_3"; text = "Bloquea tu pantalla cada vez que te alejes, aunque sea un momento." },
  @{ id = "cyb14_4"; text = "Y reporta cualquier correo sospechoso a tu equipo de soporte. Asi avisan a todos antes de que alguien mas caiga." },

  @{ id = "cyb16_1"; text = "Robo de identidad: que hacer si ya te hackearon." },
  @{ id = "cyb16_2"; text = "Cambia la contrasena de inmediato, desde un dispositivo limpio, y activa dos efe a si no lo tenias." },
  @{ id = "cyb16_3"; text = "Contacta a tu banco directamente, con el numero oficial, nunca el que venga en un correo." },
  @{ id = "cyb16_4"; text = "Have I Been Pwned te dice, gratis, si tu correo ya aparecio en alguna filtracion conocida." },

  @{ id = "cyb17_1"; text = "Asi se mantuvo protegida Emma. El mismo ataque, dos finales distintos." },
  @{ id = "cyb17_2"; text = "Tu checklist de esta semana: gestor de contrasenas, dos efe a, antivirus activo, y una copia de seguridad." },
  @{ id = "cyb17_3"; text = "No necesitas hacerlo todo hoy. Solo necesitas empezar por uno, hoy, y seguir mañana." },
  @{ id = "cyb17_4"; text = "Este curso fue posible gracias a Rubics Digital Solutions. Crear un mundo digital mas seguro." }
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
