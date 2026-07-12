// Tech-Dex / "Bestiario de Código": ficha técnica por curso + "movimiento
// desbloqueado" por módulo (el comando/concepto de esa clase, presentado como
// un ataque/habilidad recién aprendida). Data-driven: agregar un curso = agregar
// una entrada aquí, sin tocar el componente (TechDexPanel).
//
// `moves` está keyeado por module.id. Si un curso no tiene entrada, TechDexPanel
// arma una ficha genérica desde la descripción del curso/módulo.
export const TECH_DEX = {
  'course-bash': {
    name: 'Bash',
    type: 'Terminal / Shell',
    icon: '💻',
    color: '#22c55e',
    stats: [
      { label: 'Dificultad', value: '⭐⭐' },
      { label: 'Velocidad de automatización', value: '⭐⭐⭐⭐⭐' },
      { label: 'Peligro si se usa mal', value: '💀 Alta' },
    ],
    weaknesses: ['Interfaces gráficas', 'La impaciencia', 'Un `rm -rf /` sin pensar'],
    lore: 'Bash (Bourne Again Shell) despertó en 1989 como sucesor del shell de Bourne. Vive en casi todos los servidores del mundo. Domina la terminal y automatizarás en segundos lo que a otros les toma horas — pero un comando mal escrito puede borrarlo todo. Con gran poder…',
    moves: {
      1: { command: 'pwd', name: 'Ubicación', effect: 'Revela tu posición exacta en el sistema de archivos.' },
      2: { command: 'ls · cd', name: 'Exploración', effect: 'Lista el contenido de una carpeta y viaja entre directorios.' },
      3: { command: 'mkdir · rm', name: 'Creación / Destrucción', effect: 'Crea y elimina archivos y carpetas a voluntad.' },
      4: { command: 'cat · echo · >', name: 'Lectura / Escritura', effect: 'Lee archivos, imprime texto y redirige la salida a un archivo.' },
      5: { command: 'grep · find', name: 'Rastreo', effect: 'Encuentra texto dentro de archivos y localiza archivos por nombre.' },
      6: { command: 'chmod · chown', name: 'Control de Acceso', effect: 'Cambia permisos y dueños — decide quién puede tocar qué.' },
      7: { command: '#!/bin/bash', name: 'Automatización', effect: 'Encadena comandos en un script y ejecútalos de un golpe.' },
      8: { command: 'variables · loops', name: 'Lógica', effect: 'Guarda datos y repite acciones: tu script ahora piensa.' },
    },
  },
}

export function getTechDex(courseId) {
  return TECH_DEX[courseId] ?? null
}
