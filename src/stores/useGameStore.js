import { create } from 'zustand'

export const PLAYER_CLASSES = {
  programmer: {
    id: 'programmer',
    name: 'Programador',
    icon: '⌨️',
    color: '#22c55e',
    description: 'Maestro del código. Velocidad y precisión lógica.',
    stats: { power: 3, speed: 5, intellect: 4, creativity: 2, wisdom: 1 },
    startSkills: ['fast_compile', 'debug_pulse'],
    passiveAura: 'code_flow',
  },
  cyber_strategist: {
    id: 'cyber_strategist',
    name: 'Ciber-Estratega',
    icon: '🕹️',
    color: '#3b82f6',
    description: 'Experto en seguridad. Control táctico total.',
    stats: { power: 2, speed: 3, intellect: 5, creativity: 3, wisdom: 2 },
    startSkills: ['tactical_scan', 'proxy_veil'],
    passiveAura: 'network_sense',
  },
  ai_engineer: {
    id: 'ai_engineer',
    name: 'Ingeniero de IA',
    icon: '🤖',
    color: '#a855f7',
    description: 'Arquitecto de modelos. Predicción y automatización.',
    stats: { power: 2, speed: 2, intellect: 5, creativity: 3, wisdom: 3 },
    startSkills: ['model_inference', 'data_weave'],
    passiveAura: 'pattern_recognition',
  },
  designer: {
    id: 'designer',
    name: 'Diseñador',
    icon: '🎨',
    color: '#f97316',
    description: 'Creador de experiencias. Arte y funcionalidad fusionados.',
    stats: { power: 2, speed: 3, intellect: 3, creativity: 5, wisdom: 2 },
    startSkills: ['visual_burst', 'form_shift'],
    passiveAura: 'aesthetic_aura',
  },
  philosopher: {
    id: 'philosopher',
    name: 'Filósofo',
    icon: '🦉',
    color: '#eab308',
    description: 'Pensador crítico. Sabiduría y ética como armas.',
    stats: { power: 1, speed: 2, intellect: 4, creativity: 3, wisdom: 5 },
    startSkills: ['socratic_parry', 'axiom_pulse'],
    passiveAura: 'dialectic_field',
  },
}

export const OLIVER_CLASSES = {
  bug_hunter: {
    id: 'bug_hunter',
    name: 'Cazador de Bugs',
    icon: '🐛',
    color: '#22c55e',
    pairedWith: 'programmer',
    description: 'Oliver detecta anomalías con sus bigotes. Sus garras marcan el código corrupto.',
    startSkills: ['scratch', 'pounce'],
  },
  shadow_scout: {
    id: 'shadow_scout',
    name: 'Explorador Sigiloso',
    icon: '🌑',
    color: '#3b82f6',
    pairedWith: 'cyber_strategist',
    description: 'Oliver se vuelve semitransparente y mapea el terreno en silencio.',
    startSkills: ['scratch', 'shadow_stalk'],
  },
  oracle_feline: {
    id: 'oracle_feline',
    name: 'Oráculo Felino',
    icon: '🔮',
    color: '#a855f7',
    pairedWith: 'ai_engineer',
    description: 'Los ojos de Oliver proyectan datos predictivos. Su cola señala la amenaza.',
    startSkills: ['scratch', 'predictive_hiss'],
  },
  mystic_artisan: {
    id: 'mystic_artisan',
    name: 'Artesano Místico',
    icon: '✨',
    color: '#f97316',
    pairedWith: 'designer',
    description: 'El pelaje de Oliver cambia de color. Sus zarpazos dejan patrones visuales.',
    startSkills: ['scratch', 'chromatic_fur'],
  },
  ancient_guardian: {
    id: 'ancient_guardian',
    name: 'Guardián Ancestral',
    icon: '🌙',
    color: '#eab308',
    pairedWith: 'philosopher',
    description: 'Oliver emana calma ancestral. Sus ronroneos generan escudos lógicos.',
    startSkills: ['scratch', 'purr_shield'],
  },
}

export const PLAYER_AVATARS = [
  { id: 'scholar',  icon: '📖', color: '#3b82f6', label: 'Erudito' },
  { id: 'valiant',  icon: '🛡️', color: '#ef4444', label: 'Valiente' },
  { id: 'mystic',   icon: '🔮', color: '#a855f7', label: 'Místico' },
  { id: 'swift',    icon: '⚡', color: '#eab308', label: 'Veloz' },
  { id: 'shadow',   icon: '🌑', color: '#64748b', label: 'Sombra' },
  { id: 'nature',   icon: '🌿', color: '#22c55e', label: 'Natural' },
]

const DEFAULT_PLAYER = {
  class: null,
  avatarId: 'scholar',
  avatarRegistryId: 8,  // id en mascotRegistry (modelo 3D del jugador)
  nickname: '',
  hp: { current: 100, max: 100 },
  energy: { current: 100, max: 100 },
  skills: { unlocked: [], equipped: [null, null, null, null] },
  talentPoints: 3,
}

const DEFAULT_OLIVER = {
  class: null,
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

  setAvatarRegistryId: (avatarRegistryId) =>
    set((s) => ({ player: { ...s.player, avatarRegistryId } })),

  setPlayerNickname: (nickname) =>
    set((s) => ({ player: { ...s.player, nickname } })),

  // Spend a talent point to unlock a skill for 'player' or 'oliver'.
  spendTalentPoint: (owner, skillId) =>
    set((s) => {
      const char = s[owner]
      if (!char) return s
      if ((char.talentPoints ?? 0) < 1) return s
      if (char.skills.unlocked.includes(skillId)) return s
      return {
        [owner]: {
          ...char,
          talentPoints: char.talentPoints - 1,
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

  // Force-save to Supabase immediately (used at end of onboarding)
  forceSyncToCloud: async () => {
    const { buildProgressSnapshot } = await import('../services/persistence/progressSnapshot.js')
    const { supabase, isSupabaseConfigured } = await import('../services/supabase/client.js')
    const { useAuthStore } = await import('./useAuthStore.js')
    const { saveLocalSnapshot } = await import('../services/persistence/localStore.js')
    const snapshot = buildProgressSnapshot()
    saveLocalSnapshot(snapshot)
    if (!isSupabaseConfigured()) return
    const { user } = useAuthStore.getState()
    if (!user) return
    await supabase
      .from('profiles')
      .update({ snapshot, updated_at: new Date().toISOString() })
      .eq('id', user.id)
  },
}))
