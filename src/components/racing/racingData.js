import { DEEP } from './racingDeep.js'

// Datos del juego de carreras educativo (Oliver Racing): MUNDOS (uno por profesión), cada uno con 5 vehículos, 3 MISIONES
// (tramos con su propio escenario, historia y paleta) y un banco de preguntas con dificultad 0–4 (la dificultad que se pregunta
// sigue al nivel del vehículo: camilla = fácil, ambulancia turbo = difícil). Cada pregunta trae 1 correcta + 1–2 trampas, un
// dato curioso (lo cuenta el locutor y sale en la tarjeta con imagen) y un emoji que hace de ilustración.

export const RACE = {
  missions: 3, forksPerMission: 4, // 12 preguntas por partida
  firstFork: 700, spacing: 950, forkLen: 160, finishExtra: 400, // metros: pistas largas
  armDist: 800, askDist: 460, holdDist: 45, // se elige la pregunta 800 m antes, se anuncia a 460 m y el vehículo espera en el pórtico (si aún no termina de leerse)
  roadHalf: 8.5, // medio ancho de la pista
}
export const FORKS = RACE.missions * RACE.forksPerMission
export const trackLength = () => RACE.firstFork + (FORKS - 1) * RACE.spacing + RACE.forkLen + RACE.finishExtra
// Cada tercera bifurcación tiene 3 carriles (con 3 opciones); las demás tienen 2
export const forkLanes = (i) => (i % 3 === 2 ? 3 : 2)
export const medianHalf = (n) => (n === 3 ? 0.9 : 1.5)

// Geometría de los carriles de una bifurcación de `n` carriles: límites laterales (lo, hi) y centro de cada uno
export function laneBounds(n, i) {
  const half = RACE.roadHalf, w = (2 * half) / n, m = medianHalf(n), pad = n === 3 ? 0.6 : 0.8
  const edge = (k) => -half + k * w
  const lo = i === 0 ? -half + 0.7 : edge(i) + m + pad, hi = i === n - 1 ? half - 0.7 : edge(i + 1) - m - pad
  return { lo, hi, center: (lo + hi) / 2, from: i === 0 ? -half : edge(i) + m, to: i === n - 1 ? half : edge(i + 1) - m }
}
export const laneOf = (n, u) => Math.max(0, Math.min(n - 1, Math.floor((u + RACE.roadHalf) / ((2 * RACE.roadHalf) / n))))

// 14 vehículos por mundo (nivel 0–13). Los niveles 10–11 son aerodeslizadores, el 12 un avión y el 13 una nave espacial: vuelan.
export const TIERS = 14
export const MAX_TIER = TIERS - 1
export const FLY_FROM = 10
// Velocidad máxima (m/s) según el nivel del vehículo
export const tierSpeed = (tier) => 20 + tier * 3.2
// Dificultad de las preguntas (0–4) que corresponde al nivel del vehículo
export const lvlOfTier = (tier) => Math.round((tier * 4) / MAX_TIER)
// Altura de vuelo (m) por nivel
export const flyAlt = (tier) => (tier < FLY_FROM ? 0 : [1.6, 3.2, 8, 12][tier - FLY_FROM])

// Poderes que se eligen al empezar cada misión (1 de 3). shield es pasivo (absorbe la próxima trampa); los demás se activan (Q, E, R).
export const POWERS = {
  shield: { icon: '🛡️', passive: true }, hint: { icon: '💡', passive: false }, nitro: { icon: '🔥', passive: false }, jump: { icon: '🌀', passive: false },
}
export const POWER_KEYS = Object.keys(POWERS)
export const MAX_POWERS = 3

// Ruta de repaso: pista aparte con una estación por cada tramo de la explicación; distancias en metros de la ruta
export const ROUTE = { first: 120, gap: 120, tail: 130, x0: 4000, stop: 20 } // `stop` = metros antes del cartel donde espera el vehículo
export const routeLength = (stations) => ROUTE.first + (stations - 1) * ROUTE.gap + ROUTE.tail
export const stationPos = (i) => ROUTE.first + i * ROUTE.gap

