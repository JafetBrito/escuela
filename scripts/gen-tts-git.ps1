# Genera el audio de los 2 videos del curso de Git y GitHub
# (course-git-github): "La Historia de Git y GitHub" y "Tu flujo de trabajo
# diario con Git". Una sola vez.
Add-Type -AssemblyName System.Speech

$outDir = "remotion\public\audio"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$lines = @(
  @{ id = "githist1"; text = "La historia de Git y GitHub. Todo empezó con un enojo, en el año 2005." },
  @{ id = "githist2"; text = "Linus Torvalds, el creador del kernel de Linux, usaba una herramienta llamada BitKeeper para llevar el control de versiones del proyecto. Cuando la empresa dueña de BitKeeper retiró el acceso gratuito, Linus se quedó sin herramienta, y sin tiempo que perder." },
  @{ id = "githist3"; text = "En lugar de buscar un reemplazo, Linus decidió escribir su propia herramienta desde cero. La programó en apenas diez días. La llamó Git, una palabra de argot británico que, según el propio Linus, bromeando, se puede traducir como persona desagradable. Dijo que nombraba sus proyectos según él mismo." },
  @{ id = "githist4"; text = "Git se diseñó con tres objetivos claros: velocidad extrema, integridad de los datos, y soporte real para el desarrollo distribuido, donde miles de programadores en todo el mundo pudieran trabajar en paralelo sin depender de un servidor central." },
  @{ id = "githist5"; text = "En 2008, tres desarrolladores, Chris Wanstrath, PJ Hyett y Tom Preston-Werner, fundaron GitHub: un sitio web para alojar repositorios de Git, y sobre todo, para que programadores de todo el mundo pudieran colaborar y descubrir proyectos de código abierto con facilidad." },
  @{ id = "githist6"; text = "GitHub creció hasta convertirse en el hogar de la mayoría del código abierto del planeta. En 2018, Microsoft lo compró por más de siete mil millones de dólares, una señal clara de lo central que se había vuelto para la industria entera del software." },
  @{ id = "githist7"; text = "Hoy, Git corre silenciosamente detrás de casi cualquier proyecto de software que uses, y GitHub es el lugar donde se construye, se revisa y se comparte ese código. Lo que empezó como la solución de un fin de semana enojado, terminó siendo el lenguaje común de todos los programadores del mundo." },

  @{ id = "gitflow1"; text = "Tu flujo de trabajo diario con Git. Ya viste cada comando por separado, ahora júntalos en el ciclo que vas a repetir todos los días como programador." },
  @{ id = "gitflow2"; text = "Primero, antes de empezar a trabajar, actualiza tu copia local con los cambios más recientes de tu equipo: git pull." },
  @{ id = "gitflow3"; text = "Segundo, crea una rama nueva para lo que vas a hacer hoy, con un nombre que describa la tarea: git switch guion c, y el nombre de tu rama." },
  @{ id = "gitflow4"; text = "Tercero, mientras trabajas, guarda tu progreso en commits pequeños y frecuentes: git add, y git commit con un mensaje claro. No esperes hasta el final del día para hacer un solo commit gigante." },
  @{ id = "gitflow5"; text = "Cuarto, cuando termines, sube tu rama a GitHub con git push, y abre un Pull Request para que tu equipo revise el trabajo." },
  @{ id = "gitflow6"; text = "Quinto, una vez aprobado, se fusiona a main, tu rama se puede borrar, y el ciclo empieza de nuevo: pull, rama, commits, push, Pull Request." },
  @{ id = "gitflow7"; text = "Practica este ciclo hasta que se sienta automático. En un par de semanas de uso real, vas a dejar de pensar en los comandos uno por uno, y simplemente vas a hablar Git." }
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
