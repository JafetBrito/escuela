// Deutsches Overlay. Deckt bisher nur Header/Menü, die untere Tableiste des
// Dashboards und die Landing Page (vor dem Login) ab — fehlende Schlüssel
// fallen automatisch auf Spanisch zurück (siehe translate() in ../index.js).
export const de = {
  nav: {
    dashboard: 'Dashboard',
    groups: {
      academia: 'Akademie',
      progreso: 'Fortschritt',
      campus: 'Campus',
      comunidad: 'Gemeinschaft',
    },
    items: {
      notas: 'Notizen',
      biblioteca: 'Bibliothek',
      guias: 'Anleitungen',
      ia: 'KI-Werkzeuge',
      herramientas: 'Werkzeuge',
      anuncios: 'Ankündigungen',
      mascota: 'Mein Team',
      arbol: 'Fähigkeitenbaum',
      misiones: 'Missionen',
      logros: 'Erfolge',
      misTareas: 'Meine Aufgaben',
      vr: 'VR-Campus',
      templo: 'Tempel',
      anfiteatro: 'Amphitheater',
      cueva: 'Platons Höhle',
      mundo: '2D-Welt',
      rol: 'Rollenspielwelt',
      games: 'Spiele',
      arena: 'Arena',
      amigos: 'Freunde',
      chats: 'Chats',
      tienda: 'Shop',
    },
    profile: {
      settings: 'Einstellungen',
      signOut: 'Abmelden',
      language: 'Sprache',
    },
    backToDashboard: '← Zurück zum Dashboard',
  },
  dashboard: {
    tabs: { inicio: 'Start', escuelas: 'Schulen', progreso: 'Mein Fortschritt' },
    more: 'Mehr',
  },
  landing: {
    header: { dashboard: 'Mein Dashboard', signOut: 'Abmelden', signIn: 'Anmelden', signUp: 'Konto erstellen' },
    hero: {
      badge: '✨ Wir sind eine Schule · Viele Kurse · Ein einziger Schlüssel',
      titlePrefix: 'Lerne in deinem eigenen Tempo mit',
      subtitle: 'Jeder Kurs hat sein eigenes 3D-KI-Maskottchen, das dich Klasse für Klasse begleitet, deine Fragen beantwortet und dir hilft, am Ball zu bleiben. Hol dir den Hauptschlüssel für alle Kurse oder einen Schlüssel für den Kurs, der dich am meisten interessiert.',
      ctaLoggedIn: 'Zu meinem Dashboard',
      ctaGuest: 'Kostenlos registrieren',
      ctaKey: 'Ich habe bereits meinen Schlüssel',
      guestNote: 'Erstelle dein kostenloses Konto und erhalte Zugang zu allen Kursen — probiere die ersten 2 Klassen jedes Kurses ohne Kreditkarte.',
      statCourses: 'Kurse',
      statAvailable: 'Jetzt verfügbar',
      statMascots: 'KI-Maskottchen',
      statCategories: 'Kategorien',
    },
    howItWorks: {
      title: 'Wie funktioniert es?',
      subtitle: 'Drei Schritte, um noch heute mit dem Lernen zu beginnen.',
    },
    categories: {
      title: 'Kurskategorien',
      subtitle: 'Entdecke, was bereits verfügbar ist und was bald kommt.',
    },
    features: {
      title: 'Alles, was dein Konto enthält',
      subtitle: 'Ein einziges Konto speichert deinen Fortschritt, dein Maskottchen und alles, was du freischaltest.',
    },
    finalCta: {
      title: 'Dein KI-Maskottchen wartet schon auf dich 🐾',
      subtitle: 'Erstelle dein kostenloses Konto und erhalte Zugang zu allen Kursen — die ersten 2 Klassen jedes Kurses sind kostenlos. Hol dir deinen Schlüssel, wenn du den Rest freischalten möchtest.',
      ctaLoggedIn: 'Zu meinem Dashboard',
      ctaGuest: 'Mein Konto erstellen',
      ctaKey: 'Ich habe bereits meinen Schlüssel',
    },
    footer: '© {year} Oliver Academy — Eine Schule, viele Kurse zu entdecken.',
  },
}
