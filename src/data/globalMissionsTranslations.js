// English overrides for the fixed global missions catalog — same pattern as
// categoryTranslations.js: a flat dictionary keyed by the mission's stable
// `id`, spread on top of the original entry only when lang === 'en'.
// globalMissionsRegistry.js (and every `checkType`/`checkValue`/`npc` field
// that drives logic) stays untouched.
export const MISSION_TEXT_EN = {
  'habla-con-mascota': {
    title: 'Break the ice',
    description: 'Talk to your mascot at least once to activate its AI.',
  },
  'completa-una-clase': {
    title: 'First step',
    description: 'Complete your first class from any available course.',
  },
  'activa-objeto': {
    title: 'Use your gear',
    description: 'Activate any interactive item from your inventory.',
  },
  'compra-tienda': {
    title: 'Shopping spree',
    description: 'Buy at least one item in the campus Shop.',
  },
  'lee-libro': {
    title: 'Bookworm',
    description: 'Open a book from the campus Library.',
  },
  'cambia-apariencia': {
    title: 'New look',
    description: "Change your Oliver mascot's skin or outfit.",
  },
  'completa-cinco-clases': {
    title: 'On a streak',
    description: 'Complete 5 classes in any combination of courses.',
  },
  'sube-nivel-5': {
    title: 'Established learner',
    description: 'Reach level 5 of experience on the platform.',
  },
}

// French overrides for the same catalog — same pattern as MISSION_TEXT_EN
// above, translated from the Spanish original instead.
export const MISSION_TEXT_FR = {
  'habla-con-mascota': {
    title: 'Brise la glace',
    description: 'Parle à ta mascotte au moins une fois pour activer son IA.',
  },
  'completa-una-clase': {
    title: 'Premier pas',
    description: 'Termine ton premier cours, quel qu\'il soit.',
  },
  'activa-objeto': {
    title: 'Utilise ton équipement',
    description: 'Active un objet interactif de ton inventaire.',
  },
  'compra-tienda': {
    title: 'Séance de shopping',
    description: 'Achète au moins un objet à la Boutique du campus.',
  },
  'lee-libro': {
    title: 'Rat de bibliothèque',
    description: 'Ouvre un livre de la Bibliothèque du campus.',
  },
  'cambia-apariencia': {
    title: 'Nouveau look',
    description: 'Change la peau ou la tenue de ta mascotte Oliver.',
  },
  'completa-cinco-clases': {
    title: 'Sur une lancée',
    description: 'Termine 5 cours, dans n\'importe quelle combinaison.',
  },
  'sube-nivel-5': {
    title: 'Apprenant confirmé',
    description: 'Atteins le niveau 5 d\'expérience sur la plateforme.',
  },
}

// Italian overrides for the same catalog — same pattern as MISSION_TEXT_EN
// above, translated from the Spanish original instead.
export const MISSION_TEXT_IT = {
  'habla-con-mascota': {
    title: 'Rompi il ghiaccio',
    description: 'Parla con la tua mascotte almeno una volta per attivare la sua IA.',
  },
  'completa-una-clase': {
    title: 'Primo passo',
    description: 'Completa la tua prima lezione da un corso qualsiasi.',
  },
  'activa-objeto': {
    title: 'Usa il tuo equipaggiamento',
    description: 'Attiva un oggetto interattivo dal tuo inventario.',
  },
  'compra-tienda': {
    title: 'Sessione di shopping',
    description: 'Compra almeno un oggetto nel Negozio del campus.',
  },
  'lee-libro': {
    title: 'Topo di biblioteca',
    description: 'Apri un libro dalla Biblioteca del campus.',
  },
  'cambia-apariencia': {
    title: 'Nuovo look',
    description: "Cambia la skin o l'abito della tua mascotte Oliver.",
  },
  'completa-cinco-clases': {
    title: 'In serie',
    description: 'Completa 5 lezioni in qualsiasi combinazione di corsi.',
  },
  'sube-nivel-5': {
    title: 'Studente affermato',
    description: "Raggiungi il livello 5 di esperienza sulla piattaforma.",
  },
}

export function localizeMission(mission, lang) {
  if (!mission) return mission
  const overrides = lang === 'en' ? MISSION_TEXT_EN[mission.id] : lang === 'fr' ? MISSION_TEXT_FR[mission.id] : lang === 'it' ? MISSION_TEXT_IT[mission.id] : null
  if (!overrides) return mission
  return { ...mission, title: overrides.title ?? mission.title, description: overrides.description ?? mission.description }
}
