Add-Type -AssemblyName System.Speech

$outDir = "remotion\public\audio"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$lines = @(
  @{ id = "tales15"; text = "Tales tambien fue astronomo. Se le atribuye haber predicho un eclipse solar que ocurrio en el año quinientos ochenta y cinco antes de nuestra era, un eclipse que, segun el historiador Herodoto, detuvo en seco una batalla entre lidios y medos, porque ambos ejercitos lo interpretaron como una señal de los dioses." },
  @{ id = "tales16"; text = "Aristoteles, siglos despues, lo llamo el primero de los filosofos: el primero en intentar explicar el origen y la naturaleza del mundo sin recurrir a mitos, sino buscando causas naturales. De Tales surgio lo que hoy conocemos como la escuela de Mileto, con discipulos como Anaximandro y Anaximenes, que siguieron esa misma busqueda." },
  @{ id = "tales17"; text = "Esa busqueda de causas naturales, en vez de explicaciones religiosas, es tan importante como la propia demostracion geometrica. Tales no solo cambio como se hacian las matematicas. Ayudo a cambiar como los seres humanos se preguntaban por que las cosas son como son." },

  @{ id = "pit15"; text = "Los pitagoricos tambien fueron pioneros en algo mas: creian en la transmigracion de las almas, y seguian reglas de vida estrictas, incluyendo un juramento de silencio sobre los descubrimientos internos de la hermandad. La matematica, para ellos, no era solo una tecnica: era casi un camino espiritual hacia la comprension del cosmos." },
  @{ id = "pit16"; text = "Con el tiempo, el numero irracional dejo de ser un escandalo y se convirtio en parte normal de las matematicas. Pero el nombre se quedo, como un eco de aquella crisis: incluso hoy, seguimos llamando irracional a un numero que simplemente no se puede escribir como una fraccion exacta." },

  @{ id = "euc17"; text = "El rigor de Euclides marco un estandar que las matematicas nunca abandonaron: cada afirmacion nueva debe apoyarse solamente en lo que ya fue aceptado antes, sin excepciones, sin dar nada por sentado que no este explicitamente declarado desde el principio." },

  @{ id = "arq16"; text = "Arquimedes tambien escribio El Contador de Arena, un texto donde desarrollo un sistema para nombrar numeros extremadamente grandes, capaz de expresar cuantos granos de arena cabrian en todo el universo conocido por los griegos, empujando los limites de la notacion numerica de su epoca." },
  @{ id = "arq17"; text = "Estudio tambien las espirales que hoy llevan su nombre, y calculo areas y volumenes de esferas y cilindros con un nivel de precision que no se volveria a alcanzar hasta la invencion del calculo, casi dos mil años despues. El propio Arquimedes pidio que, en su tumba, grabaran una esfera inscrita en un cilindro, el resultado del que mas orgulloso se sentia." }
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
