import { create } from 'zustand'

// WoC-inspired fantasy classes — injected as the base system to gradually
// adapt to Oliver Academy's educational context. Stats use WoC's 5-axis
// system (str/agi/sta/int/spi); the legacy axis names (power/speed/…) are
// mapped in `stats` for any older component that reads them.
export const PLAYER_CLASSES = {
  warrior: {
    id: 'warrior',
    name: 'Guerrero',
    icon: '⚔️',
    color: '#c79c6e',
    role: 'Tanque / DPS',
    resourceType: 'rage',
    armor: 'Cota de malla',
    weapons: ['Espadas', 'Hachas', 'Mazas'],
    description: 'Campeón de primera línea. Fuerza bruta y resistencia en combate.',
    lore: 'Forjado en mil batallas, el Guerrero domina el combate cuerpo a cuerpo. Su ira se alimenta de los golpes que recibe y los que da.',
    baseStats: { str: 23, agi: 20, sta: 22, int: 10, spi: 11 },
    stats: { power: 5, speed: 4, intellect: 2, creativity: 2, wisdom: 2 },
    signatureAbilities: [
      { id: 'charge', name: 'Carga', description: 'Arrasa hacia el enemigo generando rabia e inmovilizándolo.' },
      { id: 'heroic_strike', name: 'Golpe Heroico', description: 'Ataque que se activa en el próximo golpe para maximizar el daño.' },
      { id: 'rend', name: 'Desgarrar', description: 'Hiere al objetivo haciéndolo sangrar durante 9 segundos.' },
    ],
    startSkills: [],
    passiveAura: 'battle_stance',
  },
  paladin: {
    id: 'paladin',
    name: 'Paladín',
    icon: '🛡️',
    color: '#f58cba',
    role: 'Tanque / Sanador',
    resourceType: 'mana',
    armor: 'Placas',
    weapons: ['Espadas a dos manos', 'Mazas'],
    description: 'Guerrero sagrado de Luz. Protege aliados y destruye el mal.',
    lore: 'El Paladín combina la fortaleza de un guerrero con el poder sanador de la Luz. El bastión de todo grupo.',
    baseStats: { str: 22, agi: 17, sta: 22, int: 13, spi: 14 },
    stats: { power: 4, speed: 3, intellect: 3, creativity: 3, wisdom: 3 },
    signatureAbilities: [
      { id: 'holy_light', name: 'Luz Sagrada', description: 'Llama a la Luz para curar a un aliado herido.' },
      { id: 'judgement', name: 'Juicio', description: 'Juzga al objetivo con el poder de la Luz sagrada.' },
      { id: 'seal_of_righteousness', name: 'Sello de Justicia', description: 'Sello que añade daño sagrado a cada golpe.' },
    ],
    startSkills: [],
    passiveAura: 'devotion_aura',
  },
  hunter: {
    id: 'hunter',
    name: 'Cazador',
    icon: '🏹',
    color: '#abd473',
    role: 'DPS a distancia',
    resourceType: 'mana',
    armor: 'Cuero',
    weapons: ['Arcos', 'Fusiles', 'Armas arrojadizas'],
    description: 'Maestro del rastreo y el combate a distancia. Sus mascotas son sus aliados.',
    lore: 'El Cazador domina los terrenos salvajes. Con arco en mano y fiel mascota al lado, nada escapa a su vista.',
    baseStats: { str: 14, agi: 25, sta: 19, int: 13, spi: 14 },
    stats: { power: 3, speed: 5, intellect: 3, creativity: 3, wisdom: 3 },
    signatureAbilities: [
      { id: 'serpent_sting', name: 'Aguijón de Serpiente', description: 'Envenena al objetivo con veneno que daña durante 15s.' },
      { id: 'aimed_shot', name: 'Disparo Apuntado', description: 'Disparo cargado de muy alto daño con tiempo de lanzamiento.' },
      { id: 'arcane_shot', name: 'Disparo Arcano', description: 'Proyectil de energía arcana instantáneo a larga distancia.' },
    ],
    startSkills: [],
    passiveAura: 'track_beasts',
  },
  rogue: {
    id: 'rogue',
    name: 'Pícaro',
    icon: '🗡️',
    color: '#fff569',
    role: 'DPS cuerpo a cuerpo',
    resourceType: 'energy',
    armor: 'Cuero',
    weapons: ['Dagas', 'Espadas de una mano'],
    description: 'Sigiloso y letal. Ataca desde las sombras con velocidad y veneno.',
    lore: 'El Pícaro vive en las sombras. Con movimientos precisos y veneno en sus dagas, elimina a sus enemigos antes de que puedan reaccionar.',
    baseStats: { str: 17, agi: 25, sta: 17, int: 11, spi: 12 },
    stats: { power: 3, speed: 5, intellect: 2, creativity: 2, wisdom: 2 },
    signatureAbilities: [
      { id: 'sinister_strike', name: 'Golpe Traicionero', description: 'Ataque lateral rápido que aplica un punto de combo.' },
      { id: 'eviscerate', name: 'Evisceración', description: 'Ataque poderoso que consume puntos de combo para daño masivo.' },
      { id: 'evasion', name: 'Evasión', description: 'Esquiva todos los ataques durante 15 segundos.' },
    ],
    startSkills: [],
    passiveAura: 'stealth',
  },
  priest: {
    id: 'priest',
    name: 'Sacerdote',
    icon: '✨',
    color: '#fffff0',
    role: 'Sanador / DPS',
    resourceType: 'mana',
    armor: 'Tela',
    weapons: ['Dagas', 'Cetros', 'Bastones'],
    description: 'Maestro de la curación y el daño de sombras. El pilar de cualquier grupo.',
    lore: 'El Sacerdote canaliza la Luz para sanar aliados o las Sombras para destruir enemigos. Indispensable en cualquier aventura.',
    baseStats: { str: 10, agi: 11, sta: 13, int: 22, spi: 24 },
    stats: { power: 2, speed: 2, intellect: 4, creativity: 5, wisdom: 5 },
    signatureAbilities: [
      { id: 'smite', name: 'Castigar', description: 'Castiga al objetivo con el poder de la Luz.' },
      { id: 'power_word_shield', name: 'Escudo de Fe', description: 'Escudo sagrado que absorbe daño durante 30 segundos.' },
      { id: 'shadow_word_pain', name: 'Palabra de Dolor', description: 'Inflige dolor oscuro sostenido durante 18 segundos.' },
    ],
    startSkills: [],
    passiveAura: 'spirit_tap',
  },
  shaman: {
    id: 'shaman',
    name: 'Chamán',
    icon: '⚡',
    color: '#0070de',
    role: 'Híbrido',
    resourceType: 'mana',
    armor: 'Cuero / Cota de malla',
    weapons: ['Mazas', 'Bastones', 'Dagas'],
    description: 'Maestro de los elementos. Daña, cura y fortalece a sus aliados.',
    lore: 'El Chamán es el nexo entre el mundo físico y el espiritual. Controla el trueno, la tierra y el fuego para apoyar a su grupo.',
    baseStats: { str: 18, agi: 16, sta: 20, int: 18, spi: 18 },
    stats: { power: 4, speed: 3, intellect: 4, creativity: 4, wisdom: 4 },
    signatureAbilities: [
      { id: 'lightning_bolt', name: 'Rayo', description: 'Canaliza el poder de la tormenta en un potente rayo.' },
      { id: 'rockbiter_weapon', name: 'Arma Rompepiedras', description: 'Encanta el arma para aumentar amenaza y daño.' },
      { id: 'ghost_wolf', name: 'Lobo Espectral', description: 'Se transforma en lobo para moverse más rápido.' },
    ],
    startSkills: [],
    passiveAura: 'totemic_focus',
  },
  mage: {
    id: 'mage',
    name: 'Mago',
    icon: '🔮',
    color: '#69ccf0',
    role: 'DPS a distancia',
    resourceType: 'mana',
    armor: 'Tela',
    weapons: ['Bastones', 'Varitas'],
    description: 'Maestro de la magia arcana. Hielo, fuego y arcano a su disposición.',
    lore: 'El Mago estudió durante años para dominar las fuerzas arcanas. Su conocimiento es su armadura; su poder, su espada.',
    baseStats: { str: 10, agi: 12, sta: 14, int: 24, spi: 22 },
    stats: { power: 2, speed: 2, intellect: 5, creativity: 4, wisdom: 5 },
    signatureAbilities: [
      { id: 'fireball', name: 'Bola de Fuego', description: 'Lanza una bola de fuego explosiva de gran daño.' },
      { id: 'frostbolt', name: 'Flecha de Hielo', description: 'Congela al objetivo ralentizando sus movimientos.' },
      { id: 'polymorph', name: 'Polimorfia', description: 'Convierte al objetivo en oveja, incapacitándolo.' },
    ],
    startSkills: [],
    passiveAura: 'arcane_concentration',
  },
  warlock: {
    id: 'warlock',
    name: 'Brujo',
    icon: '🌑',
    color: '#9482c9',
    role: 'DPS a distancia',
    resourceType: 'mana',
    armor: 'Tela',
    weapons: ['Bastones', 'Dagas', 'Varitas'],
    description: 'Canaliza energía demoníaca y sombría. Invoca demonios para que luchen por él.',
    lore: 'El Brujo firmó un pacto con fuerzas oscuras. A cambio de poder ilimitado, sirve a entidades que nadie más se atrevería a invocar.',
    baseStats: { str: 11, agi: 12, sta: 15, int: 21, spi: 21 },
    stats: { power: 2, speed: 2, intellect: 4, creativity: 4, wisdom: 4 },
    signatureAbilities: [
      { id: 'shadow_bolt', name: 'Proyectil Sombrío', description: 'Dispara un proyectil de energía oscura al enemigo.' },
      { id: 'corruption', name: 'Corrupción', description: 'Corrompe al objetivo con energía demoníaca, dañándolo.' },
      { id: 'life_tap', name: 'Toque de Vida', description: 'Sacrifica salud para convertirla en maná.' },
    ],
    startSkills: [],
    passiveAura: 'soul_link',
  },
  druid: {
    id: 'druid',
    name: 'Druida',
    icon: '🌿',
    color: '#ff7d0a',
    role: 'Multi-rol',
    resourceType: 'mana',
    armor: 'Cuero',
    weapons: ['Bastones', 'Dagas', 'Mazas de una mano'],
    description: 'Maestro de las formas. Puede tanquear, sanar o hacer daño según necesite.',
    lore: 'El Druida es la clase más versátil. Al servicio de la naturaleza, puede transformarse en oso, gato o árbol según lo requiera la batalla.',
    baseStats: { str: 15, agi: 15, sta: 17, int: 19, spi: 20 },
    stats: { power: 3, speed: 3, intellect: 4, creativity: 4, wisdom: 4 },
    signatureAbilities: [
      { id: 'wrath', name: 'Ira Natural', description: 'Invoca el poder de la naturaleza sobre el enemigo.' },
      { id: 'bear_form', name: 'Forma de Oso', description: 'Se transforma en oso para resistir daño masivo.' },
      { id: 'rejuvenation', name: 'Rejuvenecimiento', description: 'Regenera la salud de un aliado durante 12 segundos.' },
    ],
    startSkills: [],
    passiveAura: 'nature_focus',
  },
  // Admin-exclusive — not selectable by regular players (gated by isAdmin).
  hacker: {
    id: 'hacker',
    name: 'Hacker',
    icon: '🕶️',
    color: '#39ff14',
    role: 'Admin',
    resourceType: 'energy',
    armor: 'Sigilosa',
    weapons: ['Terminal', 'Exploit'],
    description: 'Acceso root al campus entero. Solo para el admin.',
    lore: 'Más allá de las clases normales existe el Hacker — quien conoce los sistemas por dentro y puede modificar la realidad misma del campus.',
    baseStats: { str: 20, agi: 20, sta: 20, int: 25, spi: 20 },
    stats: { power: 4, speed: 4, intellect: 5, creativity: 4, wisdom: 4 },
    signatureAbilities: [
      { id: 'root_access', name: 'Acceso Root', description: 'Control total sobre cualquier sistema del campus.' },
      { id: 'exploit', name: 'Exploit', description: 'Aprovecha una vulnerabilidad para obtener ventaja inmediata.' },
      { id: 'ghost_mode', name: 'Modo Fantasma', description: 'Se vuelve invisible para todos los sistemas de seguridad.' },
    ],
    startSkills: ['root_access'],
    passiveAura: 'admin_override',
  },
}

