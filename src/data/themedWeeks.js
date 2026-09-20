// Semanas temáticas: cada semana del año la plataforma pone una disciplina al
// frente (tarjeta en el Dashboard, cursos destacados y un reto por día). Sin
// intervención, la semana ISO decide el tema (52 semanas ÷ 12 temas, rota);
// un admin puede forzar otro o apagarlo desde DevToolsPanel.
// `categories` son valores de course.category en courses.json.
//
// FORMATO DE UN TEMA NUEVO — copiar uno de los completos (filosofia) y cambiar:
//   { id, icon, title, color, categories, blurb,
//     days: [ 7 objetos, lunes (0) a domingo (6):
//       { fact:     'texto que enseña algo (2-3 frases)',
//         figure:   { name, years, role },      // filósofo/autor/figura del día
//         question: 'pregunta que el alumno responde y envía',
//         task:     'tarea práctica del día' } ] }
// Todos los campos de un día son opcionales (la página muestra los que existan).
// Las efemérides (acontecimientos por fecha) van aparte, en EFEMERIDES.
// `fromDaily([...7 textos])` convierte una lista simple en días con solo `task`.
const fromDaily = (list) => list.map((task) => ({ task }))

export const THEMED_WEEKS = [
  { id: 'matematicas', icon: '📐', title: 'Semana de las Matemáticas', color: '#3b82f6', categories: ['Matemáticas', 'Lógica'],
    blurb: 'Números, patrones y demostraciones: la lengua con la que se escribe el universo.',
    days: [
      { fact: 'Los Elementos de Euclides organizaron toda la geometría a partir de solo cinco postulados y se usaron como libro de texto durante más de 2000 años. Es el mejor ejemplo de cómo se construye conocimiento seguro: partir de pocas ideas y demostrar todo lo demás.',
        figure: { name: 'Euclides', years: 'c. 300 a. C.', role: 'Matemático griego, “padre de la geometría”' },
        question: 'Euclides pedía demostrar todo. ¿Qué afirmación que das por cierta te gustaría poder demostrar? ¿Con qué pasos lo harías?',
        task: 'Dibuja con regla un triángulo cualquiera, mide sus tres ángulos y suma. Repite con otro triángulo distinto.' },
      { fact: 'El teorema de Pitágoras dice que en un triángulo rectángulo a² + b² = c². Los babilonios ya conocían ternas como 3-4-5 más de mil años antes: Pitágoras (o su escuela) es famoso por la idea de demostrarlo, no solo de usarlo.',
        figure: { name: 'Pitágoras de Samos', years: 'c. 570 – 495 a. C.', role: 'Filósofo y matemático griego' },
        question: 'Si un triángulo tiene lados 5 y 12 en ángulo recto, ¿cuánto mide la hipotenusa? Explica cómo lo calculaste.',
        task: 'Encuentra un ángulo recto en tu casa (una esquina) y comprueba con una cuerda que 3-4-5 lo forma.' },
      { fact: 'Arquímedes acotó el valor de π entre 223/71 y 22/7 usando polígonos de 96 lados dentro y fuera de un círculo. Sin calculadoras ni decimales, logró tres cifras correctas hace más de 2200 años.',
        figure: { name: 'Arquímedes de Siracusa', years: '287 – 212 a. C.', role: 'Matemático, físico e ingeniero griego' },
        question: '¿Por qué crees que π es igual para cualquier círculo, grande o pequeño?',
        task: 'Mide el contorno y el diámetro de una tapa o un vaso, divide contorno ÷ diámetro y anota qué tan cerca queda de 3.14.' },
      { fact: 'En su libro Liber Abaci (1202), Fibonacci introdujo en Europa los numerales indoarábigos (0–9) que usamos hoy. Ahí aparece también la sucesión 1, 1, 2, 3, 5, 8… a partir de un problema sobre la reproducción de conejos.',
        figure: { name: 'Leonardo de Pisa (Fibonacci)', years: 'c. 1170 – c. 1250', role: 'Matemático italiano' },
        question: 'Escribe los siguientes 5 números de la sucesión 1, 1, 2, 3, 5, 8… y explica la regla.',
        task: 'Busca en la naturaleza (flores, piñas, conchas) algo que cuentes en números de Fibonacci.' },
      { fact: 'Emmy Noether demostró que cada simetría de la naturaleza corresponde a una ley de conservación (por ejemplo, la energía se conserva porque las leyes no cambian con el tiempo). Einstein la llamó un genio matemático creativo.',
        figure: { name: 'Emmy Noether', years: '1882 – 1935', role: 'Matemática alemana, pionera del álgebra abstracta' },
        question: '¿Qué significa que algo tenga “simetría”? Da un ejemplo cotidiano y uno matemático.',
        task: 'Dobla una hoja y recorta una figura simétrica. ¿Cuántos ejes de simetría tiene?' },
      { fact: 'La palabra “álgebra” viene del título de un libro de al-Juarismi, Al-jabr. Y su propio nombre, latinizado, dio origen a la palabra “algoritmo”: una lista de pasos para resolver un problema.',
        figure: { name: 'Muhammad al-Juarismi', years: 'c. 780 – c. 850', role: 'Matemático persa de la Casa de la Sabiduría de Bagdad' },
        question: 'Escribe un algoritmo (pasos numerados) para que alguien sume dos números de tres cifras a mano.',
        task: 'Resuelve: “Pienso un número, le sumo 7 y obtengo 20”. ¿Cuál era? Escribe la ecuación.' },
      { fact: 'Srinivasa Ramanujan aprendió matemáticas casi por su cuenta en la India y en 1913 escribió a G. H. Hardy, en Cambridge, con fórmulas asombrosas. Sus series para calcular π todavía se usan en computadoras.',
        figure: { name: 'Srinivasa Ramanujan', years: '1887 – 1920', role: 'Matemático indio autodidacta' },
        question: '¿Qué te enseña la historia de Ramanujan sobre aprender sin tener todos los recursos?',
        task: 'Elige un problema difícil que dejaste pendiente esta semana e inténtalo una vez más, sin pedir ayuda 15 minutos.' },
    ] },
  { id: 'filosofia', icon: '🏛️', title: 'Semana de la Filosofía', color: '#eab308', categories: ['Filosofía', 'Ética', 'Lógica'],
    blurb: 'Las grandes preguntas: qué es lo justo, lo verdadero y una buena vida.',
    days: [
      { fact: 'Sócrates no escribió ningún libro: filosofaba conversando en las plazas de Atenas. Su método era hacer preguntas hasta que la otra persona descubriera por sí misma que no sabía lo que creía saber. Fue condenado a muerte en el 399 a. C. y aceptó beber cicuta antes que renunciar a filosofar.',
        figure: { name: 'Sócrates', years: '470 – 399 a. C.', role: 'Filósofo griego, padre del método de preguntas (mayéutica)' },
        question: 'Sócrates decía “solo sé que no sé nada”. ¿Qué cosa crees saber con total seguridad, y cómo podrías comprobar que es cierta?',
        task: 'Elige una creencia tuya y hazte “¿por qué?” cinco veces seguidas. Anota hasta dónde llegas.' },
      { fact: 'Platón fundó la Academia en Atenas hacia el 387 a. C., considerada la primera institución de estudios superiores de Occidente. En La República cuenta la alegoría de la caverna: personas encadenadas que toman por reales las sombras de una pared.',
        figure: { name: 'Platón', years: '427 – 347 a. C.', role: 'Filósofo griego, discípulo de Sócrates' },
        question: 'En la alegoría de la caverna, ¿qué “sombras” toma por reales la gente hoy (redes, publicidad, rumores)?',
        task: 'Durante un rato, nota cuántas cosas que ves o lees hoy están hechas para llamar tu atención, no para informarte.' },
      { fact: 'Aristóteles estudió 20 años en la Academia y fue maestro de Alejandro Magno. Inventó la lógica formal (el silogismo) y defendió que la felicidad (eudaimonía) se logra practicando virtudes, buscando el “justo medio” entre el exceso y la falta.',
        figure: { name: 'Aristóteles', years: '384 – 322 a. C.', role: 'Filósofo griego, fundador del Liceo' },
        question: 'La valentía es el punto medio entre la cobardía y la temeridad. Elige otra virtud y describe sus dos extremos.',
        task: 'Practica hoy una pequeña virtud (paciencia, orden, generosidad) y anota cómo te fue al final del día.' },
      { fact: 'Marco Aurelio fue emperador romano y estoico. Escribió sus Meditaciones como un diario para sí mismo. La idea central del estoicismo: distinguir lo que depende de nosotros (nuestros juicios y acciones) de lo que no (lo que hacen otros, el clima, el pasado).',
        figure: { name: 'Marco Aurelio', years: '121 – 180', role: 'Emperador romano y filósofo estoico' },
        question: 'Haz dos listas: qué cosas de tu vida dependen de ti y cuáles no. ¿En cuáles gastas más energía?',
        task: 'Hoy, cuando algo te moleste, pregúntate: “¿esto depende de mí?”. Si no, suéltalo y anota qué pasó.' },
      { fact: 'René Descartes decidió dudar de todo lo que pudiera dudarse para encontrar una base segura. Concluyó que no puede dudar de que está pensando: “pienso, luego existo” (cogito, ergo sum). Con esto inauguró la filosofía moderna.',
        figure: { name: 'René Descartes', years: '1596 – 1650', role: 'Filósofo y matemático francés' },
        question: '¿Puedes estar seguro de que no estás soñando ahora mismo? ¿Qué te haría dudar o no?',
        task: 'Aplica la duda metódica a un rumor o noticia de hoy: ¿qué evidencia lo respalda?' },
      { fact: 'Immanuel Kant propuso el imperativo categórico: actúa solo según una regla que quisieras que todos siguieran. Para él, “Sapere aude” (atrévete a pensar por ti mismo) resumía la Ilustración. Vivió toda su vida en Königsberg, con una rutina tan exacta que los vecinos ajustaban sus relojes.',
        figure: { name: 'Immanuel Kant', years: '1724 – 1804', role: 'Filósofo alemán de la Ilustración' },
        question: '¿Es correcto hacer una excepción “solo esta vez”? Aplica el imperativo categórico a un caso concreto.',
        task: 'Antes de una decisión de hoy, pregúntate: “¿y si todos hicieran lo mismo?”. Anota la respuesta.' },
      { fact: 'Simone de Beauvoir, filósofa existencialista francesa, escribió El segundo sexo (1949), donde sostiene que “no se nace mujer: se llega a serlo”, es decir, que muchos roles se construyen socialmente. Para el existencialismo, cada persona es responsable de darle sentido a su propia vida.',
        figure: { name: 'Simone de Beauvoir', years: '1908 – 1986', role: 'Filósofa y escritora francesa' },
        question: '¿Qué “papeles” te ha asignado la sociedad que elegirías cambiar o conservar conscientemente?',
        task: 'Escribe cinco líneas: “una decisión que tomé esta semana y que fue realmente mía”.' },
    ] },
  { id: 'historia', icon: '🗺️', title: 'Semana de la Historia', color: '#f97316', categories: ['Historia', 'Antropología', 'Sociología'],
    blurb: 'Entender de dónde venimos para decidir a dónde vamos.',
    days: fromDaily(['Lunes antiguo: ¿qué civilización inventó la escritura y por qué?', 'Martes de imperios: nombra tres imperios y qué causó su caída.', 'Miércoles de mapas: ¿cómo cambió el mapa de tu país en 100 años?', 'Jueves de fuentes: ¿en qué se diferencia una fuente primaria de una secundaria?', 'Viernes de inventos: ¿qué invento cambió más la vida cotidiana?', 'Sábado local: pregunta a alguien mayor por un recuerdo histórico de tu ciudad.', 'Domingo: elige un personaje histórico y escribe por qué lo admiras.']) },
  { id: 'ciberseguridad', icon: '🔐', title: 'Semana de la Ciberseguridad', color: '#14b8a6', categories: ['Ciberseguridad', 'Alfabetización Digital'],
    blurb: 'Protege tu identidad, tus cuentas y tus datos.',
    days: fromDaily(['Lunes de contraseñas: cambia una débil por una frase larga.', 'Martes de phishing: revisa tu correo y encuentra un mensaje sospechoso.', 'Miércoles de 2FA: activa la verificación en dos pasos en una cuenta.', 'Jueves de privacidad: revisa qué apps tienen acceso a tu ubicación.', 'Viernes de redes: ¿por qué no conviene usar WiFi público sin cuidado?', 'Sábado de respaldos: haz copia de un archivo importante.', 'Domingo: enseña a alguien de tu familia una regla de seguridad.']) },
  { id: 'ia', icon: '🧠', title: 'Semana de la Inteligencia Artificial', color: '#84cc16', categories: ['Inteligencia Artificial', 'Claude para Todos', 'Productividad'],
    blurb: 'Aprende a trabajar CON la IA: preguntar mejor, verificar y crear.',
    days: fromDaily(['Lunes de prompts: reescribe una pregunta vaga dándole rol, tarea y formato.', 'Martes de verificación: pide a una IA un dato y compruébalo en otra fuente.', 'Miércoles de automatización: ¿qué tarea repetitiva podrías delegar?', 'Jueves de ética: ¿cuándo NO deberías usar IA para una tarea escolar?', 'Viernes creativo: pide un poema y edítalo hasta que suene a ti.', 'Sábado de límites: encuentra algo que la IA responda mal.', 'Domingo: explica con tus palabras qué es un modelo de lenguaje.']) },
  { id: 'medicina', icon: '🩺', title: 'Semana de la Medicina', color: '#10b981', categories: ['Medicina', 'Neurociencia', 'Biología'],
    blurb: 'El cuerpo humano, la salud y cómo cuidarlos.',
    days: fromDaily(['Lunes de anatomía: nombra 5 huesos del cuerpo y dónde están.', 'Martes del corazón: mide tu pulso en reposo durante 30 s y multiplica ×2.', 'Miércoles de nutrición: ¿qué tiene tu plato favorito de cada grupo alimenticio?', 'Jueves de neurociencia: ¿por qué dormir bien ayuda a aprender?', 'Viernes de primeros auxilios: ¿qué harías ante un corte pequeño?', 'Sábado de prevención: agenda o recuerda tu próxima revisión médica.', 'Domingo: 10 minutos de estiramiento y una respiración lenta.']) },
  { id: 'idiomas', icon: '🌍', title: 'Semana de los Idiomas', color: '#0ea5e9', categories: ['Idiomas', 'China', 'Literatura'],
    blurb: 'Cada idioma es una nueva forma de pensar.',
    days: fromDaily(['Lunes: aprende a saludar en un idioma que no hables.', 'Martes: nombra 5 objetos de tu cuarto en inglés.', 'Miércoles: busca una palabra que no se traduzca a tu idioma.', 'Jueves: escucha una canción en otro idioma y anota 3 palabras.', 'Viernes: escribe una frase con 3 palabras nuevas de la semana.', 'Sábado: ve un video corto en otro idioma con subtítulos.', 'Domingo: presenta en voz alta quién eres en el idioma que estudias.']) },
  { id: 'ciencias', icon: '🔬', title: 'Semana de las Ciencias', color: '#8b5cf6', categories: ['Física', 'Química', 'Biología', 'Astronomía'],
    blurb: 'Preguntar, experimentar y comprobar: el método científico en acción.',
    days: fromDaily(['Lunes de física: deja caer dos objetos distintos a la vez. ¿Cuál llega primero?', 'Martes de química: ¿qué pasa al mezclar vinagre con bicarbonato? (con cuidado)', 'Miércoles de biología: observa una planta y anota 3 detalles.', 'Jueves de astronomía: busca esta noche la Luna y anota su fase.', 'Viernes de método: formula una hipótesis sobre algo cotidiano.', 'Sábado de laboratorio: prueba tu hipótesis con un mini-experimento.', 'Domingo: escribe qué aprendiste de tu experimento.']) },
  { id: 'arte', icon: '🎨', title: 'Semana del Arte y la Literatura', color: '#ec4899', categories: ['Arte', 'Diseño', 'Literatura', 'Artes Escénicas y Música'],
    blurb: 'Crear, leer y expresarse.',
    days: fromDaily(['Lunes de dibujo: dibuja un objeto sin despegar el lápiz.', 'Martes de lectura: lee un poema corto en voz alta.', 'Miércoles de color: elige una paleta de 3 colores para tu estado de ánimo.', 'Jueves de música: identifica el ritmo de tu canción favorita.', 'Viernes de escritura: escribe un cuento de 6 palabras.', 'Sábado de teatro: actúa una escena de tu vida en 1 minuto.', 'Domingo: comparte algo que creaste esta semana.']) },
  { id: 'economia', icon: '📈', title: 'Semana de la Economía y los Negocios', color: '#22c55e', categories: ['Economía', 'Estrategia', 'Derecho'],
    blurb: 'Dinero, decisiones y cómo se organiza una sociedad.',
    days: fromDaily(['Lunes de presupuesto: anota en qué gastaste hoy.', 'Martes de oferta y demanda: ¿por qué sube el precio de lo escaso?', 'Miércoles de ahorro: define una meta pequeña y su plazo.', 'Jueves de derechos: nombra 3 derechos que tienes como estudiante.', 'Viernes de negocios: imagina un producto que resuelva un problema tuyo.', 'Sábado de estrategia: ¿qué harías si tu idea fallara?', 'Domingo: revisa tu semana de gastos.']) },
  { id: 'programacion', icon: '💻', title: 'Semana de la Programación', color: '#06b6d4', categories: ['Programación', 'Ingeniería'],
    blurb: 'Pensar en pasos y darle instrucciones a una computadora.',
    days: fromDaily(['Lunes de algoritmos: escribe los pasos para preparar un té.', 'Martes de variables: ¿qué valor guardarías en “edad”, “nombre” y “esEstudiante”?', 'Miércoles de condicionales: escribe “si llueve… si no…” para tu día.', 'Jueves de bucles: ¿qué tarea repites 5 veces al día?', 'Viernes de depuración: ¿cómo encuentras el error en una receta que salió mal?', 'Sábado: escribe tu primer “Hola, mundo”.', 'Domingo: explica qué es un programa a alguien que no sabe.']) },
  { id: 'psicologia', icon: '🧩', title: 'Semana de la Mente y la Sociedad', color: '#a78bfa', categories: ['Ciencias Sociales', 'Neurociencia', 'Educación', 'Comunicación y Medios'],
    blurb: 'Cómo pensamos, aprendemos y nos comunicamos.',
    days: fromDaily(['Lunes de emociones: nombra con precisión cómo te sientes ahora.', 'Martes de sesgos: ¿en qué momento decidiste rápido y te equivocaste?', 'Miércoles de aprendizaje: prueba explicar algo en voz alta para memorizarlo.', 'Jueves de comunicación: reformula una queja como petición.', 'Viernes de medios: ¿quién produjo la noticia que leíste y con qué intención?', 'Sábado de empatía: escucha 5 minutos a alguien sin interrumpir.', 'Domingo: anota tres cosas que salieron bien esta semana.']) },
]

