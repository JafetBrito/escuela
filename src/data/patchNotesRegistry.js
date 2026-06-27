// ─── Patch Notes Registry ─────────────────────────────────────────────────
// To release a new version:
//  1. Add a new entry at the TOP of PATCH_NOTES_ALL (full history, newest first)
//  2. Update LATEST_VERSION to match
//  The PatchNotesModal only renders PATCH_NOTES (the 5 most recent — that tab
//  strip would grow forever otherwise). Older entries slide automatically
//  into PATCH_NOTES_ARCHIVE: still here, still real data, just not rendered
//  anywhere — nothing is deleted, the modal just stops indexing it.

export const LATEST_VERSION = '0.10.0'

const PATCH_NOTES_ALL = [
  {
    version: '0.10.0',
    date: '2026-06-26',
    title: 'Templo: Oliver se une a la aventura',
    emoji: '🐱',
    tag: 'NOVEDAD',
    tagColor: '#22c55e',
    changes: [
      { icon: '🐱', text: 'Oliver (el gato naranja) ahora aparece en el Templo junto a Jafet: Jafet te da la bienvenida, y de ahí en adelante es Oliver quien te da las misiones.' },
      { icon: '⚔️', text: 'Pantalla de selección de clase renovada en el Templo, con barras de estadísticas y habilidades — y Oliver comentando cada clase antes de que decidas.' },
      { icon: '✨', text: '"Prueba tus habilidades" ya no es solo una tarjeta para leer: ahora activas cada una de tus 2 habilidades iniciales y ves su efecto en el mundo.' },
    ],
  },
  {
    version: '0.9.0',
    date: '2026-06-24',
    title: 'HUD Renovada · Menús de Mascota y Avatar Separados · Mundo Sincronizado',
    emoji: '⚙️',
    tag: 'ACTUALIZACIÓN',
    tagColor: '#3b82f6',
    changes: [
      { icon: '⚙️', text: 'Nuevo botón de Ajustes en la HUD del mundo VR: cámara y controles, interfaz, y una referencia de atajos de teclado, todo en un solo lugar bien organizado.' },
      { icon: '👁️', text: 'El botón de ocultar interfaz ahora sí esconde TODO: chat, voz, mascota flotante y controles táctiles, no solo el HUD principal.' },
      { icon: '🐱', text: 'Sistema de rescate: si caes al vacío en una zona incompleta del mapa, Oliver aparece a rescatarte y te regresa a la Gran Aula, anunciándolo a todo el servidor.' },
      { icon: '🔊', text: 'El chat ahora se lee en voz alta para todos los jugadores, no solo para quien escribe.' },
      { icon: '👥', text: 'Amigos y Arena ahora abren ventanas dentro del mundo VR en vez de sacarte a otra página.' },
      { icon: '🎒', text: 'Las bolsas ya no tapan toda la pantalla, y se corrigió un error que bloqueaba objetos iniciales si aún no elegías clase.' },
      { icon: '🧑‍🎨', text: 'El menú de tu Mascota y el de tu Avatar ahora están completamente separados — cada uno con su propio modelo 3D, equipo, árbol, bolsas, apariencia, libros, notas y estadísticas.' },
      { icon: '🌦️', text: 'Los cambios de hora y clima que haga un administrador ya se ven en tiempo real para todos los jugadores conectados, no solo en su propia pantalla.' },
      { icon: '🚶', text: 'Cambiar entre Avatar y Mascota ya no los encoge ni agranda — y el Avatar se ve un poco más grande que antes.' },
    ],
  },
  {
    version: '0.8.0',
    date: '2026-06-23',
    title: 'Ficha de Personaje · Nuevo Avatar · Curso para Adultos Mayores',
    emoji: '🧑‍🎨',
    tag: 'NOVEDAD',
    tagColor: '#22c55e',
    changes: [
      { icon: '🧑‍🎨', text: 'Ficha de personaje estilo RPG clásico: tu modelo 3D al centro, slots de equipo a los lados y bolsas con objetos que arrastras directo a su slot para equiparlos.' },
      { icon: '🚶', text: 'Avatar completamente nuevo: ya eliges entre modelo de Hombre o Mujer al crear tu cuenta, con un cuerpo 3D real en el mundo VR (antes eran figuras geométricas de prueba).' },
      { icon: '🐾', text: '4 mascotas nuevas para elegir en el Árbol del Mundo: Ajo, Toro, Gato y Búho.' },
      { icon: '🎓', text: 'Nuevo curso accesible para adultos mayores: aprende a usar un asistente de inteligencia artificial conversacional en tu día a día, sin mundos virtuales, a tu ritmo y en el orden que prefieras.' },
      { icon: '🎯', text: 'Nueva pestaña "Misiones" en el menú de tu mascota: ve de un vistazo qué te falta completar de cada clase.' },
      { icon: '☁️', text: 'Corrección: el progreso ahora se guarda de forma confiable en la nube en cada partida, sin importar cuándo se creó tu cuenta.' },
    ],
  },
  {
    version: '0.7.0',
    date: '2026-06-22',
    title: 'Sistema de Equipo · Menú de Personaje',
    emoji: '🎒',
    tag: 'NOVEDAD',
    tagColor: '#22c55e',
    changes: [
      { icon: '🎒', text: 'Sistema de equipo por slots, como en los RPG de rol clásicos: tu Avatar puede equipar cabeza, pecho, guantes, botas y arma; tu Mascota gorro, accesorio, arma y mochila.' },
      { icon: '🧑', text: 'Menú de personaje rediseñado: pestañas separadas para tu Avatar y tu Mascota, cada una con su propio árbol de habilidades y su propio equipo.' },
      { icon: '🎒', text: 'Nuevo panel de "Bolsas" en la HUD del mundo VR: una cuadrícula rápida de todos tus objetos desbloqueados para equipar o quitar con un clic, sin salir del juego.' },
      { icon: '📱', text: 'El arma equipada (por ejemplo, el Teléfono del Hacker) sigue siendo la que activa tu acción especial en el mundo VR.' },
    ],
  },
  {
    version: '0.6.0',
    date: '2026-06-22',
    title: 'Oliver Academy · Clase Hacker · Nivel 99',
    emoji: '🕶️',
    tag: 'NOVEDAD',
    tagColor: '#22c55e',
    changes: [
      { icon: '🎓', text: 'Nuevo nombre: ¡bienvenidos a Oliver Academy!' },
      { icon: '🕶️', text: 'Clase Hacker en el Árbol del Mundo, con árbol de habilidades propio hasta nivel 28 (próximamente más allá de ese nivel).' },
      { icon: '⭐', text: 'Nivel máximo subido de 90 a 99: ahora cada subida de nivel otorga un punto de habilidad, como en los RPG de acción clásicos.' },
      { icon: '📱', text: 'Sistema de arma equipable: tu Teléfono es tu herramienta principal, cambiable por modelos mejores con más estadísticas.' },
      { icon: '🏆', text: 'Nuevos logros cada 10 niveles, más un logro secreto para los primeros 100 jugadores en llegar a nivel 28 antes de 2027.' },
      { icon: '🖐️', text: 'Ajustes → Interfaz: ajusta el tamaño de los elementos flotantes (Radio, Cámara) a tu gusto.' },
      { icon: '🔧', text: 'Corrección: el Árbol del Mundo ya no hace caer al jugador sin parar ni bloquea la selección de clase.' },
      { icon: '⌨️', text: 'Corrección: en Janulingo, el teclado del móvil ya no se abre solo — ahora espera a que toques el campo de texto.' },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-06-19',
    title: 'Janulingo · Ajedrez · Aprende Idiomas',
    emoji: '🧩',
    tag: 'NOVEDAD',
    tagColor: '#22c55e',
    changes: [
      { icon: '🧩', text: 'Janulingo: mini-app completa de idiomas con portada, selección de idioma, mapa de niveles por etapas y motor de bloques. Ordena Estructura + Verbo + Objeto para construir frases. Inglés (2 niveles), Francés y Catalán.' },
      { icon: '🔊', text: 'Audio nativo por idioma: selección automática de voz del sistema para cada lengua (corrige el bug que leía catalán con acento inglés). Controles de velocidad 🐌 0.5× / 🚶 0.75× / 🏃 1×.' },
      { icon: '🌍', text: 'Aprende Idiomas: juego de adivinar palabras con emojis con sistema de pistas progresivas de Oliver, pronuciación con Web Speech API y sistema de puntos.' },
      { icon: '♟️', text: 'Ajedrez con tablero completo, modo vs IA (un ply) y modo 2 jugadores. Destaque de último movimiento, detección de jaque/jaque mate/tablas.' },
      { icon: '🐱', text: 'Oliver como oráculo de pistas en ambos juegos: revela estructura, letras y pronunciación de forma progresiva para no arruinar el reto.' },
    ],
  },
  {
    version: '0.4.0',
    date: '2026-06-18',
    title: 'Nav con Dropdowns · Ciclo Día/Noche · Linterna',
    emoji: '🌙',
    tag: 'ACTUALIZACIÓN',
    tagColor: '#a855f7',
    changes: [
      { icon: '🧭', text: 'Navegación rediseñada: 6 grupos con dropdowns (Academia, Progreso, Campus, Comunidad) · Ajustes y Cerrar sesión en el menú de perfil' },
      { icon: '🌙', text: 'Ciclo día/noche en el campus VR: sol que orbita, 8 faroles con fade al anochecer, cielo dinámico con amanecer / día / atardecer / noche' },
      { icon: '✨', text: 'Estilo cozy: efectos Bloom y Vignette en mascota, avatar y campus · iluminación cálida en tonos ámbar' },
      { icon: '🔦', text: 'Nueva Linterna en la Tienda (3 000 monedas) · actívala en el VR con la tecla F para proyectar un cono de luz desde tu perspectiva' },
      { icon: '🕐', text: 'El reloj del HUD VR ahora muestra la hora real del sistema en lugar del tiempo del juego' },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-06-18',
    title: 'Campus VR · Nueva HUD · Tablón de Anuncios',
    emoji: '🏫',
    tag: 'NOVEDAD',
    tagColor: '#22c55e',
    changes: [
      { icon: '🌍', text: 'Campus VR canadiense: edificios, biblioteca, lab de ciencias, Portal Nexus, dormitorios y bosque de arces' },
      { icon: '🎮', text: 'HUD compacta tipo MMO móvil: barra lateral de utilidades, ocultar UI, instrucciones una sola vez' },
      { icon: '🐱', text: 'NPCs parlantes: Oliver, Albert Einstein y Jafet con burbujas de diálogo por proximidad' },
      { icon: '🌀', text: 'Cuatro mundos: Campus, Mi Room (cabaña), Anfiteatro y Árbol del Mundo' },
      { icon: '🎁', text: 'Recompensas diarias con sistema de racha de 7 días' },
      { icon: '📋', text: 'Tablón de anuncios: patch notes y novedades accesibles desde cualquier página' },
      { icon: '🔧', text: 'Corrección: mundo VR ya no se congela al entrar (colisión trimesh reemplazada por Rapier CuboidCollider)' },
    ],
  },
  {
    version: '0.2.5',
    date: '2026-06-01',
    title: 'Misiones NPC · Notas · Apariencia',
    emoji: '📜',
    tag: 'ACTUALIZACIÓN',
    tagColor: '#3b82f6',
    changes: [
      { icon: '📜', text: 'Página /misiones con NPC y catálogo de misiones generales por recompensa' },
      { icon: '📝', text: 'Página /notas rediseñada con sección de integración Notion' },
      { icon: '🎨', text: 'Pestaña "Apariencia" en el menú flotante del personaje (selector de mascota + skins)' },
      { icon: '🏆', text: 'Logros rediseñados: categorías, secretos, toast con sonido' },
      { icon: '💬', text: 'Chat del mundo rediseñado: siempre visible, susurros (/w), mensajes de sistema' },
      { icon: '🔒', text: 'Galería se oculta hasta comprar la Cámara en la Tienda' },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-05-01',
    title: 'Árbol del Mundo · Anfiteatro · Multiplayer',
    emoji: '🌳',
    tag: 'ACTUALIZACIÓN',
    tagColor: '#3b82f6',
    changes: [
      { icon: '🌳', text: 'Árbol del Mundo: selección de clase con nodos mágicos (programador, cyber, IA, diseñador, filósofo)' },
      { icon: '🎭', text: 'Anfiteatro Oliver: teatro con butacas, escenario, pantalla y telones' },
      { icon: '👥', text: 'Multiplayer en tiempo real: ver otros jugadores en el campus con nombres flotantes' },
      { icon: '⚔️', text: 'Sistema de combate por turnos y habilidades con cooldown circular' },
      { icon: '🗺️', text: 'Mapa del campus con posición en tiempo real del jugador' },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-04-01',
    title: 'Lanzamiento Alpha',
    emoji: '🚀',
    tag: 'LANZAMIENTO',
    tagColor: '#f97316',
    changes: [
      { icon: '🎓', text: 'Plataforma educativa inmersiva con cursos interactivos y videos' },
      { icon: '🐱', text: 'Mascota 3D (naranja, negra, robot, dragón) con niveles, XP y tienda' },
      { icon: '💰', text: 'Sistema de monedas por denominaciones (oro / plata / cobre) con economía de misiones' },
      { icon: '🌍', text: 'Primer mundo VR: Campus universitario canadiense' },
      { icon: '📚', text: 'Biblioteca, Logros, Arena, Games y menú flotante del personaje' },
    ],
  },
]

// What the PatchNotesModal actually renders — newest 5 only.
export const PATCH_NOTES = PATCH_NOTES_ALL.slice(0, 5)

// Everything older — kept as real data (nothing deleted), just not surfaced
// in the modal's tab strip. Read this if you ever need the full history.
export const PATCH_NOTES_ARCHIVE = PATCH_NOTES_ALL.slice(5)
