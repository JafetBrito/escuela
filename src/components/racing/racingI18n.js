// Idiomas de Oliver Racing: cadenas de la interfaz en es/en/fr (`es` es la base y el fallback, igual que el resto de la app) y ayudas
// para leer el CONTENIDO (mundos, misiones, preguntas) en el idioma actual: cada objeto puede traer `i18n: { en: {...}, fr: {...} }`
// con los mismos campos; lo que falte se muestra en español. Para traducir una pregunta, agrega su `i18n` en racingData.js (o desde
// el editor de preguntas cuando exista).
import { L } from './racingData'

const S = {
  es: {
    back: '← Volver', demo: 'demo', pick: 'Elige un mundo y recorre sus misiones. En cada bifurcación aparece una pregunta con 2 o 3 respuestas, una por carril: acierta y tu vehículo mejora; si caes en la trampa, bajas un nivel. Las preguntas se hacen más difíciles según tu vehículo.',
    mission: 'Misión', questionsN: 'preguntas', vehicles: 'vehículos', go: '¡A correr en', controls: 'W / ↑ acelerar · S / ↓ frenar · ← → girar · Espacio derrapar · clic en una respuesta (o 1 2 3) para saltar a su carril, una vez por pregunta',
    music: 'Música', voice: 'Locutor', exit: '✕ Salir', question: 'Pregunta', forkIn: 'bifurcación en', locked: '¡carril fijado!', listening: 'Escuchando la pregunta… el vehículo espera en el pórtico',
    jumpHint: 'Toca una respuesta para saltar a su carril (solo una vez)', jumpUsed: 'Ya usaste tu salto en esta pregunta', correct: '¡Correcto!', answerWas: 'La respuesta era', fact: 'Dato curioso',
    cont: 'Continuar', review: 'Ruta de repaso', backTrack: 'Volver a la pista', thinkFirst: 'Piensa un momento antes de seguir.', reviewTitle: 'Repasemos esta respuesta',
    done: '¡Recorrido completo!', hits: 'aciertos', traps: 'trampas', points: 'puntos', time: 'tiempo', finalVehicle: 'Vehículo final', again: 'Otra vez', changeWorld: 'Cambiar de mundo',
    gas: 'ACELERAR', brake: 'FRENO', drift: 'DERRAPE', auto: 'Auto', manual: 'Manual', paused: 'En pausa', upgrade: 'Mejora', speed: 'km/h', tierUp: 'Tu vehículo mejora', tierDown: 'Bajas a', stopHint: 'Mantén ACELERAR (o W) para avanzar: si sueltas, te detienes.',
  },
  en: {
    back: '← Back', demo: 'demo', pick: 'Pick a world and drive its missions. At each fork a question appears with 2 or 3 answers, one per lane: get it right and your vehicle upgrades; fall into the trap and you drop a level. Questions get harder with your vehicle.',
    mission: 'Mission', questionsN: 'questions', vehicles: 'vehicles', go: 'Race in', controls: 'W / ↑ accelerate · S / ↓ brake · ← → steer · Space drift · click an answer (or 1 2 3) to jump to its lane, once per question',
    music: 'Music', voice: 'Announcer', exit: '✕ Exit', question: 'Question', forkIn: 'fork in', locked: 'lane locked!', listening: 'Listening to the question… your vehicle waits at the gate',
    jumpHint: 'Tap an answer to jump to its lane (once only)', jumpUsed: 'You already used your jump on this question', correct: 'Correct!', answerWas: 'The answer was', fact: 'Fun fact',
    cont: 'Continue', review: 'Review route', backTrack: 'Back to the track', thinkFirst: 'Think for a moment before moving on.', reviewTitle: "Let's review this answer",
    done: 'Run complete!', hits: 'correct', traps: 'traps', points: 'points', time: 'time', finalVehicle: 'Final vehicle', again: 'Again', changeWorld: 'Change world',
    gas: 'GAS', brake: 'BRAKE', drift: 'DRIFT', auto: 'Auto', manual: 'Manual', paused: 'Paused', upgrade: 'Upgrade', speed: 'km/h', tierUp: 'Your vehicle upgrades', tierDown: 'You drop to', stopHint: 'Hold GAS (or W) to move: let go and you stop.',
  },
  fr: {
    back: '← Retour', demo: 'démo', pick: "Choisis un monde et parcours ses missions. À chaque bifurcation, une question avec 2 ou 3 réponses, une par voie : réponds juste et ton véhicule s'améliore ; tombe dans le piège et tu perds un niveau. Les questions se corsent avec ton véhicule.",
    mission: 'Mission', questionsN: 'questions', vehicles: 'véhicules', go: 'Courir en', controls: 'W / ↑ accélérer · S / ↓ freiner · ← → tourner · Espace déraper · clique une réponse (ou 1 2 3) pour sauter sur sa voie, une fois par question',
    music: 'Musique', voice: 'Présentateur', exit: '✕ Quitter', question: 'Question', forkIn: 'bifurcation dans', locked: 'voie verrouillée !', listening: 'Écoute de la question… ton véhicule attend au portique',
    jumpHint: 'Touche une réponse pour sauter sur sa voie (une seule fois)', jumpUsed: 'Tu as déjà utilisé ton saut pour cette question', correct: 'Correct !', answerWas: 'La réponse était', fact: 'Le savais-tu ?',
    cont: 'Continuer', review: 'Parcours de révision', backTrack: 'Retour à la piste', thinkFirst: 'Réfléchis un instant avant de continuer.', reviewTitle: 'Révisons cette réponse',
    done: 'Parcours terminé !', hits: 'justes', traps: 'pièges', points: 'points', time: 'temps', finalVehicle: 'Véhicule final', again: 'Encore', changeWorld: 'Changer de monde',
    gas: 'ACCÉLÉRER', brake: 'FREIN', drift: 'DÉRAPAGE', auto: 'Auto', manual: 'Manuel', paused: 'En pause', upgrade: 'Amélioration', speed: 'km/h', tierUp: 'Ton véhicule s’améliore', tierDown: 'Tu redescends à', stopHint: 'Maintiens ACCÉLÉRER (ou W) pour avancer : si tu lâches, tu t’arrêtes.',
  },
}
// Fase 2: garaje, poderes y ruta de repaso
const S2 = {
  es: {
    garage: 'Garaje', race: '¡A correr!', level: 'Nivel', xp: 'XP', runsN: 'carreras', bestScore: 'mejor puntaje', unlocked: 'Desbloqueado', lockedV: 'Bloqueado', lockedHint: 'Llega a este vehículo en una carrera para desbloquearlo', startWith: 'Empezar con', speedStat: 'Velocidad', flies: '✈️ Vuela',
    customize: 'Personalizar', paint: 'Pintura', glowC: 'Luces', accessory: 'Accesorio', resetC: 'Restablecer', acc_none: 'Ninguno', acc_flag: 'Bandera', acc_antenna: 'Antena', acc_wings: 'Alerones', presets: 'Colores del mundo',
    choosePower: 'Elige un poder para esta misión', pw_shield: 'Escudo', pw_hint: 'Pista', pw_nitro: 'Nitro', pw_jump: 'Salto extra',
    pwd_shield: 'Absorbe la próxima trampa.', pwd_hint: 'Marca la respuesta correcta de esta pregunta.', pwd_nitro: 'Turbo de 3 segundos.', pwd_jump: 'Te da otro salto en esta pregunta.',
    powers: 'Poderes', shieldUsed: '¡El escudo te salvó!', visitRoute: 'Visitar ruta de repaso', routeFull: 'Ruta de repaso', station: 'Estación', skipStation: 'Siguiente ▶', backRace: 'Volver a la carrera', routeHold: 'Escuchando la estación… tu vehículo espera',
    routeIntro: 'Bienvenido a la ruta de repaso. Vamos a ver esta respuesta con calma, estación por estación.', routeAnswer: 'La respuesta correcta', routeExplain: 'Explicación', routeOthers: 'Por qué las otras opciones no', routeRemember: 'Para recordar',
    othersText: 'Las otras opciones eran', notCorrect: 'y no son correctas', levelUp: '¡Subiste de nivel!', newVehicle: 'Vehículo desbloqueado', xpGain: 'XP ganada', menu: 'Menú', viewRoute: 'Ver explicación',
  },
  en: {
    garage: 'Garage', race: 'Race!', level: 'Level', xp: 'XP', runsN: 'runs', bestScore: 'best score', unlocked: 'Unlocked', lockedV: 'Locked', lockedHint: 'Reach this vehicle in a run to unlock it', startWith: 'Start with', speedStat: 'Speed', flies: '✈️ Flies',
    customize: 'Customize', paint: 'Paint', glowC: 'Lights', accessory: 'Accessory', resetC: 'Reset', acc_none: 'None', acc_flag: 'Flag', acc_antenna: 'Antenna', acc_wings: 'Wings', presets: 'World colors',
    choosePower: 'Choose a power for this mission', pw_shield: 'Shield', pw_hint: 'Hint', pw_nitro: 'Nitro', pw_jump: 'Extra jump',
    pwd_shield: 'Absorbs the next trap.', pwd_hint: 'Highlights the correct answer of this question.', pwd_nitro: '3-second turbo.', pwd_jump: 'Gives you another jump on this question.',
    powers: 'Powers', shieldUsed: 'The shield saved you!', visitRoute: 'Visit the review route', routeFull: 'Review route', station: 'Station', skipStation: 'Next ▶', backRace: 'Back to the race', routeHold: 'Listening to the station… your vehicle waits',
    routeIntro: "Welcome to the review route. Let's go through this answer calmly, station by station.", routeAnswer: 'The correct answer', routeExplain: 'Explanation', routeOthers: 'Why the other options are wrong', routeRemember: 'To remember',
    othersText: 'The other options were', notCorrect: 'and they are not correct', levelUp: 'Level up!', newVehicle: 'Vehicle unlocked', xpGain: 'XP earned', menu: 'Menu', viewRoute: 'See explanation',
  },
  fr: {
    garage: 'Garage', race: 'Courir !', level: 'Niveau', xp: 'XP', runsN: 'courses', bestScore: 'meilleur score', unlocked: 'Débloqué', lockedV: 'Verrouillé', lockedHint: 'Atteins ce véhicule en course pour le débloquer', startWith: 'Commencer avec', speedStat: 'Vitesse', flies: '✈️ Vole',
    customize: 'Personnaliser', paint: 'Peinture', glowC: 'Lumières', accessory: 'Accessoire', resetC: 'Réinitialiser', acc_none: 'Aucun', acc_flag: 'Drapeau', acc_antenna: 'Antenne', acc_wings: 'Ailerons', presets: 'Couleurs du monde',
    choosePower: 'Choisis un pouvoir pour cette mission', pw_shield: 'Bouclier', pw_hint: 'Indice', pw_nitro: 'Nitro', pw_jump: 'Saut en plus',
    pwd_shield: 'Absorbe le prochain piège.', pwd_hint: 'Met en évidence la bonne réponse de cette question.', pwd_nitro: 'Turbo de 3 secondes.', pwd_jump: 'Te donne un autre saut sur cette question.',
    powers: 'Pouvoirs', shieldUsed: 'Le bouclier t’a sauvé !', visitRoute: 'Visiter le parcours de révision', routeFull: 'Parcours de révision', station: 'Station', skipStation: 'Suivant ▶', backRace: 'Retour à la course', routeHold: 'Écoute de la station… ton véhicule attend',
    routeIntro: 'Bienvenue sur le parcours de révision. Voyons cette réponse calmement, station par station.', routeAnswer: 'La bonne réponse', routeExplain: 'Explication', routeOthers: 'Pourquoi les autres options sont fausses', routeRemember: 'À retenir',
    othersText: 'Les autres options étaient', notCorrect: 'et elles ne sont pas correctes', levelUp: 'Niveau supérieur !', newVehicle: 'Véhicule débloqué', xpGain: 'XP gagnée', menu: 'Menu', viewRoute: 'Voir l’explication',
  },
}
export const tt = (lang, key) => S[lang]?.[key] ?? S2[lang]?.[key] ?? S.es[key] ?? S2.es[key] ?? key

export const speechLang = (lang) => ({ es: 'es-MX', en: 'en-US', fr: 'fr-FR' }[lang] || 'es-MX')

// Contenido localizado
export const worldText = (lang, w, f) => L(lang, w, f)
export const missionText = (lang, m, f) => L(lang, m, f)
export const tierName = (lang, w, i) => w.tiers[i].i18n?.[lang]?.name ?? w.tiers[i].name
export const qText = (lang, q) => L(lang, q.src, 'q')
export const okText = (lang, q) => L(lang, q.src, 'ok')
export const factText = (lang, q) => L(lang, q.src, 'fact')
export const optText = (lang, q, i) => { const k = q.optSrc[i]; return k < 0 ? L(lang, q.src, 'ok') : (q.src.i18n?.[lang]?.bad?.[k] ?? q.src.bad[k]) }
// Párrafo `k` de la explicación detallada (la ruta de repaso); `i18n[lang].deep` puede ser un texto con párrafos separados por `|`
export const deepText = (lang, q, k) => { const alt = q.src.i18n?.[lang]?.deep, arr = typeof alt === 'string' ? alt.split('|') : alt; return (arr || q.src.deep || [])[k] || '' }
