// Overlay "Pirata" — no es un idioma real, es español con sabor pirata,
// pedido como capricho divertido. Por eso la clave 'pirata' no es un código
// ISO de 2 letras: detectLanguage() solo la activa si el usuario la elige a
// mano en el selector, nunca por navigator.language (ningún navegador se
// identifica como 'pirata'). Mismo alcance que los demás overlays parciales:
// header/menú, la barra de pestañas del Dashboard y la landing page.
export const pirata = {
  nav: {
    dashboard: 'Bitácora',
    groups: {
      academia: 'Tripulación Académica',
      progreso: 'Botín Ganado',
      campus: 'Puerto Base',
      comunidad: 'La Tripulación',
    },
    items: {
      notas: 'Bitácoras',
      biblioteca: 'Cofre de Libros',
      guias: 'Mapas del Tesoro',
      ia: 'Herramientas Mágicas',
      herramientas: 'Herramientas',
      anuncios: 'Pregones',
      mascota: 'Mi Loro y Compañía',
      arbol: 'Árbol de Destrezas',
      misiones: 'Misiones de Alta Mar',
      logros: 'Medallas de Corsario',
      misTareas: 'Mis Faenas',
      vr: 'Campus Fantasma (VR)',
      templo: 'Templo Perdido',
      anfiteatro: 'Anfiteatro Hundido',
      cueva: 'Cueva del Filósofo Platón',
      mundo: 'Isla 2D',
      rol: 'Mundo de Roles',
      games: 'Juegos de Taberna',
      arena: 'Arena de Duelos',
      amigos: 'Compañía de a Bordo',
      chats: 'Cotorreos',
      tienda: 'Mercado Pirata',
    },
    profile: {
      settings: 'Ajustes del Camarote',
      signOut: 'Abandonar el Barco',
      language: 'Lengua',
    },
    backToDashboard: '← Volver a la Bitácora',
  },
  dashboard: {
    tabs: { inicio: 'Cubierta', escuelas: 'Puertos de Saber', progreso: 'Mi Botín' },
    more: 'Más Chatarra',
  },
  landing: {
    header: { dashboard: 'Mi Bitácora', signOut: 'Abandonar el Barco', signIn: 'Subir a Bordo', signUp: 'Enrolarse' },
    hero: {
      badge: '🏴‍☠️ Somos una tripulación de sabios · Muchos tesoros de saber · Una sola llave del cofre',
      titlePrefix: '¡Aprende a tu propio ritmo, marinero, con',
      subtitle: "Cada curso trae su propio loro parlanchín en 3D que te acompaña travesía tras travesía, responde tus dudas de navegante y evita que te pierdas en altamar. Consigue la llave maestra pa' todos los cofres, o una llave pal curso que más codicies.",
      ctaLoggedIn: 'Ir a mi Bitácora',
      ctaGuest: '¡Enrolarme gratis!',
      ctaKey: 'Ya tengo mi llave, cap...',
      guestNote: "Enrólate gratis y sube a bordo de todos los cursos — prueba las primeras 2 travesías de cada uno sin entregar ni una moneda.",
      statCourses: 'Tesoros',
      statAvailable: "Listos pa' zarpar",
      statMascots: 'Loros Parlanchines',
      statCategories: 'Rutas',
    },
    howItWorks: {
      title: '¿Cómo navega este barco?',
      subtitle: "Tres pasos pa' zarpar hoy mismo rumbo al saber.",
    },
    categories: {
      title: 'Rutas del tesoro',
      subtitle: 'Explora los cofres ya abiertos y los que están por descubrirse.',
    },
    features: {
      title: 'Todo lo que trae tu cofre personal',
      subtitle: 'Un solo cofre guarda tu botín, tu loro y todo lo que vayas desenterrando.',
    },
    finalCta: {
      title: 'Tu loro parlanchín ya te espera en el muelle 🦜',
      subtitle: 'Enrólate gratis y sube a bordo de todos los cursos — las primeras 2 travesías de cada uno son gratis. Consigue tu llave cuando quieras el resto del tesoro.',
      ctaLoggedIn: 'Ir a mi Bitácora',
      ctaGuest: '¡Enrolarme, pardiez!',
      ctaKey: 'Ya tengo mi llave, cap...',
    },
    footer: '© {year} Oliver Academy — Una tripulación, muchos tesoros por saquear.',
  },
}
