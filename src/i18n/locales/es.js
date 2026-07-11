// Locale base (español). La escuela está autorada en español, así que este
// archivo es la fuente de verdad: toda clave debe existir aquí. Los demás
// idiomas (en.js, etc.) son overlays — una clave que les falte cae a esta.
//
// Para agregar texto traducible: añade la clave aquí, su traducción en cada
// otro locale, y usa `t('ruta.de.la.clave')` en el componente.
export const es = {
  nav: {
    dashboard: 'Dashboard',
    groups: {
      academia: 'Academia',
      progreso: 'Progreso',
      campus: 'Campus',
      comunidad: 'Comunidad',
    },
    items: {
      notas: 'Notas',
      biblioteca: 'Librería',
      guias: 'Guías',
      ia: 'IA Tools',
      herramientas: 'Herramientas',
      anuncios: 'Anuncios',
      mascota: 'Mi Equipo',
      arbol: 'Árbol',
      misiones: 'Misiones',
      logros: 'Logros',
      misTareas: 'Mis Tareas',
      vr: 'VR',
      mundo: 'Mundo 2D',
      rol: 'Mundo ROL',
      graffiti: 'Calle Graffiti',
      games: 'Games',
      arena: 'Arena',
      amigos: 'Amigos',
      chats: 'Chats',
      tienda: 'Tienda',
    },
    profile: {
      settings: 'Ajustes',
      signOut: 'Cerrar sesión',
      language: 'Idioma',
    },
    backToDashboard: '← Volver al Dashboard',
  },
}
