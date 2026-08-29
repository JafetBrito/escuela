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

// Catalan overrides for the same catalog — same pattern as MISSION_TEXT_EN
// above, translated from the Spanish original instead.
export const MISSION_TEXT_CA = {
  'habla-con-mascota': {
    title: 'Trenca el gel',
    description: 'Parla amb la teva mascota almenys un cop per activar la seva IA.',
  },
  'completa-una-clase': {
    title: 'Primer pas',
    description: 'Completa la teva primera classe de qualsevol curs disponible.',
  },
  'activa-objeto': {
    title: 'Fes servir el teu equipament',
    description: 'Activa qualsevol objecte interactiu del teu inventari.',
  },
  'compra-tienda': {
    title: 'Sessió de compres',
    description: 'Compra almenys un objecte a la Botiga del campus.',
  },
  'lee-libro': {
    title: 'Cuc de biblioteca',
    description: 'Obre un llibre de la Biblioteca del campus.',
  },
  'cambia-apariencia': {
    title: 'Nou aspecte',
    description: 'Canvia la pell o la vestimenta de la teva mascota Oliver.',
  },
  'completa-cinco-clases': {
    title: 'En ratxa',
    description: 'Completa 5 classes en qualsevol combinació de cursos.',
  },
  'sube-nivel-5': {
    title: 'Aprenent consolidat',
    description: 'Arriba al nivell 5 d\'experiència a la plataforma.',
  },
}

// Japanese overrides for the same catalog — same pattern as MISSION_TEXT_EN
// above, translated from the Spanish original instead.
export const MISSION_TEXT_JA = {
  'habla-con-mascota': {
    title: '最初の一言',
    description: 'マスコットに少なくとも一度話しかけてAIを起動しよう。',
  },
  'completa-una-clase': {
    title: '最初の一歩',
    description: '利用可能なコースから最初の授業を完了しよう。',
  },
  'activa-objeto': {
    title: '装備を使ってみよう',
    description: '持ち物からインタラクティブなアイテムを一つ有効化しよう。',
  },
  'compra-tienda': {
    title: 'お買い物',
    description: 'キャンパスのショップで少なくとも一つアイテムを買おう。',
  },
  'lee-libro': {
    title: '読書の虫',
    description: 'キャンパスの図書館の本を開いてみよう。',
  },
  'cambia-apariencia': {
    title: '新しい見た目',
    description: 'オリバー・マスコットのスキンや衣装を変えよう。',
  },
  'completa-cinco-clases': {
    title: '好調をキープ',
    description: 'コースの組み合わせを問わず5つの授業を完了しよう。',
  },
  'sube-nivel-5': {
    title: '一人前の学習者',
    description: 'プラットフォームでレベル5に到達しよう。',
  },
}

// Chinese (Simplified) overrides for the same catalog — same pattern as
// MISSION_TEXT_EN above, translated from the Spanish original instead.
export const MISSION_TEXT_ZH = {
  'habla-con-mascota': {
    title: '打破僵局',
    description: '至少和你的伙伴说一次话，激活它的 AI。',
  },
  'completa-una-clase': {
    title: '第一步',
    description: '完成任意一门可用课程的第一节课。',
  },
  'activa-objeto': {
    title: '用上你的装备',
    description: '激活你物品栏中的任意一件互动物品。',
  },
  'compra-tienda': {
    title: '购物之旅',
    description: '在校园商店至少购买一件物品。',
  },
  'lee-libro': {
    title: '书虫',
    description: '打开校园图书馆的一本书。',
  },
  'cambia-apariencia': {
    title: '全新造型',
    description: '更换你的奥利弗伙伴的皮肤或服装。',
  },
  'completa-cinco-clases': {
    title: '状态正佳',
    description: '在任意课程组合中完成5节课。',
  },
  'sube-nivel-5': {
    title: '小有所成的学习者',
    description: '在平台上达到经验等级5。',
  },
}

export function localizeMission(mission, lang) {
  if (!mission) return mission
  const overrides = lang === 'en' ? MISSION_TEXT_EN[mission.id] : lang === 'fr' ? MISSION_TEXT_FR[mission.id] : lang === 'it' ? MISSION_TEXT_IT[mission.id] : lang === 'ca' ? MISSION_TEXT_CA[mission.id] : lang === 'ja' ? MISSION_TEXT_JA[mission.id] : lang === 'zh' ? MISSION_TEXT_ZH[mission.id] : null
  if (!overrides) return mission
  return { ...mission, title: overrides.title ?? mission.title, description: overrides.description ?? mission.description }
}
