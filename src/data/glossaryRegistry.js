// "Segundo cerebro" de Oliver Academy: un glosario/wiki compartido por TODOS
// los cursos. Los módulos de curso enlazan aquí para personajes, lugares y
// conceptos que merecen contexto extra sin inflar el contenido de la clase
// misma — ver GlossaryPage.jsx (/cerebro/:slug) y GlossaryIndexPage (/cerebro).
//
// Convención para enlazar desde el HTML de un módulo (TextLesson.jsx):
//   <a class="wiki-link" href="/cerebro/socrates" target="_blank" rel="noopener">Sócrates</a>
// target="_blank" es deliberado: abre en pestaña nueva para no perder el
// progreso/scroll del curso. Usa el helper `wiki()` exportado abajo.

const c = (html) => html

export const GLOSSARY = [
  {
    slug: 'sumerios',
    term: 'Sumerios',
    icon: '📜',
    category: 'Historia',
    summary: 'El pueblo del sur de Mesopotamia que creó la primera civilización urbana conocida, hacia el 4500 a.C.',
    content: c(`<p>Los <strong>sumerios</strong> se asentaron en el sur de Mesopotamia (el actual Irak) entre los ríos Tigris y Éufrates. No se sabe con certeza de dónde vinieron ni a qué familia lingüística pertenece su idioma — el sumerio es una "lengua aislada", sin parientes conocidos.</p><p>Fundaron ciudades-estado independientes como Uruk, Ur, Eridu y Lagash, cada una con su propio gobernante y templo principal. Se les atribuye la invención de la escritura, la rueda, el primer código de leyes conocido y el sistema sexagesimal que todavía usamos para medir el tiempo.</p>`),
  },
  {
    slug: 'mesopotamia',
    term: 'Mesopotamia',
    icon: '🌊',
    category: 'Historia',
    summary: 'La región entre los ríos Tigris y Éufrates ("entre ríos" en griego), cuna de varias de las primeras civilizaciones del mundo.',
    content: c(`<p><strong>Mesopotamia</strong> significa "tierra entre ríos" en griego, refiriéndose al Tigris y el Éufrates. Su suelo fértil, renovado cada año por las crecidas de los ríos, permitió una agricultura tan productiva que generó excedentes de comida — la base económica que hizo posibles las primeras ciudades.</p><p>A lo largo de miles de años, la región fue hogar de los sumerios, acadios, babilonios y asirios, cada uno construyendo sobre el legado del anterior.</p>`),
  },
  {
    slug: 'cuneiforme',
    term: 'Escritura cuneiforme',
    icon: '🔺',
    category: 'Historia',
    summary: 'El primer sistema de escritura conocido, inventado por los sumerios usando marcas en forma de cuña sobre tablillas de arcilla húmeda.',
    content: c(`<p>La <strong>escritura cuneiforme</strong> ("cuneiforme" viene del latín <em>cuneus</em>, "cuña") nació en Uruk hacia el 3200 a.C. Los escribas presionaban un punzón de caña sobre tablillas de arcilla húmeda, dejando marcas en forma de cuña. Las tablillas luego se secaban al sol o se cocían, algunas sobreviviendo intactas más de 5000 años.</p><p>Empezó como un sistema de pictogramas para llevar cuentas de granos y ganado — contabilidad, no literatura. Con el tiempo evolucionó hasta poder representar sonidos y expresar ideas abstractas, poesía y leyes.</p>`),
  },
  {
    slug: 'uruk',
    term: 'Uruk',
    icon: '🏙️',
    category: 'Historia',
    summary: 'Una de las primeras y más grandes ciudades sumerias, cuna de la escritura y hogar legendario del rey Gilgamesh.',
    content: c(`<p><strong>Uruk</strong> llegó a tener, según estimaciones arqueológicas, entre 40,000 y 80,000 habitantes hacia el 2900 a.C. — un tamaño sin precedentes para la época. Estaba rodeada por murallas que la tradición atribuye al propio Gilgamesh.</p><p>Es el lugar donde aparecen las tablillas de escritura más antiguas conocidas, y da nombre al "período de Uruk" en el que la sociedad sumeria pasó de aldeas agrícolas a verdaderas ciudades con gobierno, templos y especialización laboral.</p>`),
  },
  {
    slug: 'gilgamesh',
    term: 'Gilgamesh',
    icon: '👑',
    category: 'Historia',
    summary: 'Rey histórico de Uruk (hacia 2700 a.C.) convertido en héroe legendario del poema épico más antiguo que se conserva.',
    content: c(`<p><strong>Gilgamesh</strong> fue, según listas reales sumerias, un rey real de Uruk hacia el 2700 a.C. Con el tiempo su figura se transformó en leyenda, protagonista de la <em>Epopeya de Gilgamesh</em> — considerada la obra literaria narrativa más antigua que se conserva.</p><p>El poema narra su amistad con Enkidu, su búsqueda de la inmortalidad tras la muerte de su amigo, y un relato de un diluvio universal que guarda paralelismos notables con el de Noé, escrito siglos después.</p>`),
  },
  {
    slug: 'enheduanna',
    term: 'Enheduanna',
    icon: '✍️',
    category: 'Historia',
    summary: 'Sacerdotisa sumeria-acadia (hacia 2285-2250 a.C.), la primera autora de la historia conocida por su nombre.',
    content: c(`<p><strong>Enheduanna</strong> fue hija del rey Sargón de Acad y suma sacerdotisa del dios lunar Nanna en la ciudad de Ur. Escribió himnos y poemas que firmó con su propio nombre — por eso se le considera la primera persona autora conocida en toda la historia de la escritura, hombre o mujer.</p><p>Sus himnos a la diosa Inanna se siguieron copiando y estudiando en escuelas de escribas durante siglos después de su muerte.</p>`),
  },
  {
    slug: 'zigurat',
    term: 'Zigurat',
    icon: '🏗️',
    category: 'Historia',
    summary: 'Templo escalonado en forma de pirámide truncada, el edificio religioso central de cada ciudad sumeria.',
    content: c(`<p>Un <strong>zigurat</strong> es una estructura religiosa en forma de pirámide escalonada, hecha de ladrillos de adobe, con un templo en la cima dedicado al dios patrono de la ciudad. Funcionaba como el centro administrativo, económico y religioso de la ciudad-estado.</p><p>El más conocido y mejor conservado es el Zigurat de Ur, construido hacia el 2100 a.C. y todavía parcialmente en pie hoy en Irak.</p>`),
  },
  {
    slug: 'codigo-ur-nammu',
    term: 'Código de Ur-Nammu',
    icon: '⚖️',
    category: 'Historia',
    summary: 'El código de leyes escrito más antiguo conocido, unos 300 años anterior al famoso Código de Hammurabi.',
    content: c(`<p>El <strong>Código de Ur-Nammu</strong> fue promulgado por el rey de Ur del mismo nombre hacia el 2100-2050 a.C. — casi tres siglos antes del más famoso Código de Hammurabi. Es el código de leyes escrito más antiguo que se conoce.</p><p>A diferencia de la "ley del talión" (ojo por ojo) que popularizaría Hammurabi después, muchas de sus penas eran compensaciones económicas: por ejemplo, cortar el pie de otra persona se pagaba con una multa de plata, no con la mutilación del agresor.</p>`),
  },
  {
    slug: 'sistema-sexagesimal',
    term: 'Sistema sexagesimal',
    icon: '🕐',
    category: 'Historia',
    summary: 'El sistema numérico en base 60 inventado por los sumerios — la razón por la que una hora tiene 60 minutos y un círculo 360 grados.',
    content: c(`<p>Los sumerios contaban en <strong>base 60</strong> (sexagesimal) en vez de base 10 como nosotros. El 60 tiene la ventaja práctica de dividirse exactamente entre 2, 3, 4, 5, 6, 10, 12, 15, 20 y 30 — mucho más versátil para repartir cosas que el 10, que solo se divide exacto entre 2 y 5.</p><p>Ese sistema sobrevive hasta hoy en las unidades que usas todos los días: 60 segundos por minuto, 60 minutos por hora, y 360 (60×6) grados en un círculo completo.</p>`),
  },

  // ── Medicina ──────────────────────────────────────────────────────────
  {
    slug: 'imhotep',
    term: 'Imhotep',
    icon: '⚕️',
    category: 'Medicina',
    summary: 'Arquitecto, sacerdote y el primer médico de la historia identificado por su nombre real (c. 2650 a.C.).',
    content: c(`<p><strong>Imhotep</strong> vivió en el antiguo Egipto hacia el 2650 a.C., durante el reinado del faraón Zoser, a quien sirvió como canciller, arquitecto y sacerdote además de médico. Se le atribuye el diseño de la pirámide escalonada de Saqqara, una de las primeras grandes estructuras de piedra de la historia.</p><p>Siglos después de su muerte, los egipcios lo veneraron como una deidad asociada a la medicina y la sanación. Es, hasta donde se sabe, el primer médico de la historia identificado por su nombre real y no por leyenda anónima.</p>`),
  },
  {
    slug: 'papiro-edwin-smith',
    term: 'Papiro de Edwin Smith',
    icon: '📜',
    category: 'Medicina',
    summary: 'Texto médico egipcio (c. 1600 a.C.) con 48 casos quirúrgicos descritos con observación clínica, casi sin magia.',
    content: c(`<p>El <strong>Papiro de Edwin Smith</strong>, escrito hacia 1600 a.C. como copia de un texto aún más antiguo, describe 48 casos quirúrgicos reales, cada uno con la misma estructura: examen, diagnóstico y tratamiento (o el reconocimiento honesto de que el caso no tenía cura).</p><p>Es notable porque, a diferencia de la mayoría de los textos médicos del mundo antiguo, describe los casos con observación clínica casi pura, sin conjuros ni explicaciones religiosas — evidencia de que el método de "observar, registrar, tratar" ya existía hace 3600 años. Lleva el nombre del egiptólogo que lo adquirió en 1862, no de su autor original.</p>`),
  },
  {
    slug: 'hipocrates',
    term: 'Hipócrates',
    icon: '⚕️',
    category: 'Medicina',
    summary: 'Médico griego (460–370 a.C.) que afirmó que la enfermedad tiene causas naturales, no divinas. Origen del "primero, no dañar".',
    content: c(`<p><strong>Hipócrates de Cos</strong> (460–370 a.C.) es considerado el padre de la medicina occidental. Su aporte central fue afirmar que las enfermedades tienen causas naturales — desequilibrios del cuerpo, el clima, la dieta — y no son castigo de los dioses.</p><p>El "Corpus Hipocrático" reúne unos 60 textos médicos de su escuela. De esa tradición nace el <strong>Juramento Hipocrático</strong> y el principio "Primum non nocere" (primero, no dañar), todavía citado en códigos de ética médica de todo el mundo, 2400 años después.</p>`),
  },
  {
    slug: 'galeno',
    term: 'Galeno',
    icon: '⚕️',
    category: 'Medicina',
    summary: 'Médico más influyente de la historia occidental durante 1400 años (129–216 d.C.), autoridad indiscutida a pesar de errores anatómicos.',
    content: c(`<p><strong>Galeno de Pérgamo</strong> (129–216 d.C.) trabajó como médico de gladiadores en Roma, una fuente única de experiencia práctica con heridas y anatomía humana real. Sus escritos dominaron la medicina occidental durante más de 1400 años.</p><p>Como la disección de cadáveres humanos estaba prohibida en su época, diseccionó animales (cerdos, monos) y asumió que su anatomía se aplicaba a los humanos, equivocándose en más de 200 puntos — por ejemplo, describió el hígado humano con cinco lóbulos, como el de un cerdo. Su autoridad era tan absoluta que cuestionarlo se consideraba casi herejía intelectual, hasta que <a class="wiki-link" href="/cerebro/vesalio" target="_blank" rel="noopener">Vesalio</a> lo desafió con disecciones humanas reales.</p>`),
  },
  {
    slug: 'avicena',
    term: 'Avicena (Ibn Sina)',
    icon: '📖',
    category: 'Medicina',
    summary: 'Médico persa (980–1037), autor del Canon de Medicina, libro de texto médico usado en Europa hasta el siglo XVII.',
    content: c(`<p><strong>Avicena</strong> (Ibn Sina, 980–1037) escribió el <strong>Canon de Medicina</strong>, una enciclopedia médica tan completa y organizada que fue el libro de texto principal en universidades europeas hasta el siglo XVII — más de 600 años de vigencia.</p><p>Formó parte de una época dorada de la medicina en el mundo islámico medieval, que también inventó el hospital como institución organizada (con salas por tipo de enfermedad y registros de pacientes), siglos antes que la mayoría de las ciudades europeas.</p>`),
  },
  {
    slug: 'vesalio',
    term: 'Andrés Vesalio',
    icon: '🔬',
    category: 'Medicina',
    summary: 'Anatomista (1514–1564) que diseccionó cadáveres humanos reales y corrigió más de 200 errores de Galeno.',
    content: c(`<p><strong>Andrés Vesalio</strong> (1514–1564) se arriesgó a diseccionar cadáveres humanos reales — algo visto con sospecha por la Iglesia de su época — en vez de confiar en la anatomía animal que <a class="wiki-link" href="/cerebro/galeno" target="_blank" rel="noopener">Galeno</a> había extrapolado a los humanos 1400 años antes.</p><p>Publicó "De humani corporis fabrica" (1543), con ilustraciones anatómicas tan precisas y detalladas que demostraron más de 200 errores en la anatomía descrita por Galeno. Es considerado el fundador de la anatomía moderna.</p>`),
  },
  {
    slug: 'william-harvey',
    term: 'William Harvey',
    icon: '🫀',
    category: 'Medicina',
    summary: 'Médico inglés (1578–1657) que demostró matemáticamente que la sangre circula en un sistema cerrado bombeado por el corazón.',
    content: c(`<p><strong>William Harvey</strong> (1578–1657) refutó de un golpe 1400 años de creencia médica: calculó cuánta sangre bombea el corazón en una hora, y el resultado superaba el peso corporal total de una persona — así que el hígado no podía estar fabricando sangre nueva constantemente, como se creía desde Galeno.</p><p>Publicó su descubrimiento en 1628: el corazón es una bomba y la misma sangre circula en un circuito cerrado. Lo logró con matemáticas simples y razonamiento lógico, sin tecnología avanzada.</p>`),
  },
  {
    slug: 'van-leeuwenhoek',
    term: 'Antonie van Leeuwenhoek',
    icon: '🔬',
    category: 'Medicina',
    summary: 'Comerciante de telas holandés (1632–1723) sin formación científica, primer humano en ver bacterias con un microscopio casero.',
    content: c(`<p><strong>Antonie van Leeuwenhoek</strong> (1632–1723) era comerciante de telas en Holanda. Aprendió a pulir lentes de vidrio con precisión excepcional para examinar hilos, y con sus microscopios caseros (algunos con más de 270 aumentos) empezó a mirar agua de charco, placa dental y otras muestras.</p><p>En 1676 vio diminutos seres moviéndose — los llamó "animáculos". Había descubierto lo que hoy llamamos bacterias y protozoos, el primer ser humano en verlos. Nadie, ni él mismo, sabría por casi 200 años más que algunos de esos seres causaban enfermedades.</p>`),
  },
  {
    slug: 'edward-jenner',
    term: 'Edward Jenner',
    icon: '💉',
    category: 'Medicina',
    summary: 'Médico inglés (1749–1823) que creó la primera vacuna de la historia, basada en la viruela bovina, en 1796.',
    content: c(`<p><strong>Edward Jenner</strong> (1749–1823) probó con método científico una observación popular entre granjeros: las ordeñadoras contagiadas de viruela bovina (leve) casi nunca se enfermaban de viruela humana (mortal).</p><p>En 1796 inoculó a un niño con material de viruela bovina y después lo expuso deliberadamente a la viruela humana — el niño no se enfermó. Llamó a su técnica "vacunación" (de "vacca", vaca en latín). Gracias a campañas de vacunación masiva, la viruela fue declarada erradicada en 1980 — la única enfermedad humana eliminada por completo del planeta.</p>`),
  },
  {
    slug: 'semmelweis',
    term: 'Ignaz Semmelweis',
    icon: '🧼',
    category: 'Medicina',
    summary: 'Médico húngaro (1818–1865) que redujo la mortalidad materna 10 veces con lavado de manos — y fue ridiculizado por ello.',
    content: c(`<p><strong>Ignaz Semmelweis</strong> (1818–1865) notó que, en el Hospital General de Viena, los médicos que llegaban de hacer autopsias sin lavarse las manos a atender partos tenían una sala con hasta 10% de mortalidad materna, contra 1-2% en la sala atendida por parteras.</p><p>Propuso lavarse las manos con una solución de cloro antes de cada parto — la mortalidad cayó de inmediato a menos del 1%. Aun así, la comunidad médica se negó a aceptarlo, lo ridiculizó, y terminó internado en un asilo donde murió a los 47 años. Hoy es considerado un pionero de la higiene hospitalaria.</p>`),
  },
  {
    slug: 'pasteur',
    term: 'Louis Pasteur',
    icon: '🧪',
    category: 'Medicina',
    summary: 'Químico y microbiólogo francés (1822–1895) que refutó la generación espontánea y sentó las bases de la teoría germinal.',
    content: c(`<p><strong>Louis Pasteur</strong> (1822–1895) diseñó frascos de "cuello de cisne" que demostraron que los microorganismos vienen del aire exterior, no surgen espontáneamente de la materia — acabando con siglos de creencia en la generación espontánea.</p><p>Conectó lo que <a class="wiki-link" href="/cerebro/van-leeuwenhoek" target="_blank" rel="noopener">Van Leeuwenhoek</a> había visto (microorganismos) con lo que causaba enfermedades: identificó gérmenes causantes del cólera de gallinas y desarrolló una vacuna contra la rabia. Su trabajo dio origen a la teoría germinal de la enfermedad.</p>`),
  },
  {
    slug: 'koch',
    term: 'Robert Koch',
    icon: '🔬',
    category: 'Medicina',
    summary: 'Médico alemán (1843–1910) que estableció el método riguroso para probar qué germen causa qué enfermedad.',
    content: c(`<p><strong>Robert Koch</strong> (1843–1910) resolvió un problema que <a class="wiki-link" href="/cerebro/pasteur" target="_blank" rel="noopener">Pasteur</a> había dejado abierto: cómo probar rigurosamente que un germen específico causa una enfermedad específica. Estableció cuatro criterios (los "postulados de Koch") que se usan como estándar hasta hoy.</p><p>Con este método identificó los agentes causantes de la tuberculosis (1882) y el cólera (1883), enfermedades que mataban a millones sin que nadie supiera exactamente por qué.</p>`),
  },
  {
    slug: 'lister',
    term: 'Joseph Lister',
    icon: '🩹',
    category: 'Medicina',
    summary: 'Cirujano inglés (1827–1912) que introdujo antisépticos en cirugía, reduciendo drásticamente las infecciones postoperatorias.',
    content: c(`<p>Antes de <strong>Joseph Lister</strong> (1827–1912), sobrevivir a una cirugía dependía en buena parte de la suerte — no por el corte en sí, sino por las infecciones posteriores, que mataban hasta al 50% de los pacientes de cirugía mayor en algunos hospitales.</p><p>Lister aplicó la teoría germinal de <a class="wiki-link" href="/cerebro/pasteur" target="_blank" rel="noopener">Pasteur</a> a la sala de operaciones: usó ácido carbólico para esterilizar instrumentos, heridas y hasta el aire del quirófano. La mortalidad postoperatoria cayó dramáticamente, sentando las bases de la cirugía moderna.</p>`),
  },
  {
    slug: 'florence-nightingale',
    term: 'Florence Nightingale',
    icon: '📊',
    category: 'Medicina',
    summary: 'Enfermera británica (1820–1910) que usó estadística visual para reformar la sanidad militar y fundó la enfermería moderna.',
    content: c(`<p><strong>Florence Nightingale</strong> (1820–1910) llegó a los hospitales militares británicos durante la Guerra de Crimea y encontró condiciones higiénicas espantosas. En vez de solo denunciarlo, recolectó datos meticulosamente y los presentó en gráficas visuales (una versión propia del diagrama de área polar).</p><p>Sus gráficas demostraron que más soldados morían de infecciones hospitalarias evitables que de heridas de combate, convenciendo al gobierno británico de reformar la sanidad militar. Fundó la primera escuela de enfermería basada en principios científicos.</p>`),
  },
  {
    slug: 'fleming',
    term: 'Alexander Fleming',
    icon: '🧫',
    category: 'Medicina',
    summary: 'Bacteriólogo escocés (1881–1955) que descubrió la penicilina por accidente en 1928, dando origen a los antibióticos.',
    content: c(`<p><strong>Alexander Fleming</strong> (1881–1955) dejó una placa de cultivo con bacterias sin lavar antes de irse de vacaciones en 1928. Al volver, notó que un hongo (<em>Penicillium</em>) había contaminado la placa, y las bacterias cercanas a él habían muerto.</p><p>Identificó que el hongo producía una sustancia — la penicilina — capaz de matar bacterias sin dañar células humanas. Howard Florey y Ernst Chain lograron producirla en masa en los años 40, justo a tiempo para la Segunda Guerra Mundial. Se estima que la penicilina y los antibióticos posteriores han salvado más de 200 millones de vidas.</p>`),
  },
  {
    slug: 'watson-crick',
    term: 'Watson y Crick',
    icon: '🧬',
    category: 'Medicina',
    summary: 'James Watson y Francis Crick publicaron en 1953 el modelo de la doble hélice del ADN.',
    content: c(`<p><strong>James Watson</strong> y <strong>Francis Crick</strong> publicaron en 1953 el modelo de la estructura del ADN: una doble hélice, dos cadenas entrelazadas que explicaba cómo la información genética se copia y se transmite.</p><p>Su modelo se basó de forma crucial en la "Fotografía 51", una imagen de difracción de rayos X tomada por <a class="wiki-link" href="/cerebro/rosalind-franklin" target="_blank" rel="noopener">Rosalind Franklin</a>, vista sin su permiso explícito a través de un colega. Watson, Crick y Maurice Wilkins recibieron el Premio Nobel en 1962.</p>`),
  },
  {
    slug: 'rosalind-franklin',
    term: 'Rosalind Franklin',
    icon: '🧬',
    category: 'Medicina',
    summary: 'Científica británica (1920–1958) cuya "Fotografía 51" fue clave para descubrir la estructura del ADN, sin recibir crédito en su momento.',
    content: c(`<p><strong>Rosalind Franklin</strong> (1920–1958) tomó, junto a su estudiante Raymond Gosling, la "Fotografía 51" — una imagen de difracción de rayos X que resultó crucial para deducir la estructura de doble hélice del ADN.</p><p><a class="wiki-link" href="/cerebro/watson-crick" target="_blank" rel="noopener">Watson y Crick</a> vieron la imagen sin su permiso explícito, a través de un colega de ella, y la usaron para completar su modelo. Franklin recibió muy poco reconocimiento en su momento y murió en 1958, antes del Premio Nobel de 1962 (que no se otorga póstumamente). Hoy es reconocida como una de las científicas cuyo trabajo esencial fue históricamente subestimado.</p>`),
  },
  {
    slug: 'crispr',
    term: 'CRISPR',
    icon: '🧬',
    category: 'Medicina',
    summary: 'Tecnología de edición genética de precisión, adaptada de un sistema de defensa bacteriano natural, desarrollada como herramienta en 2012.',
    content: c(`<p><strong>CRISPR</strong> es una tecnología que permite editar secuencias específicas de ADN con una precisión sin precedentes — algo así como "cortar y pegar" en el código genético. Está adaptada de un sistema de defensa que ciertas bacterias usan naturalmente contra virus.</p><p>Desde su desarrollo como herramienta de edición genética en 2012, se investiga activamente para tratar enfermedades genéticas hereditarias. También plantea preguntas éticas importantes: ¿quién decide qué genes se editan, y quién tiene acceso a esta tecnología?</p>`),
  },
]

export function getGlossaryEntry(slug) {
  return GLOSSARY.find((g) => g.slug === slug) ?? null
}

// Helper para escribir enlaces dentro del HTML de un módulo de curso.
// target="_blank" es deliberado: no queremos perder el progreso/scroll del
// curso al consultar el segundo cerebro.
export function wiki(slug, label) {
  return `<a class="wiki-link" href="/cerebro/${slug}" target="_blank" rel="noopener">${label}</a>`
}
