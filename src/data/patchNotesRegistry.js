// ─── Patch Notes Registry ─────────────────────────────────────────────────
// To release a new version:
//  1. Add a new entry at the TOP of the PATCH_NOTES array
//  2. Update LATEST_VERSION to match
//  The PatchNotesModal shows once per version (gated by localStorage).

export const LATEST_VERSION = '0.3.0'

export const PATCH_NOTES = [
  {
    version: '0.3.0',
    date: '2026-06-18',
    title: 'Campus VR · HUD Black Desert · Tablón de Anuncios',
    emoji: '🏫',
    tag: 'NOVEDAD',
    tagColor: '#22c55e',
    changes: [
      { icon: '🌍', text: 'Campus VR canadiense: edificios, biblioteca, lab de ciencias, Portal Nexus, dormitorios y bosque de arces' },
      { icon: '🎮', text: 'HUD estilo Black Desert Mobile: barra lateral de utilidades, ocultar UI, instrucciones una sola vez' },
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
      { icon: '📜', text: 'Página /misiones con NPC y catálogo de misiones generales estilo WoW' },
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
      { icon: '💰', text: 'Sistema de monedas WoW-style (oro / plata / cobre) con economía de misiones' },
      { icon: '🌍', text: 'Primer mundo VR: Campus universitario canadiense' },
      { icon: '📚', text: 'Biblioteca, Logros, Arena, Games y menú flotante del personaje' },
    ],
  },
]