export const OLIVER_CLASSES = {
  bug_hunter: {
    id: 'bug_hunter',
    name: 'Cazador de Bugs',
    icon: '🐛',
    color: '#c79c6e',
    pairedWith: 'warrior',
    description: 'Oliver detecta anomalías con sus bigotes. Sus garras marcan el código corrupto.',
    startSkills: ['scratch', 'pounce'],
  },
  ancient_guardian: {
    id: 'ancient_guardian',
    name: 'Guardián Ancestral',
    icon: '🌙',
    color: '#f58cba',
    pairedWith: 'paladin',
    description: 'Oliver emana calma ancestral. Sus ronroneos generan escudos de luz.',
    startSkills: ['scratch', 'purr_shield'],
  },
  mystic_artisan: {
    id: 'mystic_artisan',
    name: 'Artesano Místico',
    icon: '🌿',
    color: '#abd473',
    pairedWith: 'hunter',
    description: 'El pelaje de Oliver cambia de color. Sus zarpazos dejan rastros de luz.',
    startSkills: ['scratch', 'chromatic_fur'],
  },
  shadow_scout: {
    id: 'shadow_scout',
    name: 'Explorador Sigiloso',
    icon: '🌑',
    color: '#fff569',
    pairedWith: 'rogue',
    description: 'Oliver se vuelve semitransparente y mapea el terreno en silencio.',
    startSkills: ['scratch', 'shadow_stalk'],
  },
  healer_whisker: {
    id: 'healer_whisker',
    name: 'Susurrador Sanador',
    icon: '✨',
    color: '#fffff0',
    pairedWith: 'priest',
    description: 'Oliver ronronea en la frecuencia exacta para acelerar la curación.',
    startSkills: ['scratch', 'purr_shield'],
  },
  storm_paw: {
    id: 'storm_paw',
    name: 'Pata Tormentosa',
    icon: '⚡',
    color: '#0070de',
    pairedWith: 'shaman',
    description: 'La electricidad estática del pelaje de Oliver conduce energía elemental.',
    startSkills: ['scratch', 'shadow_stalk'],
  },
  oracle_feline: {
    id: 'oracle_feline',
    name: 'Oráculo Felino',
    icon: '🔮',
    color: '#69ccf0',
    pairedWith: 'mage',
    description: 'Los ojos de Oliver proyectan datos predictivos. Su cola señala la amenaza.',
    startSkills: ['scratch', 'predictive_hiss'],
  },
  void_cat: {
    id: 'void_cat',
    name: 'Gato del Vacío',
    icon: '🌀',
    color: '#9482c9',
    pairedWith: 'warlock',
    description: 'Oliver desaparece en las sombras y reaparece donde menos lo esperan.',
    startSkills: ['scratch', 'predictive_hiss'],
  },
  wild_oliver: {
    id: 'wild_oliver',
    name: 'Oliver Salvaje',
    icon: '🍃',
    color: '#ff7d0a',
    pairedWith: 'druid',
    description: 'Oliver abraza su naturaleza felina y se convierte en cualquier forma animal.',
    startSkills: ['scratch', 'chromatic_fur'],
  },
}

