// ─────────────────────────────────────────────────────────────────────────────
// Registro de memes educativos — "Aprendiendo con Memes"
//
// Templates disponibles:
//   'drake'            → { rejects, approves }
//   'brain'            → { levels: [str×4] }
//   'this-is-fine'     → { caption }
//   'change-my-mind'   → { claim }
//   'surprised-pikachu'→ { setup, reaction }
//   'two-buttons'      → { button1, button2, context }
// ─────────────────────────────────────────────────────────────────────────────

export const MEME_CATEGORIES = [
  {
    id: 'psicologia',
    label: 'Psicología',
    emoji: '🧠',
    color: 'from-purple-500 to-violet-600',
    subcategories: [
      { id: 'psicoanalisis',  label: 'Psicoanálisis' },
      { id: 'conductismo',    label: 'Conductismo' },
      { id: 'cognitivo',      label: 'Psicología Cognitiva' },
    ],
  },
  {
    id: 'medicina',
    label: 'Medicina',
    emoji: '🏥',
    color: 'from-red-500 to-rose-600',
    subcategories: [
      { id: 'anatomia',       label: 'Anatomía' },
      { id: 'farmacologia',   label: 'Farmacología' },
    ],
  },
  {
    id: 'historia',
    label: 'Historia',
    emoji: '🏛️',
    color: 'from-amber-500 to-orange-600',
    subcategories: [
      { id: 'antigua',        label: 'Historia Antigua' },
      { id: 'moderna',        label: 'Historia Moderna' },
    ],
  },
  {
    id: 'matematicas',
    label: 'Matemáticas',
    emoji: '➗',
    color: 'from-blue-500 to-indigo-600',
    subcategories: [
      { id: 'algebra',        label: 'Álgebra' },
      { id: 'estadistica',    label: 'Estadística' },
    ],
  },
  {
    id: 'fisica',
    label: 'Física',
    emoji: '⚛️',
    color: 'from-cyan-500 to-sky-600',
    subcategories: [
      { id: 'mecanica',       label: 'Mecánica' },
      { id: 'relatividad',    label: 'Relatividad' },
    ],
  },
  {
    id: 'biologia',
    label: 'Biología',
    emoji: '🧬',
    color: 'from-green-500 to-emerald-600',
    subcategories: [
      { id: 'evolucion',      label: 'Evolución' },
      { id: 'genetica',       label: 'Genética' },
    ],
  },
  {
    id: 'tecnologia',
    label: 'Tecnología',
    emoji: '💻',
    color: 'from-slate-500 to-zinc-600',
    subcategories: [
      { id: 'programacion',   label: 'Programación' },
      { id: 'ia',             label: 'Inteligencia Artificial' },
    ],
  },
  {
    id: 'filosofia',
    label: 'Filosofía',
    emoji: '🎭',
    color: 'from-pink-500 to-fuchsia-600',
    subcategories: [
      { id: 'socrates-platon', label: 'Sócrates y Platón' },
      { id: 'existencialismo', label: 'Existencialismo' },
    ],
  },
]

