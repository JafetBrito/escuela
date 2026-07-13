// Overlay "Castellano Antiguo" — español arcaico al estilo del Quijote
// (vos/vuestra merced, "agora", "fabla", "otrosí"...). No es un idioma real,
// es un capricho estilístico; misma razón que 'pirata' para usar una clave
// que no es código ISO de 2 letras (nunca se activa por navigator.language,
// solo eligiéndola a mano en el selector). Mismo alcance que los demás
// overlays: header/menú, pestañas del Dashboard y la landing page.
export const antiguo = {
  nav: {
    dashboard: 'Panel de Gobierno',
    groups: {
      academia: 'Academia',
      progreso: 'Adelantamiento',
      campus: 'Campo Escolar',
      comunidad: 'Cofradía',
    },
    items: {
      notas: 'Apuntamientos',
      biblioteca: 'Librería',
      guias: 'Cartapacios',
      ia: 'Artes de la Máquina Pensante',
      herramientas: 'Aparejos',
      anuncios: 'Pregones',
      mascota: 'Mi Fiel Compañero',
      arbol: 'Árbol de Destrezas',
      misiones: 'Empresas',
      logros: 'Hazañas',
      misTareas: 'Mis Faenas',
      vr: 'Campo Fantasmagórico (VR)',
      templo: 'Templo',
      anfiteatro: 'Anfiteatro',
      cueva: 'Cueva del Filósofo Platón',
      mundo: 'Mundo de Dos Dimensiones',
      rol: 'Mundo de Papeles',
      graffiti: 'Calleja de Pinturas',
      games: 'Solaces y Pasatiempos',
      arena: 'Palenque',
      amigos: 'Amigos y Cofrades',
      chats: 'Pláticas',
      tienda: 'Mercadería',
    },
    profile: {
      settings: 'Ordenanzas',
      signOut: 'Partir de Aquí',
      language: 'Fabla',
    },
    backToDashboard: '← Tornar al Panel de Gobierno',
  },
  dashboard: {
    tabs: { inicio: 'Morada', escuelas: 'Academias', progreso: 'Mi Adelantamiento' },
    more: 'Más Cosas',
  },
  landing: {
    header: { dashboard: 'Mi Panel', signOut: 'Partir de Aquí', signIn: 'Entrar', signUp: 'Facer Cofradía' },
    hero: {
      badge: '✨ Somos una cofradía de sabios · Muchas artes que aprender · Una sola llave maestra',
      titlePrefix: 'Aprended, vos, a vuestro propio compás con',
      subtitle: 'Cada arte trae consigo su propio fiel compañero, hecho de figuras y de ingenio, que os acompaña lección tras lección, responde a vuestras dudas y no consiente que perdáis el compás. Conseguid la llave maestra para todas las artes, u una llave sola para el arte que más os plazca.',
      ctaLoggedIn: 'Ir a mi Panel',
      ctaGuest: 'Facer cofradía sin costa',
      ctaKey: 'Ya tengo mi llave, pardiez',
      guestNote: 'Faced cofradía sin costa alguna y entrad en todas las artes — probad las dos primeras lecciones de cada una sin entregar moneda.',
      statCourses: 'Artes',
      statAvailable: 'Prestas agora',
      statMascots: 'Fieles Compañeros',
      statCategories: 'Linajes',
    },
    howItWorks: {
      title: '¿Cómo se gobierna esto?',
      subtitle: 'Tres pasos para comenzar a aprender el día de hoy.',
    },
    categories: {
      title: 'Linajes de las artes',
      subtitle: 'Escudriñad lo que ya está presto y lo que ha de venir.',
    },
    features: {
      title: 'Cuanto trae vuestra cofradía',
      subtitle: 'Una sola cofradía guarda vuestro adelantamiento, vuestro compañero, y cuanto vayáis desatrancando.',
    },
    finalCta: {
      title: 'Vuestro fiel compañero ya os aguarda 🐾',
      subtitle: 'Faced cofradía sin costa y entrad en todas las artes — las dos primeras lecciones de cada una son de balde. Conseguid vuestra llave cuando queráis desatrancar lo demás.',
      ctaLoggedIn: 'Ir a mi Panel',
      ctaGuest: 'Facer mi cofradía',
      ctaKey: 'Ya tengo mi llave, pardiez',
    },
    footer: '© {year} Oliver Academy — Una cofradía, muchas artes por descubrir.',
  },
}