// Semana ISO del año (1–53) — determinista para que todos vean el mismo tema.
export function isoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
}

export const autoThemedWeek = (date = new Date()) => THEMED_WEEKS[(isoWeek(date) - 1) % THEMED_WEEKS.length]
// Lunes = 0 … domingo = 6
export const dayIndex = (date = new Date()) => (date.getDay() + 6) % 7

// Acontecimientos por fecha (MM-DD): se muestran el día que corresponden, sea
// cual sea el tema de la semana. `themes` (ids de tema) solo sirve para
// destacar los que coinciden con la semana activa.
export const EFEMERIDES = {
  '01-04': { text: 'Nace Louis Braille (1809), inventor del sistema de lectura para ciegos.', themes: ['idiomas'] },
  '02-11': { text: 'Día Internacional de la Mujer y la Niña en la Ciencia.', themes: ['ciencias'] },
  '02-12': { text: 'Nace Charles Darwin (1809), autor de El origen de las especies.', themes: ['ciencias'] },
  '02-15': { text: 'Nace Galileo Galilei (1564), pionero del método experimental y del telescopio.', themes: ['ciencias', 'matematicas'] },
  '02-21': { text: 'Día Internacional de la Lengua Materna.', themes: ['idiomas'] },
  '03-08': { text: 'Día Internacional de la Mujer.', themes: ['psicologia', 'historia'] },
  '03-14': { text: 'Día de Pi (π = 3.14). Nace Albert Einstein (1879).', themes: ['matematicas', 'ciencias'] },
  '03-21': { text: 'Día Mundial de la Poesía.', themes: ['arte'] },
  '03-22': { text: 'Día Mundial del Agua.', themes: ['ciencias'] },
  '04-07': { text: 'Día Mundial de la Salud: la OMS fue fundada en 1948.', themes: ['medicina'] },
  '04-12': { text: 'Yuri Gagarin, primer ser humano en el espacio (1961).', themes: ['ciencias', 'historia'] },
  '04-15': { text: 'Nace Leonardo da Vinci (1452), artista, científico e ingeniero.', themes: ['arte', 'ciencias'] },
  '04-18': { text: 'Muere Albert Einstein (1955).', themes: ['ciencias', 'matematicas'] },
  '04-22': { text: 'Día de la Tierra.', themes: ['ciencias'] },
  '04-23': { text: 'Día Mundial del Libro: se recuerda la muerte de Cervantes y Shakespeare (1616).', themes: ['arte', 'idiomas'] },
  '05-12': { text: 'Día Internacional de la Enfermería: nace Florence Nightingale (1820).', themes: ['medicina'] },
  '05-17': { text: 'Día Mundial de las Telecomunicaciones y la Sociedad de la Información (Internet).', themes: ['ciberseguridad', 'programacion'] },
  '05-18': { text: 'Día Internacional de los Museos.', themes: ['arte', 'historia'] },
  '06-05': { text: 'Día Mundial del Medio Ambiente.', themes: ['ciencias'] },
  '06-21': { text: 'Día Mundial de la Música (Fiesta de la Música).', themes: ['arte'] },
  '06-23': { text: 'Nace Alan Turing (1912), padre de la informática teórica.', themes: ['programacion', 'ia', 'matematicas'] },
  '07-14': { text: 'Toma de la Bastilla (1789), símbolo de la Revolución Francesa.', themes: ['historia'] },
  '07-20': { text: 'Apolo 11: el ser humano pisa la Luna por primera vez (1969).', themes: ['ciencias', 'historia'] },
  '09-08': { text: 'Día Internacional de la Alfabetización.', themes: ['idiomas', 'psicologia'] },
  '10-04': { text: 'Se lanza el Sputnik 1 (1957), primer satélite artificial.', themes: ['ciencias', 'historia'] },
  '10-12': { text: 'Llegada de Colón a América (1492), inicio del encuentro entre dos mundos.', themes: ['historia'] },
  '10-16': { text: 'Día Mundial de la Alimentación.', themes: ['medicina'] },
  '10-29': { text: 'Se envía el primer mensaje por ARPANET (1969), antecesor de Internet.', themes: ['ciberseguridad', 'programacion'] },
  '11-09': { text: 'Cae el Muro de Berlín (1989).', themes: ['historia'] },
  '11-10': { text: 'Día Mundial de la Ciencia para la Paz y el Desarrollo.', themes: ['ciencias'] },
  '11-14': { text: 'Día Mundial de la Diabetes: nace Frederick Banting (1891), codescubridor de la insulina.', themes: ['medicina'] },
  '11-30': { text: 'Día Internacional de la Seguridad Informática.', themes: ['ciberseguridad'] },
  '12-09': { text: 'Día Internacional contra la Corrupción.', themes: ['economia'] },
  '12-10': { text: 'Se adopta la Declaración Universal de los Derechos Humanos (1948).', themes: ['filosofia', 'economia', 'historia'] },
  '12-15': { text: 'Nace L. L. Zamenhof (1859), creador del esperanto.', themes: ['idiomas'] },
}

// Acontecimiento de hoy (o null).
export const efemerideOf = (date = new Date()) => {
  const key = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return EFEMERIDES[key] ?? null
}

// Clave estable de un día para guardar respuestas (fecha local).
export const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

// Lunes de la semana de `date` (para pintar los 7 días).
export const weekDates = (date = new Date()) => {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayIndex(date))
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i))
}