export const MEMES = [

  // ── PSICOLOGÍA › PSICOANÁLISIS ────────────────────────────────────────────
  {
    id: 'psico-freud-1',
    category: 'psicologia', subcategory: 'psicoanalisis',
    template: 'drake',
    rejects: 'Admitir que actúo así por miedo al abandono',
    approves: 'Decir que «simplemente soy así»',
    explanation: 'Los mecanismos de defensa (negación, racionalización, proyección) son estrategias inconscientes que el Yo utiliza para reducir la ansiedad. Freud los identificó como "guardias" entre el inconsciente y la conciencia. Reconocerlos es el primer paso de la terapia psicoanalítica.',
  },
  {
    id: 'psico-freud-2',
    category: 'psicologia', subcategory: 'psicoanalisis',
    template: 'brain',
    levels: [
      'Me molestó porque me habló feo',
      'Me molestó porque tocó una inseguridad mía',
      'Mi reacción fue exagerada por experiencias de la infancia',
      'Estoy proyectando en él los patrones relacionales de mi figura paterna',
    ],
    explanation: 'La proyección es uno de los mecanismos de defensa más comunes: atribuimos a otros sentimientos o deseos propios que no aceptamos en nosotros mismos. Freud lo describió en 1911 como parte del proceso de formación del síntoma. Reconocerlo permite hacer trabajo interior genuino.',
  },
  {
    id: 'psico-freud-3',
    category: 'psicologia', subcategory: 'psicoanalisis',
    template: 'this-is-fine',
    caption: 'Yo con mis mecanismos de defensa impecables mientras mi inconsciente grita',
    explanation: 'El conflicto entre el consciente y el inconsciente es el núcleo de la teoría freudiana. Aquello que reprimimos no desaparece — se expresa de otras formas: sueños, lapsus, síntomas físicos o conductas repetitivas que no comprendemos racionalmente.',
  },

  // ── PSICOLOGÍA › CONDUCTISMO ──────────────────────────────────────────────
  {
    id: 'psico-pavlov-1',
    category: 'psicologia', subcategory: 'conductismo',
    template: 'surprised-pikachu',
    setup: 'Le pongo a mi perro comida cada vez que suena la campana. Al tiempo, el perro saliva solo con escuchar la campana — sin que haya comida.',
    reaction: '¡Pavlov al descubrir el condicionamiento clásico por accidente!',
    explanation: 'Ivan Pavlov descubrió el condicionamiento clásico mientras estudiaba la digestión en perros (1890s). El estímulo neutro (campana) se asocia con el estímulo incondicionado (comida) hasta provocar la misma respuesta por sí solo. Hoy es la base de terapias como la desensibilización sistemática.',
  },
  {
    id: 'psico-skinner-1',
    category: 'psicologia', subcategory: 'conductismo',
    template: 'drake',
    rejects: 'Memorizar la definición de «refuerzo positivo»',
    approves: 'Saber que cuando tu mamá te promete postre si comes verduras, eso ES refuerzo positivo',
    explanation: 'B.F. Skinner definió el refuerzo positivo como añadir un estímulo agradable tras una conducta para aumentar su frecuencia. El condicionamiento operante explica desde cómo aprendemos habilidades hasta por qué las redes sociales son adictivas (notificaciones = refuerzo variable).',
  },

  // ── PSICOLOGÍA › COGNITIVO ────────────────────────────────────────────────
  {
    id: 'psico-cognitivo-1',
    category: 'psicologia', subcategory: 'cognitivo',
    template: 'two-buttons',
    button1: 'Recordar lo que estudié para el examen de ayer',
    button2: 'Recordar la letra completa de una canción que escuché hace 10 años',
    context: 'Mi memoria a largo plazo eligiendo qué retener',
    explanation: 'La memoria a largo plazo es prácticamente ilimitada, pero la recuperación depende de la carga emocional, la repetición y el contexto. La información emocionalmente neutral y sin repetición (apuntes de la noche anterior) se olvida rápidamente por la curva del olvido de Ebbinghaus.',
  },
  {
    id: 'psico-cognitivo-2',
    category: 'psicologia', subcategory: 'cognitivo',
    template: 'change-my-mind',
    claim: 'Tu cerebro no "olvida" información — simplemente ya no puede recuperarla',
    explanation: 'La teoría de la interferencia (Müller & Pilzecker, 1900) propone que los recuerdos no desaparecen: son bloqueados por información similar. La teoría del decaimiento sugiere que sin uso, la traza mnésica se debilita. Ambas coexisten según el tipo de memoria y el tiempo transcurrido.',
  },

  // ── MEDICINA › ANATOMÍA ───────────────────────────────────────────────────
  {
    id: 'med-anat-1',
    category: 'medicina', subcategory: 'anatomia',
    template: 'drake',
    rejects: 'Llamar a los huesos «hueso del hombro» o «hueso de la rodilla»',
    approves: 'Usar Escápula, Clavícula y Rótula para confundir a todos en la sala de urgencias',
    explanation: 'La nomenclatura anatómica internacional (Terminologia Anatomica) está basada en latín y griego para garantizar comunicación precisa entre profesionales de todo el mundo, independientemente del idioma. La última edición de la TA fue publicada por FCAT en 1998.',
  },
  {
    id: 'med-anat-2',
    category: 'medicina', subcategory: 'anatomia',
    template: 'brain',
    levels: [
      'El corazón bombea sangre',
      'Tiene 4 cámaras: 2 aurículas y 2 ventrículos',
      'Gasto cardíaco = frecuencia cardíaca × volumen sistólico',
      'El potencial de acción del nodo sinoauricular inicia la despolarización que activa la sístole ventricular',
    ],
    explanation: 'El corazón es una bomba miogénica — genera su propio ritmo sin necesidad del sistema nervioso. El nodo sinoauricular (marcapasos natural) dispara ~70 veces/minuto. Las células de Purkinje distribuyen el impulso eléctrico para coordinar la contracción de ambos ventrículos simultáneamente.',
  },
  {
    id: 'med-anat-3',
    category: 'medicina', subcategory: 'anatomia',
    template: 'this-is-fine',
    caption: 'Yo estudiando los 11 sistemas del cuerpo humano la noche antes del examen de anatomía',
    explanation: 'El cuerpo humano tiene 11 sistemas principales: nervioso, endocrino, cardiovascular, linfático/inmune, respiratorio, digestivo, excretor, reproductor, muscular, esquelético e integumentario. Cada uno interactúa constantemente con los demás para mantener la homeostasis.',
  },

  // ── MEDICINA › FARMACOLOGÍA ───────────────────────────────────────────────
  {
    id: 'med-farma-1',
    category: 'medicina', subcategory: 'farmacologia',
    template: 'change-my-mind',
    claim: 'Todo fármaco es un veneno — solo depende de la dosis',
    explanation: 'Paracelso (siglo XVI) formuló el principio fundamental de la toxicología: «La diferencia entre un remedio y un veneno es la dosis» (Dosis sola facit venenum). El paracetamol en dosis terapéuticas alivia el dolor; en sobredosis, produce falla hepática. La ventana terapéutica define la dosis segura.',
  },
  {
    id: 'med-farma-2',
    category: 'medicina', subcategory: 'farmacologia',
    template: 'surprised-pikachu',
    setup: 'Alguien toma un antibiótico 3 días, se siente bien y deja el tratamiento porque «ya está curado».',
    reaction: 'Las bacterias resistentes que sobrevivieron y se reproducen libremente',
    explanation: 'La resistencia bacteriana es una de las mayores amenazas de salud pública del siglo XXI. Suspender el antibiótico antes de tiempo deja vivas las bacterias más resistentes, que se reproducen y transfieren esa resistencia. Completar el ciclo de tratamiento prescrito es fundamental.',
  },

  // ── HISTORIA › ANTIGUA ────────────────────────────────────────────────────
  {
    id: 'hist-ant-1',
    category: 'historia', subcategory: 'antigua',
    template: 'brain',
    levels: [
      'Los griegos inventaron la democracia',
      'Solo podían votar hombres libres adultos — ni mujeres, ni esclavos, ni extranjeros',
      'Atenas tenía ~30,000 ciudadanos con derechos en una población total de ~300,000',
      'La democracia representativa moderna es un invento ilustrado del siglo XVIII, no herencia directa de Atenas',
    ],
    explanation: 'La democracia ateniense del siglo V a.C. fue directa (los ciudadanos votaban personalmente) y excluyente. Solo el ~10% de la población tenía derechos políticos. La Ilustración (Locke, Rousseau, Montesquieu) reinventó la democracia con nuevos principios: derechos universales, separación de poderes y representación.',
  },
  {
    id: 'hist-ant-2',
    category: 'historia', subcategory: 'antigua',
    template: 'drake',
    rejects: '«Roma fue construida en un día»',
    approves: 'Roma tardó ~700 años en construirse — y menos de un siglo en desmoronarse',
    explanation: 'El Imperio Romano alcanzó su máxima extensión bajo Trajano (117 d.C.). Su decadencia fue gradual: crisis del siglo III, reformas de Diocleciano, división del Imperio (395 d.C.) y la caída del Imperio de Occidente (476 d.C.). Edward Gibbon estudió este proceso en su monumental obra «Historia de la decadencia y caída del Imperio Romano».',
  },

  // ── HISTORIA › MODERNA ────────────────────────────────────────────────────
  {
    id: 'hist-mod-1',
    category: 'historia', subcategory: 'moderna',
    template: 'two-buttons',
    button1: 'Aprender de los errores de la historia',
    button2: 'Repetir exactamente los mismos errores de la historia',
    context: 'La humanidad durante el siglo XX',
    explanation: 'George Santayana escribió en 1905: «Quien no recuerda el pasado está condenado a repetirlo». Las dos guerras mundiales, separadas por solo 21 años, compartieron causas estructurales: nacionalismos extremos, crisis económicas y liderazgos autoritarios. El estudio histórico busca romper ese ciclo.',
  },
  {
    id: 'hist-mod-2',
    category: 'historia', subcategory: 'moderna',
    template: 'this-is-fine',
    caption: 'Europa en julio de 1914: «Tranquilos, es solo una crisis diplomática menor»',
    explanation: 'El asesinato del Archiduque Francisco Fernando (28 junio 1914) desencadenó un sistema de alianzas que arrastró a toda Europa en semanas. Nadie previó que la guerra duraría 4 años y costaría ~20 millones de vidas. La «certeza» de una guerra corta fue uno de los errores de cálculo más costosos de la historia.',
  },

  // ── MATEMÁTICAS › ÁLGEBRA ────────────────────────────────────────────────
  {
    id: 'mat-alg-1',
    category: 'matematicas', subcategory: 'algebra',
    template: 'drake',
    rejects: 'Entender para qué sirve la X en la vida real',
    approves: 'Saber que la X solo sirve para encontrar más letras',
    explanation: 'El álgebra fue sistematizada por Al-Juarismi en el siglo IX (su libro «Al-kitab al-mukhtasar fi hisab al-jabr wal-muqabala» dio nombre al álgebra). La «x» como variable fue popularizada por Descartes en 1637. Hoy el álgebra lineal es la base del machine learning, gráficos 3D y criptografía.',
  },
  {
    id: 'mat-alg-2',
    category: 'matematicas', subcategory: 'algebra',
    template: 'change-my-mind',
    claim: 'El álgebra es aritmética con letras, el cálculo es álgebra con límites, y la topología es cálculo sin números',
    explanation: 'Las matemáticas son una estructura jerárquica de abstracción creciente. Cada nivel reutiliza el anterior: la aritmética describe cantidades, el álgebra generaliza patrones, el cálculo analiza cambio y el análisis real formaliza todo con rigor lógico. La topología estudia propiedades que sobreviven deformaciones continuas.',
  },

  // ── MATEMÁTICAS › ESTADÍSTICA ────────────────────────────────────────────
  {
    id: 'mat-est-1',
    category: 'matematicas', subcategory: 'estadistica',
    template: 'surprised-pikachu',
    setup: 'Encuesta con 10 personas: «El 70% prefiere chocolate». El periodista generaliza: «La mayoría de los humanos prefiere chocolate».',
    reaction: 'Estadísticos en todo el mundo',
    explanation: 'Con n=10 y 95% de confianza, el margen de error es de ±31 puntos porcentuales. Para una muestra representativa de una ciudad de 1 millón de personas con ±3% de error, se necesitan ~1,067 encuestados — el tamaño de la población importa mucho menos de lo que la gente cree.',
  },
  {
    id: 'mat-est-2',
    category: 'matematicas', subcategory: 'estadistica',
    template: 'brain',
    levels: [
      'El promedio de mi clase es 7.5',
      'Pero la mediana es 6.0 — dos estudiantes sacaron 10 y sesgan el promedio',
      'La distribución está sesgada a la derecha — hay valores atípicos (outliers)',
      'Necesito la moda, no el promedio, para entender el rendimiento más frecuente',
    ],
    explanation: 'La media aritmética es sensible a valores extremos. Cuando una distribución tiene sesgo (datos no simétricos), la mediana describe mejor el «centro típico». Los economistas usan mediana de ingresos por esta razón: unos pocos multimillonarios elevan la media sin representar a la mayoría.',
  },

  // ── FÍSICA › MECÁNICA ────────────────────────────────────────────────────
  {
    id: 'fis-mec-1',
    category: 'fisica', subcategory: 'mecanica',
    template: 'drake',
    rejects: '«Si suelto una pluma y una bola de boliche, la bola cae primero»',
    approves: 'En el vacío, ambos caen exactamente igual — Galileo lo demostró en el siglo XVII',
    explanation: 'Galileo refutó a Aristóteles experimentalmente: sin resistencia del aire, todos los objetos caen con la misma aceleración gravitacional (g ≈ 9.8 m/s²) independientemente de su masa. La NASA lo reprodujo en la Luna en 1971 soltando un martillo y una pluma — cayeron juntos.',
  },
  {
    id: 'fis-mec-2',
    category: 'fisica', subcategory: 'mecanica',
    template: 'this-is-fine',
    caption: 'Yo empujando la pared con «toda mi fuerza» sin entender que la pared me empuja con la misma fuerza (3.ª Ley de Newton)',
    explanation: 'La Tercera Ley de Newton (acción-reacción) dice que las fuerzas siempre aparecen en pares iguales y opuestos entre DOS cuerpos distintos. Cuando empujas la pared, la pared te empuja a ti. No se «cancelan» porque actúan sobre cuerpos diferentes. Por eso puedes avanzar al empujar el suelo hacia atrás.',
  },

  // ── FÍSICA › RELATIVIDAD ─────────────────────────────────────────────────
  {
    id: 'fis-rel-1',
    category: 'fisica', subcategory: 'relatividad',
    template: 'brain',
    levels: [
      'El tiempo pasa igual para todos',
      'El tiempo pasa más lento si vas muy rápido (dilatación temporal)',
      'Los satélites GPS deben corregir su reloj por relatividad especial Y general',
      'El espacio-tiempo es una «tela» 4D que la masa curva — el tiempo es una dimensión física real',
    ],
    explanation: 'Einstein publicó la Relatividad Especial en 1905 y la General en 1915. Los satélites GPS sin corrección relativista acumularían ~10 km de error al día: los relojes en órbita corren ~38 microsegundos/día más rápido (relatividad general, menos gravedad) y ~7 μs/día más lento (velocidad orbital). La corrección es imprescindible.',
  },

  // ── BIOLOGÍA › EVOLUCIÓN ─────────────────────────────────────────────────
  {
    id: 'bio-evol-1',
    category: 'biologia', subcategory: 'evolucion',
    template: 'change-my-mind',
    claim: '«Los humanos descendemos del mono» es incorrecto — compartimos un ancestro común que ya no existe',
    explanation: 'La evolución es un proceso de bifurcación, no una escalera. Chimpancés y humanos compartimos un ancestro común hace ~6-7 millones de años. Ese ancestro no era un mono moderno. Los chimpancés y nosotros somos «primos» que evolucionamos por caminos separados desde ese punto común. Darwin lo ilustró con el «árbol de la vida».',
  },
  {
    id: 'bio-evol-2',
    category: 'biologia', subcategory: 'evolucion',
    template: 'drake',
    rejects: '«El ojo es demasiado complejo para haber evolucionado»',
    approves: 'El ojo evolucionó de forma independiente más de 40 veces en distintos linajes — la evolución «descubrió» la misma solución múltiples veces',
    explanation: 'La evolución convergente muestra que ciertas estructuras son tan eficientes que la selección natural las «reinventa» de forma independiente. El ojo del pulpo y el del vertebrado son anatómicamente similares pero con retinas invertidas de forma opuesta — misma función, origen evolutivo completamente distinto.',
  },

  // ── BIOLOGÍA › GENÉTICA ───────────────────────────────────────────────────
  {
    id: 'bio-gen-1',
    category: 'biologia', subcategory: 'genetica',
    template: 'surprised-pikachu',
    setup: 'Padres con ojos azules esperan un hijo con ojos azules — nace con ojos marrones.',
    reaction: 'Gregor Mendel mirando desde el cielo con sus guisantes',
    explanation: 'El color de ojos NO es un rasgo simple (dominante/recesivo de Mendel). Es poligénico, controlado principalmente por OCA2 y HERC2. Una persona con ojos azules puede portar variantes que permiten ojos marrones en sus hijos si el otro progenitor aporta los alelos correctos. Mendel trabajó con rasgos simples — la realidad es más compleja.',
  },
  {
    id: 'bio-gen-2',
    category: 'biologia', subcategory: 'genetica',
    template: 'two-buttons',
    button1: 'Echarle la culpa a mi genética de todo lo que me pasa',
    button2: 'Entender que el ambiente modifica la expresión de mis genes (epigenética)',
    context: 'Yo aprendiendo genética por primera vez',
    explanation: 'La epigenética estudia cambios en la expresión génica que no alteran la secuencia de ADN. El estrés, la dieta y el ejercicio pueden «encender o apagar» genes mediante metilación del ADN o modificación de histonas. Algunos de estos cambios epigenéticos pueden incluso heredarse — el debate nature vs. nurture es mucho más complejo de lo que parecía.',
  },

  // ── TECNOLOGÍA › PROGRAMACIÓN ─────────────────────────────────────────────
  {
    id: 'tec-prog-1',
    category: 'tecnologia', subcategory: 'programacion',
    template: 'brain',
    levels: [
      '«Hello, World!» — ¡funciona!',
      'Un loop que no termina nunca',
      'Un bug que desaparece cuando abres el depurador',
      'Llevas 3 horas buscando el error — faltaba un punto y coma',
    ],
    explanation: 'El debugging es una habilidad central en programación. El «bug» que desaparece al depurar suele ser un race condition o un problema de timing. Los errores de sintaxis más simples (punto y coma, paréntesis, comillas) consumen desproporcionadamente más tiempo del esperado — por eso los linters y los IDEs modernos son tan valiosos.',
  },
  {
    id: 'tec-prog-2',
    category: 'tecnologia', subcategory: 'programacion',
    template: 'this-is-fine',
    caption: 'Mi código corriendo en producción con los warnings en rojo que ignoré en desarrollo',
    explanation: 'Los warnings del compilador/intérprete son futuros errores en producción. Ignorarlos es una forma de deuda técnica: el código «funciona ahora» pero es frágil. La diferencia entre un warning y un error es solo cuestión de contexto — en un edge case el warning se convierte en crash. «Never ignore a warning» es el primer consejo de todo equipo de ingeniería experimentado.',
  },

  // ── TECNOLOGÍA › INTELIGENCIA ARTIFICIAL ─────────────────────────────────
  {
    id: 'tec-ia-1',
    category: 'tecnologia', subcategory: 'ia',
    template: 'drake',
    rejects: '«La IA tiene conciencia propia y siente emociones»',
    approves: 'La IA actual es una función matemática muy sofisticada que predice el siguiente token más probable',
    explanation: 'Los modelos de lenguaje grandes (LLMs) son redes neuronales entrenadas para predecir texto. No «entienden» en el sentido humano — calculan distribuciones de probabilidad sobre vocabularios de decenas de miles de tokens. La impresión de conciencia surge de que fueron entrenados con texto humano, que sí refleja pensamiento consciente.',
  },
  {
    id: 'tec-ia-2',
    category: 'tecnologia', subcategory: 'ia',
    template: 'brain',
    levels: [
      'La IA va a quitarles el trabajo a todos',
      'La IA automatiza tareas específicas, no trabajos completos',
      'Cada revolución tecnológica destruye trabajos y crea otros nuevos — siempre ha sido así',
      'La pregunta no es si habrá trabajo, sino quién tendrá las habilidades para los nuevos trabajos',
    ],
    explanation: 'El economista David Ricardo ya predijo la «desocupación tecnológica» en 1821. La imprenta, la electricidad y la computación eliminaron millones de empleos y crearon muchos más. El McKinsey Global Institute estima que el 60% de los empleos actuales tienen al menos el 30% de sus tareas automatizables — pero la automatización total de un rol complejo sigue siendo excepcional.',
  },

  // ── FILOSOFÍA › SÓCRATES Y PLATÓN ────────────────────────────────────────
  {
    id: 'fil-socr-1',
    category: 'filosofia', subcategory: 'socrates-platon',
    template: 'change-my-mind',
    claim: 'Todo lo que ves, tocas y escuchas es solo una sombra imperfecta de la realidad verdadera',
    explanation: 'La Alegoría de la Caverna (Platón, República Libro VII, ~380 a.C.) describe prisioneros que solo conocen sombras proyectadas en una pared y las toman por realidad. El filósofo que sale de la cueva y ve el sol representa al que accede al mundo de las Ideas — la verdadera realidad inteligible, perfecta e inmutable, de la que el mundo sensible es solo copia imperfecta.',
  },
  {
    id: 'fil-socr-2',
    category: 'filosofia', subcategory: 'socrates-platon',
    template: 'surprised-pikachu',
    setup: 'Sócrates pasó su vida diciendo «Solo sé que nada sé» — y haciendo preguntas incómodas a todos los ciudadanos importantes de Atenas.',
    reaction: 'El tribunal ateniense al condenarlo a muerte por «corromper a la juventud» (399 a.C.)',
    explanation: 'El método socrático (mayéutica) consiste en hacer preguntas para ayudar al interlocutor a descubrir la verdad por sí mismo, igual que una partera ayuda al nacimiento. Sócrates no dejó escritos — todo lo sabemos por Platón. Su condena ilustra la tensión eterna entre el pensamiento crítico y el poder establecido.',
  },

  // ── FILOSOFÍA › EXISTENCIALISMO ───────────────────────────────────────────
  {
    id: 'fil-exist-1',
    category: 'filosofia', subcategory: 'existencialismo',
    template: 'brain',
    levels: [
      'La vida no tiene sentido — eso me deprime',
      'La vida no tiene sentido — entonces tengo que crear el mío',
      'La angustia existencial es la señal de que soy libre; sin libertad, no hay angustia',
      'Estoy «condenado a ser libre» (Sartre) — cada decisión que tomo define lo que soy',
    ],
    explanation: 'El existencialismo (Kierkegaard, Nietzsche, Heidegger, Sartre, Camus) parte de «la existencia precede a la esencia»: no nacemos con un propósito fijo — lo construimos con nuestras elecciones. Sartre argumentó que la libertad radical es ineludible: incluso no elegir es una elección. Camus propuso el «absurdo» como respuesta: vivir plenamente a pesar de la falta de sentido inherente.',
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getCategoryById(catId) {
  return MEME_CATEGORIES.find((c) => c.id === catId)
}

export function getMemesBySubcategory(catId, subcatId) {
  return MEMES.filter((m) => m.category === catId && m.subcategory === subcatId)
}

export function getMemeById(id) {
  return MEMES.find((m) => m.id === id)
}
