// Semanas temáticas: cada semana del año la plataforma pone una disciplina al
// frente (tarjeta en el Dashboard, cursos destacados y un reto por día). Sin
// intervención, la semana ISO decide el tema (52 semanas ÷ 12 temas, rota);
// un admin puede forzar otro o apagarlo desde DevToolsPanel.
// `categories` son valores de course.category en courses.json; `daily` va de
// lunes (0) a domingo (6).
export const THEMED_WEEKS = [
  { id: 'matematicas', icon: '📐', title: 'Semana de las Matemáticas', color: '#3b82f6', categories: ['Matemáticas', 'Lógica'],
    blurb: 'Números, patrones y demostraciones: la lengua con la que se escribe el universo.',
    daily: ['Lunes de números primos: ¿cuántos hay entre 1 y 50? Cuéntalos.', 'Martes de geometría: dibuja un triángulo y mide sus tres ángulos. ¿Cuánto suman?', 'Miércoles de patrones: completa 1, 1, 2, 3, 5, 8, …', 'Jueves de lógica: si todos los A son B y algunos B son C, ¿todos los A son C?', 'Viernes de cálculo mental: multiplica 15 × 12 sin escribir nada.', 'Sábado de historia: Pitágoras no fue solo el del triángulo — investiga qué más hizo.', 'Domingo de descanso… o resuelve un sudoku.'] },
  { id: 'filosofia', icon: '🏛️', title: 'Semana de la Filosofía', color: '#eab308', categories: ['Filosofía', 'Ética', 'Lógica'],
    blurb: 'Las grandes preguntas: qué es lo justo, lo verdadero y una buena vida.',
    daily: ['Lunes de Sócrates: “solo sé que no sé nada”. ¿Qué crees saber con total seguridad?', 'Martes de ética: ¿es mentir siempre incorrecto? Piensa un caso donde no.', 'Miércoles de la caverna: ¿qué sombras toma por reales la gente hoy?', 'Jueves de lógica: encuentra la falacia en “todo el mundo lo hace, entonces está bien”.', 'Viernes de Aristóteles: ¿qué hábito practicarías para volverte más valiente?', 'Sábado de debate: elige una postura que NO compartas y defiéndela 2 minutos.', 'Domingo de reflexión: ¿qué pregunta te acompañó toda la semana?'] },
  { id: 'historia', icon: '🗺️', title: 'Semana de la Historia', color: '#f97316', categories: ['Historia', 'Antropología', 'Sociología'],
    blurb: 'Entender de dónde venimos para decidir a dónde vamos.',
    daily: ['Lunes antiguo: ¿qué civilización inventó la escritura y por qué?', 'Martes de imperios: nombra tres imperios y qué causó su caída.', 'Miércoles de mapas: ¿cómo cambió el mapa de tu país en 100 años?', 'Jueves de fuentes: ¿en qué se diferencia una fuente primaria de una secundaria?', 'Viernes de inventos: ¿qué invento cambió más la vida cotidiana?', 'Sábado local: pregunta a alguien mayor por un recuerdo histórico de tu ciudad.', 'Domingo: elige un personaje histórico y escribe por qué lo admiras.'] },
  { id: 'ciberseguridad', icon: '🔐', title: 'Semana de la Ciberseguridad', color: '#14b8a6', categories: ['Ciberseguridad', 'Alfabetización Digital'],
    blurb: 'Protege tu identidad, tus cuentas y tus datos.',
    daily: ['Lunes de contraseñas: cambia una débil por una frase larga.', 'Martes de phishing: revisa tu correo y encuentra un mensaje sospechoso.', 'Miércoles de 2FA: activa la verificación en dos pasos en una cuenta.', 'Jueves de privacidad: revisa qué apps tienen acceso a tu ubicación.', 'Viernes de redes: ¿por qué no conviene usar WiFi público sin cuidado?', 'Sábado de respaldos: haz copia de un archivo importante.', 'Domingo: enseña a alguien de tu familia una regla de seguridad.'] },
  { id: 'ia', icon: '🧠', title: 'Semana de la Inteligencia Artificial', color: '#84cc16', categories: ['Inteligencia Artificial', 'Claude para Todos', 'Productividad'],
    blurb: 'Aprende a trabajar CON la IA: preguntar mejor, verificar y crear.',
    daily: ['Lunes de prompts: reescribe una pregunta vaga dándole rol, tarea y formato.', 'Martes de verificación: pide a una IA un dato y compruébalo en otra fuente.', 'Miércoles de automatización: ¿qué tarea repetitiva podrías delegar?', 'Jueves de ética: ¿cuándo NO deberías usar IA para una tarea escolar?', 'Viernes creativo: pide un poema y edítalo hasta que suene a ti.', 'Sábado de límites: encuentra algo que la IA responda mal.', 'Domingo: explica con tus palabras qué es un modelo de lenguaje.'] },
  { id: 'medicina', icon: '🩺', title: 'Semana de la Medicina', color: '#10b981', categories: ['Medicina', 'Neurociencia', 'Biología'],
    blurb: 'El cuerpo humano, la salud y cómo cuidarlos.',
    daily: ['Lunes de anatomía: nombra 5 huesos del cuerpo y dónde están.', 'Martes del corazón: mide tu pulso en reposo durante 30 s y multiplica ×2.', 'Miércoles de nutrición: ¿qué tiene tu plato favorito de cada grupo alimenticio?', 'Jueves de neurociencia: ¿por qué dormir bien ayuda a aprender?', 'Viernes de primeros auxilios: ¿qué harías ante un corte pequeño?', 'Sábado de prevención: agenda o recuerda tu próxima revisión médica.', 'Domingo: 10 minutos de estiramiento y una respiración lenta.'] },
  { id: 'idiomas', icon: '🌍', title: 'Semana de los Idiomas', color: '#0ea5e9', categories: ['Idiomas', 'China', 'Literatura'],
    blurb: 'Cada idioma es una nueva forma de pensar.',
    daily: ['Lunes: aprende a saludar en un idioma que no hables.', 'Martes: nombra 5 objetos de tu cuarto en inglés.', 'Miércoles: busca una palabra que no se traduzca a tu idioma.', 'Jueves: escucha una canción en otro idioma y anota 3 palabras.', 'Viernes: escribe una frase con 3 palabras nuevas de la semana.', 'Sábado: ve un video corto en otro idioma con subtítulos.', 'Domingo: presenta en voz alta quién eres en el idioma que estudias.'] },
  { id: 'ciencias', icon: '🔬', title: 'Semana de las Ciencias', color: '#8b5cf6', categories: ['Física', 'Química', 'Biología', 'Astronomía'],
    blurb: 'Preguntar, experimentar y comprobar: el método científico en acción.',
    daily: ['Lunes de física: deja caer dos objetos distintos a la vez. ¿Cuál llega primero?', 'Martes de química: ¿qué pasa al mezclar vinagre con bicarbonato? (con cuidado)', 'Miércoles de biología: observa una planta y anota 3 detalles.', 'Jueves de astronomía: busca esta noche la Luna y anota su fase.', 'Viernes de método: formula una hipótesis sobre algo cotidiano.', 'Sábado de laboratorio: prueba tu hipótesis con un mini-experimento.', 'Domingo: escribe qué aprendiste de tu experimento.'] },
  { id: 'arte', icon: '🎨', title: 'Semana del Arte y la Literatura', color: '#ec4899', categories: ['Arte', 'Diseño', 'Literatura', 'Artes Escénicas y Música'],
    blurb: 'Crear, leer y expresarse.',
    daily: ['Lunes de dibujo: dibuja un objeto sin despegar el lápiz.', 'Martes de lectura: lee un poema corto en voz alta.', 'Miércoles de color: elige una paleta de 3 colores para tu estado de ánimo.', 'Jueves de música: identifica el ritmo de tu canción favorita.', 'Viernes de escritura: escribe un cuento de 6 palabras.', 'Sábado de teatro: actúa una escena de tu vida en 1 minuto.', 'Domingo: comparte algo que creaste esta semana.'] },
  { id: 'economia', icon: '📈', title: 'Semana de la Economía y los Negocios', color: '#22c55e', categories: ['Economía', 'Estrategia', 'Derecho'],
    blurb: 'Dinero, decisiones y cómo se organiza una sociedad.',
    daily: ['Lunes de presupuesto: anota en qué gastaste hoy.', 'Martes de oferta y demanda: ¿por qué sube el precio de lo escaso?', 'Miércoles de ahorro: define una meta pequeña y su plazo.', 'Jueves de derechos: nombra 3 derechos que tienes como estudiante.', 'Viernes de negocios: imagina un producto que resuelva un problema tuyo.', 'Sábado de estrategia: ¿qué harías si tu idea fallara?', 'Domingo: revisa tu semana de gastos.'] },
  { id: 'programacion', icon: '💻', title: 'Semana de la Programación', color: '#06b6d4', categories: ['Programación', 'Ingeniería'],
    blurb: 'Pensar en pasos y darle instrucciones a una computadora.',
    daily: ['Lunes de algoritmos: escribe los pasos para preparar un té.', 'Martes de variables: ¿qué valor guardarías en “edad”, “nombre” y “esEstudiante”?', 'Miércoles de condicionales: escribe “si llueve… si no…” para tu día.', 'Jueves de bucles: ¿qué tarea repites 5 veces al día?', 'Viernes de depuración: ¿cómo encuentras el error en una receta que salió mal?', 'Sábado: escribe tu primer “Hola, mundo”.', 'Domingo: explica qué es un programa a alguien que no sabe.'] },
  { id: 'psicologia', icon: '🧩', title: 'Semana de la Mente y la Sociedad', color: '#a78bfa', categories: ['Ciencias Sociales', 'Neurociencia', 'Educación', 'Comunicación y Medios'],
    blurb: 'Cómo pensamos, aprendemos y nos comunicamos.',
    daily: ['Lunes de emociones: nombra con precisión cómo te sientes ahora.', 'Martes de sesgos: ¿en qué momento decidiste rápido y te equivocaste?', 'Miércoles de aprendizaje: prueba explicar algo en voz alta para memorizarlo.', 'Jueves de comunicación: reformula una queja como petición.', 'Viernes de medios: ¿quién produjo la noticia que leíste y con qué intención?', 'Sábado de empatía: escucha 5 minutos a alguien sin interrumpir.', 'Domingo: anota tres cosas que salieron bien esta semana.'] },
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
