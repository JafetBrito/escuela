// Overlay en català. Només cobreix la capçalera/menú, la barra de pestanyes
// inferior del Dashboard i la landing page (abans d'iniciar sessió) — les
// claus que falten cauen al castellà automàticament (veure translate() a
// ../index.js).
export const ca = {
  nav: {
    dashboard: 'Tauler',
    groups: {
      academia: 'Acadèmia',
      progreso: 'Progrés',
      campus: 'Campus',
      comunidad: 'Comunitat',
    },
    items: {
      notas: 'Notes',
      biblioteca: 'Biblioteca',
      guias: 'Guies',
      ia: 'Eines IA',
      herramientas: 'Eines',
      anuncios: 'Anuncis',
      mascota: 'El Meu Equip',
      arbol: "Arbre d'Habilitats",
      misiones: 'Missions',
      logros: 'Assoliments',
      misTareas: 'Les Meves Tasques',
      vr: 'Campus VR',
      templo: 'Temple',
      anfiteatro: 'Amfiteatre',
      cueva: 'Cova de Plató',
      mundo: 'Món 2D',
      rol: 'Món de Rol',
      games: 'Jocs',
      arena: 'Arena',
      amigos: 'Amics',
      chats: 'Xats',
      tienda: 'Botiga',
    },
    profile: {
      settings: 'Configuració',
      signOut: 'Tancar sessió',
      language: 'Idioma',
    },
    backToDashboard: '← Tornar al Tauler',
  },
  dashboard: {
    tabs: { inicio: 'Inici', escuelas: 'Escoles', progreso: 'El Meu Progrés' },
    more: 'Més',
  },
  landing: {
    header: { dashboard: 'El Meu Tauler', signOut: 'Tancar sessió', signIn: 'Iniciar sessió', signUp: 'Crear compte' },
    hero: {
      badge: '✨ Som una escola · Molts cursos · Una sola clau',
      titlePrefix: 'Aprèn al teu ritme amb',
      subtitle: "Cada curs té la seva pròpia mascota IA en 3D que t'acompanya classe per classe, respon els teus dubtes i t'ajuda a no perdre el ritme. Aconsegueix la teva clau mestra per a tots els cursos, o una clau per al curs que més t'interessi.",
      ctaLoggedIn: 'Anar al meu Tauler',
      ctaGuest: 'Registrar-me gratis',
      ctaKey: 'Ja tinc la meva clau',
      guestNote: 'Crea el teu compte gratis i entra a tots els cursos — prova les primeres 2 classes de cadascun sense targeta.',
      statCourses: 'Cursos',
      statAvailable: 'Disponibles ara',
      statMascots: 'Mascotes IA',
      statCategories: 'Categories',
    },
    howItWorks: {
      title: 'Com funciona?',
      subtitle: 'Tres passos per començar a aprendre avui mateix.',
    },
    categories: {
      title: 'Categories de cursos',
      subtitle: 'Explora el que ja està disponible i el que vindrà properament.',
    },
    features: {
      title: 'Tot el que inclou el teu compte',
      subtitle: 'Un sol compte guarda el teu progrés, la teva mascota i tot el que vagis desbloquejant.',
    },
    finalCta: {
      title: "La teva mascota IA ja t'està esperant 🐾",
      subtitle: "Crea el teu compte gratis i entra a tots els cursos — les primeres 2 classes de cadascun són gratuïtes. Aconsegueix la teva clau quan vulguis desbloquejar la resta.",
      ctaLoggedIn: 'Anar al meu Tauler',
      ctaGuest: 'Crear el meu compte',
      ctaKey: 'Ja tinc la meva clau',
    },
    footer: '© {year} Oliver Academy — Una escola, molts cursos per explorar.',
  },
}
