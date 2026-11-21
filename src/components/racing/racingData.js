// Datos del juego de carreras educativo (demo "Oliver Racing"): clases, vehículos por nivel y preguntas.
// Cada clase tiene su paleta (pista temática), 5 vehículos que se desbloquean al acertar y un banco de preguntas de 2 opciones
// ([correcta, trampa]). En cada bifurcación se sortea de qué lado va la correcta.

export const RACE = {
  forks: 6, // preguntas por carrera
  firstFork: 300, // metros hasta la primera bifurcación
  spacing: 340, // metros entre bifurcaciones
  forkLen: 120, // largo de la zona dividida
  roadHalf: 8.5, // medio ancho de la pista
  median: 1.6, // medio ancho del muro central en la bifurcación
  finishExtra: 220, // metros de pista después de la última bifurcación
}
export const trackLength = () => RACE.firstFork + (RACE.forks - 1) * RACE.spacing + RACE.forkLen + RACE.finishExtra

// Velocidad máxima (m/s) según el nivel del vehículo (0–4)
export const tierSpeed = (tier) => 20 + tier * 7.5

export const CLASSES = {
  medicina: {
    id: 'medicina', name: 'Medicina', icon: '🩺', color: '#22d3ee', tagline: 'De la camilla a la ambulancia turbo',
    sky: '#bfe9ff', fog: '#dff3ff', ground: '#e6f3f0', ground2: '#c9e6e0', road: '#8f9ca6', accent: '#ef4444', emblem: 'cross',
    tiers: [
      { name: 'Camilla', kind: 'stretcher' }, { name: 'Silla de ruedas', kind: 'wheelchair' }, { name: 'Scooter médico', kind: 'scooter' },
      { name: 'Ambulancia', kind: 'ambulance' }, { name: 'Ambulancia turbo', kind: 'turbo' },
    ],
    questions: [
      { q: '¿Qué órgano produce la insulina?', ok: 'El páncreas', bad: 'El hígado' },
      { q: '¿Cuál es el hueso más largo del cuerpo?', ok: 'El fémur', bad: 'El húmero' },
      { q: '¿Qué células transportan el oxígeno en la sangre?', ok: 'Glóbulos rojos', bad: 'Glóbulos blancos' },
      { q: '¿Qué vitamina sintetiza la piel con la luz del sol?', ok: 'Vitamina D', bad: 'Vitamina C' },
      { q: 'Frecuencia cardíaca normal de un adulto en reposo', ok: '60 – 100 lpm', bad: '120 – 160 lpm' },
      { q: '¿Qué significan las siglas RCP?', ok: 'Reanimación cardiopulmonar', bad: 'Respiración continua pulmonar' },
      { q: '¿Cuántas cámaras tiene el corazón humano?', ok: 'Cuatro', bad: 'Dos' },
      { q: '¿Qué instrumento mide la presión arterial?', ok: 'Esfigmomanómetro', bad: 'Estetoscopio' },
    ],
  },
  programacion: {
    id: 'programacion', name: 'Programación', icon: '💻', color: '#22c55e', tagline: 'De la patineta al cohete con IA',
    sky: '#0b1220', fog: '#0f1a2e', ground: '#0f2a22', ground2: '#0a1f19', road: '#1b2433', accent: '#22c55e', emblem: 'code',
    tiers: [
      { name: 'Patineta Hello World', kind: 'board' }, { name: 'Scooter for-loop', kind: 'scooter' }, { name: 'Moto Python', kind: 'bike' },
      { name: 'Coche compilado', kind: 'car' }, { name: 'Cohete IA', kind: 'rocket' },
    ],
    questions: [
      { q: 'En Python, ¿qué imprime print(2 + 3)?', ok: '5', bad: '23' },
      { q: '¿Qué estructura repite instrucciones?', ok: 'Un bucle (for / while)', bad: 'Un comentario' },
      { q: '¿Cuál es un lenguaje de marcado?', ok: 'HTML', bad: 'Python' },
      { q: 'En JavaScript, ¿qué compara valor Y tipo?', ok: '===', bad: '=' },
      { q: '¿Qué es un "bug"?', ok: 'Un error en el código', bad: 'Un tipo de variable' },
      { q: '¿Para qué sirve "git commit"?', ok: 'Guardar cambios en el historial', bad: 'Borrar el repositorio' },
      { q: '¿Qué estructura guarda pares clave–valor?', ok: 'Un diccionario / objeto', bad: 'Un bucle while' },
      { q: '¿Qué significa CSS?', ok: 'Cascading Style Sheets', bad: 'Computer Style Software' },
    ],
  },
  filosofia: {
    id: 'filosofia', name: 'Filosofía', icon: '📜', color: '#eab308', tagline: 'De la carreta a la nave de la Razón',
    sky: '#ffd9a0', fog: '#ffe9c7', ground: '#e9d9a8', ground2: '#d8c88f', road: '#a89878', accent: '#eab308', emblem: 'omega',
    tiers: [
      { name: 'Carreta socrática', kind: 'cart' }, { name: 'Cuadriga de Platón', kind: 'chariot' }, { name: 'Vespa de Aristóteles', kind: 'scooter' },
      { name: 'Carruaje de Kant', kind: 'car' }, { name: 'Nave de la Razón', kind: 'rocket' },
    ],
    questions: [
      { q: '¿Quién escribió "La República" y la Alegoría de la Caverna?', ok: 'Platón', bad: 'Aristóteles' },
      { q: '¿Quién fue el maestro de Platón?', ok: 'Sócrates', bad: 'Pitágoras' },
      { q: '"Pienso, luego existo" es de…', ok: 'Descartes', bad: 'Nietzsche' },
      { q: '¿Qué estudia la ética?', ok: 'La moral y el comportamiento', bad: 'Los astros' },
      { q: '¿Qué rama estudia el razonamiento válido?', ok: 'La lógica', bad: 'La estética' },
      { q: 'En la caverna de Platón, las sombras representan…', ok: 'Las apariencias', bad: 'Las ideas verdaderas' },
      { q: '¿Quién escribió "Crítica de la razón pura"?', ok: 'Kant', bad: 'Marx' },
      { q: '"Solo sé que no sé nada" se atribuye a…', ok: 'Sócrates', bad: 'Epicuro' },
    ],
  },
}
export const CLASS_LIST = Object.values(CLASSES)

// Barajar (Fisher–Yates) con el azar del navegador; devuelve una copia
export const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

// Arma las bifurcaciones de una carrera: pregunta, lado correcto al azar y posición en la pista
export function buildForks(cls) {
  return shuffle(cls.questions).slice(0, RACE.forks).map((q, i) => ({ ...q, side: Math.random() < 0.5 ? 'L' : 'R', start: RACE.firstFork + i * RACE.spacing }))
}
