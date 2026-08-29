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

export function localizeMission(mission, lang) {
  if (lang !== 'en' || !mission) return mission
  const en = MISSION_TEXT_EN[mission.id]
  if (!en) return mission
  return { ...mission, title: en.title ?? mission.title, description: en.description ?? mission.description }
}