// Pregunta: tema, dificultad 0–4, texto, correcta, trampas[], dato curioso, emoji
const Q = (t, lvl, q, ok, bad, fact, img) => ({ t, lvl, q, ok, bad, fact, img })

export const WORLDS = {
  medicina: {
    id: 'medicina', name: 'Medicina', icon: '🩺', color: '#22d3ee', tagline: 'De la camilla a la ambulancia turbo', emblem: 'cross',
    music: { root: 261.63, scale: [0, 2, 4, 7, 9], bass: [0, 0, 5, 7], bpm: 116, wave: 'triangle' },
    tiers: [
      { name: 'Camilla', kind: 'stretcher' },
      { name: 'Silla de ruedas', kind: 'wheelchair' },
      { name: 'Scooter médico', kind: 'scooter' },
      { name: 'Moto de enfermería', kind: 'bike' },
      { name: 'Kart de urgencias', kind: 'kart' },
      { name: 'Buggy de rescate', kind: 'buggy' },
      { name: 'Ambulancia', kind: 'ambulance' },
      { name: 'Ambulancia 4x4', kind: 'van' },
      { name: 'Deportivo de trauma', kind: 'sports' },
      { name: 'Ambulancia turbo', kind: 'turbo' },
      { name: 'Hovercar médico', kind: 'hovercar' },
      { name: 'Moto aérea de rescate', kind: 'hoverbike' },
      { name: 'Avión sanitario', kind: 'plane' },
      { name: 'Nave Hipócrates', kind: 'spaceship' },
    ],
    missions: [
      { name: 'Urgencias del Hospital', img: '🏥', deco: 'hospital', topics: ['urgencias', 'cuerpo'], pal: { sky: '#e8f1f5', fog: '#eaf4f8', ground: '#dfe8ec', ground2: '#cfdbe1', road: '#b7c2ca', accent: '#38bdf8' },
        intro: 'Bienvenido al Hospital Escuela Sagrado Corazón. Eres paramédico en prácticas y tu camilla corre por los pasillos de Urgencias. Cada pasillo se divide en dos o tres: elige la respuesta correcta y ganarás velocidad. Si fallas, perderás un nivel.' },
      { name: 'Jardín de recuperación', img: '🌿', deco: 'garden', topics: ['cuerpo', 'salud'], pal: { sky: '#bfe9ff', fog: '#dff3ff', ground: '#cfe9c8', ground2: '#b9dcb2', road: '#8f9ca6', accent: '#22c55e' },
        intro: 'Los pacientes descansan en el jardín del hospital. Aquí aprenderás cómo funciona el cuerpo humano y cómo cuidarlo. Tu vehículo ya es más rápido, ¡aprovecha!' },
      { name: 'Ciudad de emergencias', img: '🚑', deco: 'city', topics: ['urgencias', 'salud', 'cuerpo'], pal: { sky: '#9fc9ff', fog: '#d6e6f6', ground: '#c9ccd1', ground2: '#b8bcc3', road: '#4f5763', accent: '#ef4444' },
        intro: 'Suena la alarma: hay una emergencia en la ciudad. Todo lo que aprendiste cuenta ahora. Sirenas, ambulancias y mucha velocidad. ¡Llega a la meta!' },
    ],
    questions: [
      Q('urgencias', 0, 'Si alguien sangra mucho, ¿qué haces primero?', 'Presionar la herida con un paño limpio', ['Darle de beber agua', 'Sacudirlo para que reaccione'], 'Presionar directamente la herida frena la hemorragia mientras llega la ayuda.', '🩸'),
      Q('cuerpo', 0, '¿Qué órgano bombea la sangre?', 'El corazón', ['El hígado', 'Los riñones'], 'Tu corazón late unas 100 000 veces al día sin descansar.', '🫀'),
      Q('salud', 0, '¿Cuántas veces al día conviene cepillarse los dientes?', 'Al menos dos', ['Una vez a la semana', 'Solo si duelen'], 'Cepillarse después de comer reduce las caries y las encías inflamadas.', '🦷'),
      Q('cuerpo', 0, '¿Con qué órgano respiramos?', 'Los pulmones', ['El estómago', 'El cerebro'], 'Los pulmones tienen unos 300 millones de alvéolos. Extendidos, cubrirían media cancha de tenis.', '🫁'),
      Q('urgencias', 0, '¿Qué instrumento mide la temperatura corporal?', 'El termómetro', ['El estetoscopio', 'La báscula'], 'Una temperatura normal ronda los 36 a 37 grados.', '🌡️'),
      Q('salud', 0, '¿Qué bebida es la mejor para hidratarte?', 'Agua', ['Refresco', 'Café con azúcar'], 'Más o menos el 60 % del cuerpo adulto es agua.', '💧'),
      Q('cuerpo', 1, '¿Cuál es el hueso más largo del cuerpo?', 'El fémur', ['El húmero', 'La tibia'], 'El fémur mide casi una cuarta parte de tu estatura.', '🦴'),
      Q('cuerpo', 1, '¿Qué células transportan el oxígeno en la sangre?', 'Glóbulos rojos', ['Glóbulos blancos', 'Plaquetas'], 'Contienen hemoglobina, la proteína que da a la sangre su color rojo.', '🩸'),
      Q('urgencias', 1, '¿Qué significan las siglas RCP?', 'Reanimación cardiopulmonar', ['Respiración continua pulmonar', 'Registro clínico pediátrico'], 'Hacer RCP a tiempo puede duplicar las probabilidades de sobrevivir a un paro cardíaco.', '🫀'),
      Q('salud', 1, '¿Qué vitamina fabrica la piel con la luz del sol?', 'Vitamina D', ['Vitamina C', 'Vitamina K'], 'La vitamina D ayuda a que los huesos fijen el calcio.', '☀️'),
      Q('urgencias', 1, 'Ante una quemadura leve, ¿qué hacer?', 'Enfriar con agua corriente', ['Poner hielo directo', 'Aplicar mantequilla'], 'Agua fresca durante 10 a 20 minutos reduce el daño de la quemadura.', '🔥'),
      Q('cuerpo', 1, '¿Cuántas cámaras tiene el corazón humano?', 'Cuatro', ['Dos', 'Seis'], 'Dos aurículas arriba y dos ventrículos abajo.', '❤️'),
      Q('cuerpo', 2, '¿Qué órgano produce la insulina?', 'El páncreas', ['El hígado', 'El bazo'], 'La insulina regula el azúcar en la sangre; cuando falla aparece la diabetes.', '🍬'),
      Q('urgencias', 2, 'Frecuencia cardíaca normal de un adulto en reposo', '60 a 100 latidos por minuto', ['120 a 160 latidos por minuto', '20 a 40 latidos por minuto'], 'Algunos atletas entrenados tienen menos de 60 latidos en reposo.', '⏱️'),
      Q('salud', 2, '¿Qué mide el índice de masa corporal (IMC)?', 'La relación entre peso y estatura', ['La presión arterial', 'El azúcar en la sangre'], 'Se calcula como peso en kilos dividido entre la estatura al cuadrado.', '⚖️'),
      Q('urgencias', 2, '¿Qué instrumento mide la presión arterial?', 'Esfigmomanómetro', ['Estetoscopio', 'Otoscopio'], 'Un valor de referencia es 120 sobre 80 milímetros de mercurio.', '🩺'),
      Q('cuerpo', 2, '¿Qué parte del ojo enfoca la luz?', 'El cristalino', ['El iris', 'La esclerótica'], 'El cristalino cambia de forma para enfocar de cerca y de lejos.', '👁️'),
      Q('salud', 2, '¿Qué nutriente ayuda a construir y reparar músculos?', 'Las proteínas', ['Los azúcares simples', 'Las grasas saturadas'], 'Las legumbres, los huevos y el pescado son buenas fuentes.', '🍗'),
      Q('urgencias', 3, 'A una persona inconsciente que respira, ¿cómo se le coloca?', 'En posición lateral de seguridad', ['Boca arriba con la cabeza hacia atrás', 'Sentada'], 'Así la lengua o el vómito no bloquean la vía aérea.', '🛌'),
      Q('cuerpo', 3, '¿Qué hormona regula el ciclo del sueño?', 'La melatonina', ['La adrenalina', 'La insulina'], 'Tu cerebro la libera cuando oscurece.', '🌙'),
      Q('salud', 3, '¿Qué vitamina previene el escorbuto?', 'Vitamina C', ['Vitamina A', 'Vitamina B12'], 'Los marineros antiguos enfermaban por no comer fruta fresca en sus largos viajes.', '🍊'),
      Q('cuerpo', 3, '¿Dónde se absorben la mayoría de los nutrientes?', 'En el intestino delgado', ['En el estómago', 'En el intestino grueso'], 'El intestino delgado mide unos 6 o 7 metros.', '🧬'),
      Q('urgencias', 3, '¿Qué es una arritmia?', 'Un ritmo cardíaco irregular', ['Un tipo de fractura', 'Una infección pulmonar'], 'Algunas se tratan con un marcapasos o un desfibrilador.', '⚡'),
      Q('salud', 3, '¿Para qué sirven las vacunas?', 'Entrenan al sistema inmune', ['Eliminan todas las bacterias', 'Sustituyen a los antibióticos'], 'La viruela se erradicó del mundo gracias a la vacunación.', '💉'),
      Q('cuerpo', 4, '¿Qué estructura une un músculo con un hueso?', 'El tendón', ['El ligamento', 'El cartílago'], 'Los ligamentos, en cambio, unen un hueso con otro hueso.', '💪'),
      Q('urgencias', 4, 'La maniobra de Heimlich se usa en caso de…', 'Atragantamiento', ['Infarto', 'Convulsión'], 'Consiste en compresiones abdominales para expulsar el objeto.', '🫁'),
      Q('cuerpo', 4, '¿Qué grupo sanguíneo es donador universal de glóbulos rojos?', 'O negativo', ['AB positivo', 'A positivo'], 'Por eso la sangre O negativa es tan valiosa en las emergencias.', '🩸'),
      Q('salud', 4, '¿Qué tipo de microorganismo causa la tuberculosis?', 'Una bacteria', ['Un virus', 'Un hongo'], 'Se debe a Mycobacterium tuberculosis y hoy tiene cura con antibióticos.', '🦠'),
      Q('cuerpo', 4, '¿Qué lóbulo del cerebro procesa sobre todo la visión?', 'El occipital', ['El frontal', 'El temporal'], 'Está en la parte de atrás de la cabeza.', '🧠'),
      Q('urgencias', 4, 'La escala de Glasgow evalúa…', 'El nivel de conciencia', ['La presión arterial', 'La glucosa en sangre'], 'Va de 3 puntos, el más grave, a 15, consciencia plena.', '🧠'),
    ],
  },

  programacion: {
    id: 'programacion', name: 'Programación', icon: '💻', color: '#22c55e', tagline: 'De la patineta al cohete con IA', emblem: 'code',
    music: { root: 220, scale: [0, 3, 5, 7, 10], bass: [0, 0, 3, 5], bpm: 130, wave: 'square' },
    tiers: [
      { name: 'Patineta Hello World', kind: 'board' },
      { name: 'Scooter for-loop', kind: 'scooter' },
      { name: 'Moto Python', kind: 'bike' },
      { name: 'Kart JavaScript', kind: 'kart' },
      { name: 'Buggy Linux', kind: 'buggy' },
      { name: 'Coche compilado', kind: 'car' },
      { name: 'Furgoneta DevOps', kind: 'van' },
      { name: 'Deportivo Rust', kind: 'sports' },
      { name: 'Fórmula Open Source', kind: 'formula' },
      { name: 'Racer Cuántico', kind: 'turbo' },
      { name: 'Hovercar Cloud', kind: 'hovercar' },
      { name: 'Moto Hover GPU', kind: 'hoverbike' },
      { name: 'Jet de la Nube', kind: 'plane' },
      { name: 'Nave IA General', kind: 'spaceship' },
    ],
    missions: [
      { name: 'La Terminal', img: '💻', deco: 'servers', topics: ['basico'], pal: { sky: '#0b1220', fog: '#0f1a2e', ground: '#0f2a22', ground2: '#0a1f19', road: '#1b2433', accent: '#22c55e' },
        intro: 'Has sido compilado dentro de la Terminal. Tu patineta de código avanza entre servidores. Cada bifurcación es un if: elige la rama verdadera. Si fallas, perderás un nivel de vehículo.' },
      { name: 'La Red', img: '🌐', deco: 'matrix', topics: ['web', 'basico'], pal: { sky: '#02130a', fog: '#04200f', ground: '#031a0d', ground2: '#02140a', road: '#0b2a1a', accent: '#4ade80' },
        intro: 'Sales a la red. Los paquetes vuelan a tu lado: la web, HTML, protocolos. Acierta para recibir más ancho de banda.' },
      { name: 'Núcleo de IA', img: '🧠', deco: 'neon', topics: ['ia', 'basico', 'web'], pal: { sky: '#14061f', fog: '#1d0a2e', ground: '#1b0b2b', ground2: '#140820', road: '#251338', accent: '#d946ef' },
        intro: 'Llegas al núcleo de la inteligencia artificial. Aquí las preguntas son profundas: cada acierto entrena a tu vehículo.' },
    ],
    questions: [
      Q('basico', 0, 'En Python, ¿qué imprime print(2 + 3)?', '5', ['23', 'print'], 'Con números el signo más suma; con texto une cadenas.', '➕'),
      Q('basico', 0, '¿Qué es un "bug"?', 'Un error en el código', ['Un tipo de variable', 'Un lenguaje de programación'], 'El término se hizo famoso en 1947, cuando una polilla real se atascó en una computadora.', '🐛'),
      Q('web', 0, '¿Cuál es un lenguaje de marcado?', 'HTML', ['Python', 'SQL'], 'HTML describe la estructura de las páginas web.', '🌐'),
      Q('basico', 1, '¿Qué estructura repite instrucciones?', 'Un bucle (for o while)', ['Un comentario', 'Un import'], 'Un bucle evita escribir lo mismo mil veces.', '🔁'),
      Q('web', 1, '¿Qué significa CSS?', 'Cascading Style Sheets', ['Computer Style Software', 'Creative Site Scripts'], 'CSS da el estilo: colores, tamaños y diseño de la página.', '🎨'),
      Q('ia', 1, '¿Qué significan las siglas IA?', 'Inteligencia artificial', ['Internet avanzado', 'Interfaz automática'], 'La IA aprende patrones a partir de enormes cantidades de datos.', '🤖'),
      Q('basico', 1, '¿Para qué sirve "git commit"?', 'Guardar cambios en el historial', ['Borrar el repositorio', 'Abrir el navegador'], 'Cada commit es como una foto del proyecto en ese momento.', '📸'),
      Q('basico', 2, 'En JavaScript, ¿qué operador compara valor Y tipo?', '===', ['=', '=>'], 'El doble igual convierte tipos; el triple igual no lo hace.', '⚖️'),
      Q('basico', 2, '¿Qué estructura guarda pares clave y valor?', 'Un diccionario u objeto', ['Un bucle while', 'Un comentario'], 'Funciona como una agenda: buscas por nombre y obtienes el dato.', '📒'),
      Q('web', 2, '¿Qué etiqueta HTML crea un enlace?', '<a>', ['<p>', '<img>'], 'La a viene de anchor, que significa ancla.', '🔗'),
      Q('ia', 2, 'Un modelo de IA aprende ajustando…', 'Sus parámetros con datos', ['Sus colores', 'Su sistema operativo'], 'Un modelo grande ajusta miles de millones de parámetros.', '🧠'),
      Q('basico', 3, '¿Qué complejidad tiene la búsqueda binaria?', 'O(log n)', ['O(n)', 'O(n²)'], 'Si duplicas la lista, solo se añade un paso más.', '🔎'),
      Q('web', 3, '¿Qué código HTTP significa "no encontrado"?', '404', ['200', '500'], 'Un 200 es todo bien y un 500 es un error del servidor.', '🚫'),
      Q('basico', 3, '¿Qué hace "git pull"?', 'Trae y fusiona cambios remotos', ['Borra tu rama', 'Crea un commit vacío'], 'Es la forma de ponerte al día con el trabajo de tu equipo.', '⬇️'),
      Q('ia', 3, '¿Qué es un "prompt"?', 'La instrucción que le das al modelo', ['Un tipo de gráfico', 'Un virus'], 'Un buen prompt da contexto, objetivo y formato esperado.', '💬'),
      Q('basico', 4, '¿Qué es la recursión?', 'Una función que se llama a sí misma', ['Un bucle que nunca termina', 'Una variable global'], 'Necesita un caso base para poder terminar.', '🪞'),
      Q('web', 4, '¿Qué protocolo cifra la navegación web?', 'HTTPS (TLS)', ['FTP', 'SMTP'], 'El candadito del navegador te avisa que la conexión está cifrada.', '🔒'),
      Q('ia', 4, '¿Qué es el sobreajuste (overfitting)?', 'Memorizar los datos de entrenamiento', ['Entrenar demasiado rápido', 'Usar poca memoria RAM'], 'El modelo luce perfecto en el examen de práctica y falla con datos nuevos.', '📈'),
      Q('basico', 4, '¿Qué estructura sigue "último en entrar, primero en salir"?', 'Una pila (stack)', ['Una cola (queue)', 'Un árbol'], 'El botón deshacer de tu editor usa una pila.', '🥞'),
      Q('ia', 4, '¿Qué es una red neuronal?', 'Capas de nodos que aprenden patrones', ['Un cable de red', 'Una base de datos SQL'], 'Se inspiran, de forma muy libre, en las neuronas del cerebro.', '🕸️'),
    ],
  },

  filosofia: {
    id: 'filosofia', name: 'Filosofía', icon: '📜', color: '#eab308', tagline: 'De la carreta a la nave de la Razón', emblem: 'omega',
    music: { root: 146.83, scale: [0, 2, 3, 7, 9], bass: [0, 3, 0, 5], bpm: 100, wave: 'triangle' },
    tiers: [
      { name: 'Carreta socrática', kind: 'cart' },
      { name: 'Cuadriga de Platón', kind: 'chariot' },
      { name: 'Vespa de Aristóteles', kind: 'scooter' },
      { name: 'Moto de Epicuro', kind: 'bike' },
      { name: 'Kart de Diógenes', kind: 'kart' },
      { name: 'Buggy estoico', kind: 'buggy' },
      { name: 'Carruaje de Kant', kind: 'car' },
      { name: 'Furgón de la Ilustración', kind: 'van' },
      { name: 'Deportivo de Nietzsche', kind: 'sports' },
      { name: 'Fórmula del Logos', kind: 'formula' },
      { name: 'Hovercar de Hegel', kind: 'hovercar' },
      { name: 'Moto del Eterno Retorno', kind: 'hoverbike' },
      { name: 'Avión de Ícaro', kind: 'plane' },
      { name: 'Nave de la Razón', kind: 'spaceship' },
    ],
    missions: [
      { name: 'El Ágora', img: '🏛️', deco: 'agora', topics: ['antigua'], pal: { sky: '#ffd9a0', fog: '#ffe9c7', ground: '#e9d9a8', ground2: '#d8c88f', road: '#a89878', accent: '#eab308' },
        intro: 'Atenas, siglo quinto antes de Cristo. Sócrates pregunta en el ágora y tu carreta rueda entre columnas. Cada bifurcación es una pregunta: piensa antes de elegir. Si te equivocas, perderás un nivel.' },
      { name: 'La Caverna', img: '🔥', deco: 'cave', topics: ['mente', 'antigua'], pal: { sky: '#1a1410', fog: '#241a12', ground: '#2a2018', ground2: '#201810', road: '#4a3b2c', accent: '#ff9f43' },
        intro: 'Entras en la caverna de Platón. Las sombras en la pared parecen reales, pero solo son reflejos de lo que pasa detrás de ti. Aprende a distinguir la apariencia de la verdad.' },
      { name: 'La luz del Sol', img: '☀️', deco: 'sun', topics: ['etica', 'mente'], pal: { sky: '#fff3c4', fog: '#fff7dc', ground: '#f3e7b5', ground2: '#ead99a', road: '#c9b87f', accent: '#f59e0b' },
        intro: 'Sales de la caverna. La luz te deslumbra: es el mundo de las ideas. Lo que sabes ahora cambia cómo ves todo lo demás. Corre hacia la meta.' },
    ],
    questions: [
      Q('antigua', 0, '¿Quién fue el maestro de Platón?', 'Sócrates', ['Pitágoras', 'Heráclito'], 'Sócrates no escribió nada: lo conocemos sobre todo por lo que contó Platón.', '🏛️'),
      Q('etica', 0, '¿Qué estudia la ética?', 'La moral y lo que es bueno', ['Los astros', 'Las plantas'], 'Su gran pregunta es: ¿cómo debemos vivir?', '⚖️'),
      Q('mente', 0, '"Pienso, luego existo" es de…', 'Descartes', ['Nietzsche', 'Marx'], 'Fue la primera certeza que Descartes encontró después de dudar de todo.', '💭'),
      Q('antigua', 1, '¿Quién escribió La República y la Alegoría de la Caverna?', 'Platón', ['Aristóteles', 'Epicuro'], 'Los prisioneros de la caverna solo ven sombras y creen que eso es la realidad.', '🔥'),
      Q('antigua', 1, '¿Quién fue discípulo de Platón y tutor de Alejandro Magno?', 'Aristóteles', ['Sócrates', 'Diógenes'], 'Fundó el Liceo y estudió casi todo: física, biología, lógica y política.', '📚'),
      Q('mente', 1, '¿Qué rama estudia el razonamiento válido?', 'La lógica', ['La estética', 'La política'], 'Un ejemplo clásico: todos los humanos son mortales, Sócrates es humano, luego es mortal.', '🧩'),
      Q('etica', 1, '"Solo sé que no sé nada" se atribuye a…', 'Sócrates', ['Epicuro', 'Kant'], 'Reconocer la ignorancia es, para él, el comienzo del saber.', '❓'),
      Q('antigua', 2, 'En la caverna de Platón, las sombras representan…', 'Las apariencias', ['Las ideas verdaderas', 'Los dioses'], 'Salir de la caverna es subir desde la opinión hasta el conocimiento.', '🌑'),
      Q('etica', 2, '¿Qué plantea el utilitarismo?', 'Lo correcto es lo que aumenta el bienestar de todos', ['Obedecer siempre las reglas', 'Buscar el poder'], 'Lo defendieron Jeremy Bentham y John Stuart Mill.', '📊'),
      Q('mente', 2, '¿Qué postura dice que el conocimiento nace de la experiencia?', 'Empirismo', ['Racionalismo', 'Idealismo'], 'Locke y Hume sostenían que la mente al nacer es como una hoja en blanco.', '👁️'),
      Q('antigua', 2, '¿Qué escuela fundó Epicuro?', 'El Jardín (epicureísmo)', ['El Pórtico (estoicismo)', 'El Liceo'], 'Buscaba la serenidad, no el lujo: un pan, agua y buenos amigos.', '🌿'),
      Q('etica', 3, '¿Quién escribió Crítica de la razón pura?', 'Kant', ['Hegel', 'Marx'], 'También formuló el imperativo categórico, una brújula para la moral.', '📖'),
      Q('antigua', 3, '¿Qué defendían los estoicos?', 'Aceptar lo que no depende de nosotros', ['Buscar el placer máximo', 'Negar toda verdad'], 'Epicteto, Séneca y el emperador Marco Aurelio fueron estoicos.', '🏺'),
      Q('mente', 3, '¿Qué sostiene el dualismo de Descartes?', 'Mente y cuerpo son cosas distintas', ['Todo es materia', 'Todo es mente'], 'Aún hoy se debate cómo se relacionan el cerebro y la conciencia.', '🧠'),
      Q('etica', 3, 'El imperativo categórico de Kant dice…', 'Actúa solo según reglas que todos podrían seguir', ['Haz lo que te convenga', 'Obedece a la mayoría'], 'Es una forma de probar si una acción es justa: ¿y si todos hicieran lo mismo?', '📜'),
      Q('antigua', 4, '¿Qué idea de Heráclito resume "todo fluye"?', 'El cambio constante', ['El ser inmóvil', 'Los átomos'], 'No puedes bañarte dos veces en el mismo río.', '🌊'),
      Q('mente', 4, '¿Qué son los "qualia"?', 'Las experiencias subjetivas de sentir algo', ['Un tipo de silogismo', 'Una virtud griega'], '¿Ves el color rojo igual que yo? No hay forma de comprobarlo.', '🎨'),
      Q('etica', 4, '¿Qué propone Rawls con el "velo de la ignorancia"?', 'Elegir reglas sin saber qué lugar tendrás en la sociedad', ['Ocultar la verdad', 'Castigar a todos igual'], 'Si no sabes si serás rico o pobre, eliges reglas más justas.', '🕶️'),
      Q('antigua', 4, '¿Qué defendió Parménides?', 'Que el ser es uno e inmutable', ['Que todo cambia', 'Que el hombre es la medida de todo'], 'Para él, el cambio es solo una ilusión de los sentidos.', '🗿'),
      Q('mente', 4, 'La "habitación china" de Searle critica la idea de que…', 'Una máquina que manipula símbolos ya entiende', ['El alma es inmortal', 'La experiencia es la fuente del saber'], 'Es un debate muy vivo hoy, con las inteligencias artificiales.', '🈶'),
    ],
  },
}
// Explicaciones detalladas (racingDeep.js): 2 párrafos por pregunta, en el mismo orden que `questions`
for (const w of Object.values(WORLDS)) w.questions.forEach((q, i) => { q.deep = (DEEP[w.id]?.[i] || '').split('|').filter(Boolean) })
export const WORLD_LIST = Object.values(WORLDS)

// Texto en el idioma actual: `obj.i18n[lang][campo]` si existe; si no, el campo en español (la base, igual que el resto de la app)
export const L = (lang, obj, field) => obj?.i18n?.[lang]?.[field] ?? obj?.[field]

// Barajar (Fisher–Yates) con el generador `rng` (por defecto, Math.random); devuelve una copia
export const shuffle = (arr, rng = Math.random) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