// Real 3D models for the player's own character (separate from MASCOTS,
// which are the companion pet). Just gender for now per the MODELOS 3D/
// AVATARES/ folder — more options go here later without touching anything
// that reads PLAYER_AVATARS, since every consumer just looks up by id.
// modelRotationY: these GLBs face sideways relative to the engine's forward
// convention (+Z), so the avatar visibly "strafes" instead of facing the way
// it walks — same kind of fix already applied to mascots in mascotRegistry.js.
// If a model still looks off after this, flip the sign (Math.PI/2 <-> -Math.PI/2).
export const PLAYER_AVATARS = [
  { id: 'hombre', icon: '🧑', color: '#3b82f6', label: 'Hombre', modelPath: '/MODELOS 3D/AVATARES/hombre.glb', modelRotationY: Math.PI / 2 },
  { id: 'mujer',  icon: '👩', color: '#ec4899', label: 'Mujer',  modelPath: '/MODELOS 3D/AVATARES/mujer.glb', modelRotationY: Math.PI / 2 },
]

const DEFAULT_PLAYER = {
  class: null,
  // Reserved for the future per-owner specialization within a class (e.g.
  // two "Filósofo" players each picking a different subclass) — no
  // selection UI exists yet, this just keeps the shape ready. Will unlock
  // by level once that feature is built.
  subclass: null,
  avatarId: 'hombre',
  nickname: '',
  hp: { current: 100, max: 100 },
  energy: { current: 100, max: 100 },
  skills: { unlocked: [], equipped: [null, null, null, null] },
  talentPoints: 3,
}

