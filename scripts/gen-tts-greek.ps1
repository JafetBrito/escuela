# Genera el audio de los 4 videos largos (5-6+ minutos cada uno) del curso
# "Matematicas de la Antigua Grecia": Tales, Pitagoras, Euclides/axiomas,
# Arquimedes. Una sola vez.
Add-Type -AssemblyName System.Speech

$outDir = "remotion\public\audio"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$lines = @(
  # ── TALES (14 lineas) ──────────────────────────────────────────────
  @{ id = "tales01"; text = "Tales de Mileto y la primera demostracion. Alrededor del año seiscientos veinticuatro antes de nuestra era, en la ciudad griega de Mileto, nacio el hombre a quien la tradicion le atribuye haber inventado algo que hoy damos por sentado: la demostracion matematica." },
  @{ id = "tales02"; text = "Mileto era una ciudad prospera, en la region de Jonia, con contacto comercial directo con Egipto y con Babilonia. De ahi, Tales heredo buena parte de su conocimiento tecnico. Pero lo transformo en algo completamente nuevo." },
  @{ id = "tales03"; text = "Los egipcios y los babilonios ya sabian calcular areas, predecir eclipses, y construir con una precision asombrosa. Tenian formulas que funcionaban una y otra vez. Pero casi nunca explicaban por que funcionaban. Era conocimiento heredado, probado por la practica, no demostrado con logica." },
  @{ id = "tales04"; text = "La anecdota mas famosa de Tales cuenta que los sacerdotes egipcios, orgullosos de sus piramides, lo retaron a calcular la altura de la Gran Piramide sin subirse a ella." },
  @{ id = "tales05"; text = "Tales espero al momento exacto del dia en que la longitud de su propia sombra era igual a su propia altura. En ese instante, midio la sombra de la piramide. Esa sombra media exactamente lo mismo que la altura real de la piramide." },
  @{ id = "tales06"; text = "La razon detras del truco: en ese momento del dia, el sol forma el mismo angulo con el suelo para todo lo que hay alrededor. Si tu sombra mide lo mismo que tu altura, es porque los rayos de luz forman un angulo de cuarenta y cinco grados. Ese mismo angulo aplica para la piramide, para ti, y para cualquier otro objeto vertical en ese instante." },
  @{ id = "tales07"; text = "Lo importante no es el truco en si. Los egipcios probablemente ya sabian usar sombras para medir. Lo importante es que Tales, segun la tradicion, no se quedo con que funciono esta vez. Busco la razon general detras del metodo: la proporcionalidad entre triangulos semejantes." },
  @{ id = "tales08"; text = "Se le atribuyen a Tales varios resultados geometricos. El primero: un circulo queda dividido en dos partes iguales por cualquiera de sus diametros." },
  @{ id = "tales09"; text = "El segundo: los angulos en la base de un triangulo isosceles, es decir, uno con dos lados iguales, son iguales entre si." },
  @{ id = "tales10"; text = "El tercero, y el mas famoso: el angulo inscrito en un semicirculo siempre es un angulo recto, de noventa grados, sin importar donde, sobre el semicirculo, coloques el tercer punto del triangulo. Este resultado hoy se conoce, en muchos paises, como el Teorema de Tales." },
  @{ id = "tales11"; text = "Y el cuarto, el teorema de la proporcionalidad: si dos rectas se cortan por varias rectas paralelas, los segmentos que se forman son proporcionales entre si. Es exactamente la idea que uso con la sombra de la piramide." },
  @{ id = "tales12"; text = "Los historiadores debaten cuanto de esta historia es literalmente cierto, y cuanto es leyenda construida despues, por generaciones posteriores de griegos que necesitaban un padre fundador para sus matematicas." },
  @{ id = "tales13"; text = "Pero incluso como leyenda, cumple una funcion real: marca simbolicamente el momento en que las matematicas griegas empezaron a distinguirse de todo lo anterior. El momento en que alguien dijo: no basta con que funcione, quiero saber por que tiene que ser asi." },
  @{ id = "tales14"; text = "Ese momento, real o legendario, abrio la puerta a todo lo que vas a ver en el resto de este curso. En la siguiente clase, conoces a Pitagoras, y a una hermandad que creia que el universo entero estaba hecho de numeros." }

  # ── PITAGORAS (14 lineas) ────────────────────────────────────────────
  @{ id = "pit01"; text = "Pitagoras y los pitagoricos. Pitagoras nacio alrededor del año quinientos setenta antes de nuestra era, y fundo, en el sur de Italia, una comunidad que era, a la vez, escuela filosofica, secta religiosa, y sociedad secreta." },
  @{ id = "pit02"; text = "Los pitagoricos creian que la realidad entera, la musica, la astronomia, la geometria, hasta el alma humana, podia explicarse a traves de los numeros y las proporciones entre ellos. Todo es numero no era una metafora para ellos. Era, literalmente, su vision del universo." },
  @{ id = "pit03"; text = "Descubrieron, por ejemplo, que las notas musicales que suenan armoniosas juntas corresponden a proporciones simples entre las longitudes de una cuerda vibrante. Dos a uno para la octava, tres a dos para la quinta. Para ellos, esto confirmaba que el universo entero estaba afinado matematicamente." },
  @{ id = "pit04"; text = "El resultado mas famoso asociado a esta escuela dice: en cualquier triangulo rectangulo, el cuadrado de la hipotenusa, el lado mas largo, es igual a la suma de los cuadrados de los otros dos lados. A al cuadrado, mas be al cuadrado, es igual a ce al cuadrado." },
  @{ id = "pit05"; text = "Este resultado probablemente ya se conocia de forma practica en Babilonia y en Egipto. Hay tablillas babilonicas con conjuntos de numeros que cumplen esta relacion, siglos antes de Pitagoras. Lo que la tradicion atribuye a la escuela pitagorica es una demostracion general: una prueba de que esto es cierto para absolutamente cualquier triangulo rectangulo, no solo para los casos ya probados." },
  @{ id = "pit06"; text = "Y aqui viene la parte mas dramatica de esta historia. Toma un triangulo rectangulo cuyos dos catetos midan exactamente uno. Segun el propio teorema pitagorico, la hipotenusa mide raiz de dos." },
  @{ id = "pit07"; text = "Un pitagorico, la tradicion dice que fue Hipaso de Metaponto, demostro algo perturbador: raiz de dos no se puede expresar como una fraccion de dos numeros enteros. No importa que tan grandes o pequeños sean los numeros que intentes, nunca vas a encontrar una fraccion exacta igual a raiz de dos. Hoy llamamos a estos numeros irracionales." },
  @{ id = "pit08"; text = "Para los pitagoricos, esto era una catastrofe filosofica, no solo matematica. Si todo es numero significaba que todo se podia expresar como proporciones entre numeros enteros, y aqui habia una longitud perfectamente real, la diagonal de un simple cuadrado, que ninguna proporcion entre enteros podia capturar exactamente." },
  @{ id = "pit09"; text = "Segun la leyenda, probablemente exagerada con los siglos, la hermandad intento mantener este descubrimiento en secreto. Algunas versiones cuentan que Hipaso murio ahogado por revelarlo, un castigo divino, segun se decia, por profanar algo que debia permanecer oculto." },
  @{ id = "pit10"; text = "Sea o no literalmente cierta la leyenda, refleja lo perturbador que fue este hallazgo para quienes lo hicieron. Habian construido una demostracion perfecta, y esa misma demostracion los llevo a una conclusion que hubieran preferido no encontrar." },
  @{ id = "pit11"; text = "Esta es una de las primeras veces en la historia en que una demostracion matematica rigurosa obliga a aceptar una conclusion incomoda, incluso en contra de lo que uno preferiria creer." },
  @{ id = "pit12"; text = "Es un patron que se va a repetir una y otra vez en la historia de las matematicas, y de la ciencia en general: la logica, cuando se sigue hasta el final, no siempre te lleva a donde tu querias llegar." },
  @{ id = "pit13"; text = "Los pitagoricos nunca resolvieron del todo esta tension. Pero el problema que abrieron, el de los numeros irracionales, se convirtio en una de las preguntas centrales de las matematicas griegas durante los siglos siguientes." },
  @{ id = "pit14"; text = "En la siguiente clase, antes de conocer a Euclides, vas a entender que es exactamente un axioma, y por que toda demostracion, tarde o temprano, necesita un punto de partida que no se demuestra." }

  # ── EUCLIDES (16 lineas) ────────────────────────────────────────────
  @{ id = "euc01"; text = "Los Elementos de Euclides y los cinco postulados. Euclides de Alejandria estuvo activo alrededor del año trescientos antes de nuestra era. No fue, casi con certeza, el descubridor original de la mayoria de los resultados de su obra." },
  @{ id = "euc02"; text = "Muchos de esos resultados ya eran conocidos por matematicos griegos anteriores, incluyendo a Tales y a los pitagoricos. El logro de Euclides fue distinto, y quizas mas importante: organizar todo ese conocimiento disperso en un solo sistema logico." },
  @{ id = "euc03"; text = "Empezando desde definiciones y axiomas minimos, y construyendo, paso a paso, cientos de resultados encima de ellos. Los Elementos se uso como libro de texto de geometria, casi sin cambios, durante mas de dos mil años. Probablemente el libro de texto cientifico de mayor vigencia en toda la historia humana." },
  @{ id = "euc04"; text = "Antes de los postulados especificos de geometria, viene una pregunta mas basica: que es, exactamente, un axioma. Imagina que quieres demostrar una afirmacion. Para eso usas otra afirmacion, que ya demostraste antes. Pero para demostrar esa, necesitaste otra mas. Si este proceso nunca se detiene, tienes un problema real." },
  @{ id = "euc05"; text = "Euclides resolvio esto de forma elegante: aceptar, desde el inicio, un pequeño conjunto de afirmaciones que no se demuestran, porque se consideran evidentes por si mismas, o porque son necesarias como punto de partida. A esas afirmaciones las llamamos axiomas, o postulados." },
  @{ id = "euc06"; text = "Piensalo como las reglas de un juego de mesa. No tiene sentido preguntar, dentro del ajedrez, por que el alfil se mueve en diagonal. Esa regla simplemente es el punto de partida que hace posible jugar. Los axiomas son las reglas del juego de un sistema matematico." },
  @{ id = "euc07"; text = "Euclides comienza Los Elementos con definiciones, que es un punto, que es una linea, y con nociones comunes, ideas logicas generales. Pero lo mas importante son cinco postulados especificos de la geometria." },
  @{ id = "euc08"; text = "El primero: se puede trazar una linea recta entre dos puntos cualesquiera. El segundo: una linea recta se puede extender indefinidamente en cualquier direccion." },
  @{ id = "euc09"; text = "El tercero: se puede trazar un circulo con cualquier centro y cualquier radio. El cuarto: todos los angulos rectos son iguales entre si." },
  @{ id = "euc10"; text = "Y el quinto, el postulado de las paralelas: si una linea cruza otras dos lineas y forma angulos internos que suman menos de dos angulos rectos, entonces esas dos lineas, si se extienden lo suficiente, se van a cruzar del lado donde esa suma es menor." },
  @{ id = "euc11"; text = "Los primeros cuatro son cortos, casi obvios de leer. El quinto es notablemente mas largo y complicado. Y esa diferencia no paso desapercibida." },
  @{ id = "euc12"; text = "Durante mas de dos mil años, generaciones de matematicos sospecharon que el quinto postulado no era un verdadero axioma, algo evidente por si mismo, sino un teorema que deberia poder demostrarse a partir de los otros cuatro. Muchos lo intentaron. Todos fracasaron." },
  @{ id = "euc13"; text = "Hay una version equivalente, mas facil de recordar, formulada siglos despues por el matematico escoces John Playfair: por un punto fuera de una linea, se puede trazar exactamente una unica linea paralela a esa linea. Suena obvio. Pero nadie logro demostrarlo a partir de los otros cuatro postulados." },
  @{ id = "euc14"; text = "El misterio no se resolvio hasta el siglo diecinueve, cuando matematicos como Gauss, Lobachevski y Bolyai se hicieron una pregunta distinta: que pasa si, en vez de intentar demostrar el quinto postulado, simplemente lo cambiamos." },
  @{ id = "euc15"; text = "El resultado fueron las geometrias no euclidianas: sistemas completamente consistentes, tan validos matematicamente como el de Euclides, donde por un punto fuera de una linea pasan cero, o infinitas paralelas, no exactamente una." },
  @{ id = "euc16"; text = "El postulado incomodo de Euclides termino abriendo, dos milenios despues, una puerta que nadie esperaba. Y a partir de esos cinco postulados, Euclides demuestra, paso a paso, cientos de resultados, incluyendo, con una demostracion completa y rigurosa, el propio teorema de Pitagoras." }

  # ── ARQUIMEDES (15 lineas) ────────────────────────────────────────────
  @{ id = "arq01"; text = "Arquimedes: pi, el infinito y la palanca. Arquimedes de Siracusa vivio alrededor del año doscientos ochenta y siete al doscientos doce antes de nuestra era. Para muchos historiadores, es el matematico mas brillante de toda la Antiguedad, y uno de los mas grandes de cualquier epoca." },
  @{ id = "arq02"; text = "Combino, como pocos en la historia, las matematicas puras con la ingenieria aplicada. Diseño maquinas de guerra que ayudaron a defender Siracusa de Roma durante años, e hizo descubrimientos matematicos que se adelantaron por siglos a su tiempo." },
  @{ id = "arq03"; text = "La anecdota mas famosa: el rey Hieron segundo le pidio averiguar si su corona era de oro puro, sin dañarla. Segun la leyenda, la solucion se le ocurrio al meterse a una tina de baño, y notar que el nivel del agua subia en proporcion al volumen de su cuerpo sumergido." },
  @{ id = "arq04"; text = "Corrio desnudo por las calles gritando Eureka, lo encontre. Habia descubierto que podia medir el volumen exacto de un objeto de forma irregular, como una corona, sumergiendolo en agua, y comparar su densidad con la del oro puro." },
  @{ id = "arq05"; text = "Pero el aporte matematico mas profundo de Arquimedes es el metodo de exhaucion: una tecnica para calcular areas y volumenes de figuras curvas, donde la geometria de lineas rectas de Euclides no alcanza, aproximandolas con figuras rectas cada vez mas precisas." },
  @{ id = "arq06"; text = "Para calcular el area de un circulo, Arquimedes inscribio y circunscribio poligonos regulares, con lados rectos, que si sabia medir con exactitud, cada vez con mas lados: un hexagono, luego uno de doce lados, luego veinticuatro, cuarenta y ocho, hasta noventa y seis lados." },
  @{ id = "arq07"; text = "Cada vez, el poligono se acerca mas y mas a la forma del circulo, agotando la diferencia entre ambas figuras. Con esta tecnica, calculo que pi esta entre tres punto uno cuatro cero ocho, y tres punto uno cuatro dos nueve. Una aproximacion extraordinaria para su epoca, hecha completamente a mano." },
  @{ id = "arq08"; text = "Esta idea, acercarse a un valor exacto mediante una secuencia de pasos que se aproximan cada vez mas, sin necesariamente llegar nunca del todo en un numero finito de pasos, es, en esencia, la misma idea detras del concepto de limite." },
  @{ id = "arq09"; text = "Casi dos mil años despues, ese mismo concepto de limite se convertiria en la base formal del calculo diferencial e integral, desarrollado por Newton y Leibniz en el siglo diecisiete." },
  @{ id = "arq10"; text = "Por esto, muchos historiadores consideran a Arquimedes un precursor directo del calculo infinitesimal. Sin tener el lenguaje algebraico ni la notacion que si tuvieron Newton y Leibniz siglos despues, logro resultados que dependen exactamente del mismo tipo de razonamiento sobre acercarse al infinito." },
  @{ id = "arq11"; text = "Arquimedes tambien formalizo matematicamente la ley de la palanca: el equilibrio entre dos pesos depende del producto del peso por su distancia al punto de apoyo, no solo del peso en si." },
  @{ id = "arq12"; text = "Se le atribuye la frase, probablemente apocrifa, pero que capta bien su confianza en el poder de las matematicas aplicadas: dame un punto de apoyo, y movere el mundo." },
  @{ id = "arq13"; text = "Aplico estos principios a inventos reales: el tornillo de Arquimedes, todavia usado hoy para elevar agua, y maquinas de guerra que, segun los relatos, podian levantar barcos enemigos enteros, y que ayudaron a Siracusa a resistir el asedio romano durante mas de dos años." },
  @{ id = "arq14"; text = "Cuando Siracusa finalmente cayo ante Roma, en el año doscientos doce antes de nuestra era, un soldado romano encontro a Arquimedes, segun la tradicion, absorto dibujando figuras geometricas en la arena." },
  @{ id = "arq15"; text = "Se dice que sus ultimas palabras fueron: no molestes mis circulos. El soldado, sin reconocerlo, lo mato, a pesar de que el general romano Marcelo habia ordenado explicitamente respetar su vida. Con Arquimedes se cierra la epoca dorada de las matematicas griegas, pero su metodo, como el de Euclides, sigue vivo hasta hoy." }
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