const DEFAULT_OLIVER = {
  class: null,
  subclass: null,
  hp: { current: 80, max: 80 },
  skills: { unlocked: ['scratch'], equipped: ['scratch', null, null, null] },
  talentPoints: 3,
}

export const useGameStore = create((set, get) => ({
  player: { ...DEFAULT_PLAYER },
  oliver: { ...DEFAULT_OLIVER },
  worldTreeCompleted: false,

  setPlayerAvatar: (avatarId) =>
    set((s) => ({ player: { ...s.player, avatarId } })),

  setPlayerNickname: (nickname) =>
    set((s) => ({ player: { ...s.player, nickname } })),

  // Spend `cost` talent points to unlock a skill for 'player' or 'oliver'
  // (defaults to 1 for callers that don't care, e.g. older tiers).
  spendTalentPoint: (owner, skillId, cost = 1) =>
    set((s) => {
      const char = s[owner]
      if (!char) return s
      if ((char.talentPoints ?? 0) < cost) return s
      if (char.skills.unlocked.includes(skillId)) return s
      return {
        [owner]: {
          ...char,
          talentPoints: char.talentPoints - cost,
          skills: {
            ...char.skills,
            unlocked: [...char.skills.unlocked, skillId],
          },
        },
      }
    }),

  earnTalentPoints: (owner, amount) =>
    set((s) => {
      const char = s[owner]
      if (!char) return s
      return { [owner]: { ...char, talentPoints: (char.talentPoints ?? 0) + amount } }
    }),

  equipSkill: (owner, skillId, slot) =>
    set((s) => {
      const char = s[owner]
      if (!char || !char.skills.unlocked.includes(skillId)) return s
      const equipped = [...char.skills.equipped]
      equipped[slot] = skillId
      return { [owner]: { ...char, skills: { ...char.skills, equipped } } }
    }),

  selectPlayerClass: (classId) => {
    const cls = PLAYER_CLASSES[classId]
    if (!cls) return
    set((s) => ({
      player: {
        ...s.player,
        class: classId,
        skills: {
          unlocked: [...cls.startSkills],
          equipped: [...cls.startSkills.slice(0, 4), null, null, null, null].slice(0, 4),
        },
      },
    }))
  },

  selectOliverClass: (classId) => {
    const cls = OLIVER_CLASSES[classId]
    if (!cls) return
    set((s) => ({
      oliver: {
        ...s.oliver,
        class: classId,
        skills: {
          unlocked: [...cls.startSkills],
          equipped: [...cls.startSkills.slice(0, 4), null, null, null, null].slice(0, 4),
        },
      },
      worldTreeCompleted: !!s.player.class,
    }))
  },

  setWorldTreeCompleted: (val) => set({ worldTreeCompleted: val }),

  loadGameState: (data) => {
    if (!data) return
    set({
      player: { ...DEFAULT_PLAYER, ...(data.player ?? {}) },
      oliver: { ...DEFAULT_OLIVER, ...(data.oliver ?? {}) },
      worldTreeCompleted: data.worldTreeCompleted ?? false,
    })
  },

  setCurrentHp: (val) => set(s => ({ player: { ...s.player, hp: { ...s.player.hp, current: Math.max(0, val) } } })),

  // Force-save to Supabase immediately (used at end of onboarding, and by
  // the admin tools panel to verify cloud sync is actually working).
  forceSyncToCloud: async () => {
    const { buildProgressSnapshot } = await import('../services/persistence/progressSnapshot.js')
    const { saveLocalSnapshot } = await import('../services/persistence/localStore.js')
    const { pushSnapshotToCloud } = await import('../services/persistence/autoSave.js')
    saveLocalSnapshot(buildProgressSnapshot())
    await pushSnapshotToCloud()
  },
}))
