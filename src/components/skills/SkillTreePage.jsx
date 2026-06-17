import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES } from '../../stores/useGameStore'
import { useLevelStore, levelForXp } from '../../stores/useLevelStore'
import { SKILL_REGISTRY } from '../../data/skillRegistry'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'

// ─── Skill tree tier definitions ────────────────────────────────────────────
// cost = talent points required; levelReq = minimum player level

const PLAYER_SKILL_TREE = {
  programmer: [
    { tier: 1, levelReq: 1,  cost: 0, skillIds: ['fast_compile', 'debug_pulse'] },
    { tier: 2, levelReq: 5,  cost: 1, skillIds: ['refactor_slash', 'git_revert'] },
    { tier: 3, levelReq: 10, cost: 2, skillIds: ['kernel_crash'] },
  ],
  cyber_strategist: [
    { tier: 1, levelReq: 1,  cost: 0, skillIds: ['tactical_scan', 'proxy_veil'] },
    { tier: 2, levelReq: 5,  cost: 1, skillIds: ['firewall_burst', 'packet_flood'] },
    { tier: 3, levelReq: 10, cost: 2, skillIds: ['zero_day_exploit'] },
  ],
  ai_engineer: [
    { tier: 1, levelReq: 1,  cost: 0, skillIds: ['model_inference', 'data_weave'] },
    { tier: 2, levelReq: 5,  cost: 1, skillIds: ['gradient_descent', 'overfitting_shield'] },
    { tier: 3, levelReq: 10, cost: 2, skillIds: ['singularity_pulse'] },
  ],
  designer: [
    { tier: 1, levelReq: 1,  cost: 0, skillIds: ['visual_burst', 'form_shift'] },
    { tier: 2, levelReq: 5,  cost: 1, skillIds: ['pixel_storm', 'wireframe_wall'] },
    { tier: 3, levelReq: 10, cost: 2, skillIds: ['grand_design'] },
  ],
  philosopher: [
    { tier: 1, levelReq: 1,  cost: 0, skillIds: ['socratic_parry', 'axiom_pulse'] },
    { tier: 2, levelReq: 5,  cost: 1, skillIds: ['dialectic_shield', 'stoic_mind'] },
    { tier: 3, levelReq: 10, cost: 2, skillIds: ['eternal_logos'] },
  ],
}

const OLIVER_SKILL_TREE = {
  bug_hunter: [
    { tier: 1, levelReq: 1,  cost: 0, skillIds: ['scratch', 'pounce'] },
    { tier: 2, levelReq: 5,  cost: 1, skillIds: ['tail_whip', 'bug_sniff'] },
    { tier: 3, levelReq: 10, cost: 2, skillIds: ['null_pointer_strike'] },
  ],
  shadow_scout: [
    { tier: 1, levelReq: 1,  cost: 0, skillIds: ['scratch', 'shadow_stalk'] },
    { tier: 2, levelReq: 5,  cost: 1, skillIds: ['camouflage_coat', 'scan_perimeter'] },
    { tier: 3, levelReq: 10, cost: 2, skillIds: ['ghost_form'] },
  ],
  oracle_feline: [
    { tier: 1, levelReq: 1,  cost: 0, skillIds: ['scratch', 'predictive_hiss'] },
    { tier: 2, levelReq: 5,  cost: 1, skillIds: ['data_scan', 'vision_burst'] },
    { tier: 3, levelReq: 10, cost: 2, skillIds: ['omniscient_roar'] },
  ],
  mystic_artisan: [
    { tier: 1, levelReq: 1,  cost: 0, skillIds: ['scratch', 'chromatic_fur'] },
    { tier: 2, levelReq: 5,  cost: 1, skillIds: ['art_blast', 'illusion_dance'] },
    { tier: 3, levelReq: 10, cost: 2, skillIds: ['masterpiece_strike'] },
  ],
  ancient_guardian: [
    { tier: 1, levelReq: 1,  cost: 0, skillIds: ['scratch', 'purr_shield'] },
    { tier: 2, levelReq: 5,  cost: 1, skillIds: ['ancient_roar', 'wisdom_barrier'] },
    { tier: 3, levelReq: 10, cost: 2, skillIds: ['eternal_protection'] },
  ],
}

const TIER_LABELS = { 1: 'Base', 2: 'Nivel 5', 3: 'Nivel 10' }
const TIER_ICONS  = { 1: '🌱', 2: '🔥', 3: '👑' }

// ─── Skill card ──────────────────────────────────────────────────────────────

function SkillCard({ skill, isUnlocked, levelOk, levelReq, cost, talentPoints, onUnlock, classColor }) {
  const canUnlock = !isUnlocked && cost > 0 && levelOk && talentPoints >= cost

  let statusNode
  if (isUnlocked) {
    statusNode = (
      <span className="rounded-full px-2 py-0.5 text-[9px] font-black text-white"
        style={{ background: classColor }}>
        ✓ Activa
      </span>
    )
  } else if (cost === 0) {
    statusNode = (
      <span className="text-[9px] text-text-muted">
        🔒 Selecciona la clase
      </span>
    )
  } else if (!levelOk) {
    statusNode = (
      <span className="rounded-full border px-2 py-0.5 text-[9px] font-bold text-text-muted"
        style={{ borderColor: 'var(--color-border)' }}>
        🔒 Requiere Nv.{levelReq}
      </span>
    )
  } else if (talentPoints < cost) {
    statusNode = (
      <span className="text-[9px] text-text-muted">
        ✨ Sin puntos de talento
      </span>
    )
  } else {
    statusNode = (
      <button
        type="button"
        onClick={() => onUnlock(skill.id, cost)}
        className="rounded-full px-2 py-0.5 text-[9px] font-black text-white transition-all hover:scale-105 active:scale-95"
        style={{ background: `linear-gradient(135deg, ${classColor}, ${classColor}cc)` }}
      >
        Desbloquear · {cost}✨
      </button>
    )
  }

  return (
    <div
      className="relative flex flex-col gap-2 rounded-2xl border p-3 transition-all"
      style={{
        borderColor: isUnlocked ? `${skill.vfxColor}99` : 'var(--color-border)',
        background:  isUnlocked ? `${skill.vfxColor}14` : 'var(--color-surface)',
        opacity: isUnlocked || canUnlock || (!levelOk && cost > 0) ? 1 : 0.5,
        boxShadow: isUnlocked ? `0 0 12px ${skill.vfxColor}33` : 'none',
      }}
    >
      {/* Talent cost badge */}
      {cost > 0 && (
        <span
          className="absolute -right-1.5 -top-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-black text-white shadow"
          style={{ background: isUnlocked ? '#22c55e' : classColor }}
        >
          {isUnlocked ? '✓' : `${cost}✨`}
        </span>
      )}

      {/* Icon + name + description */}
      <div className="flex items-start gap-2">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ background: `${skill.vfxColor}22` }}>
          {skill.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold leading-tight text-text">{skill.name}</p>
          <p className="mt-0.5 text-[10px] leading-snug text-text-muted">{skill.description}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[9px] text-text-muted">
        <span>⚡ {skill.energyCost} energía</span>
        <span>⏱ {(skill.cooldownMs / 1000).toFixed(1)}s</span>
      </div>

      {/* Status / action */}
      <div className="flex justify-end">
        {statusNode}
      </div>
    </div>
  )
}

// ─── Tier row ────────────────────────────────────────────────────────────────

function TierRow({ tierDef, unlockedSkills, level, talentPoints, onUnlock, classColor }) {
  const levelOk = level >= tierDef.levelReq

  return (
    <div className="flex flex-col gap-3">
      {/* Tier header */}
      <div className="flex items-center gap-2">
        <span className="text-xl">{TIER_ICONS[tierDef.tier]}</span>
        <div>
          <p className="text-sm font-black text-text">{TIER_LABELS[tierDef.tier]}</p>
          {tierDef.levelReq > 1 && (
            <p className="text-[10px]" style={{ color: levelOk ? classColor : 'var(--color-text-muted)' }}>
              {levelOk ? '✓ Nivel alcanzado' : `Requiere nivel ${tierDef.levelReq}`}
            </p>
          )}
        </div>
        {tierDef.cost > 0 && (
          <span
            className="ml-auto rounded-full border px-2 py-0.5 text-[10px] font-bold"
            style={{ borderColor: `${classColor}55`, color: classColor }}
          >
            {tierDef.cost} punto{tierDef.cost !== 1 ? 's' : ''} de talento
          </span>
        )}
      </div>

      {/* Skills grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${tierDef.skillIds.length}, minmax(0,1fr))` }}
      >
        {tierDef.skillIds.map((skillId) => {
          const skill = SKILL_REGISTRY[skillId]
          if (!skill) return null
          return (
            <SkillCard
              key={skillId}
              skill={skill}
              isUnlocked={unlockedSkills.includes(skillId)}
              levelOk={levelOk}
              levelReq={tierDef.levelReq}
              cost={tierDef.cost}
              talentPoints={talentPoints}
              onUnlock={onUnlock}
              classColor={classColor}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Stat bar (5-dot) ────────────────────────────────────────────────────────

function StatBar5({ val, color }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-2 w-4 rounded-sm"
          style={{ background: i < val ? color : 'rgba(128,128,128,0.15)' }} />
      ))}
    </div>
  )
}

// ─── Character tree panel ────────────────────────────────────────────────────

function CharacterTree({ owner }) {
  const isPlayer    = owner === 'player'
  const classId     = useGameStore((s) => s[owner].class)
  const skills      = useGameStore((s) => s[owner].skills)
  const talentPts   = useGameStore((s) => s[owner].talentPoints ?? 0)
  const spendTalent = useGameStore((s) => s.spendTalentPoint)
  const xp          = useLevelStore((s) => s.xp)
  const level       = levelForXp(xp)
  const navigate    = useNavigate()

  const clsDef  = isPlayer ? PLAYER_CLASSES[classId] : OLIVER_CLASSES[classId]
  const treeMap = isPlayer ? PLAYER_SKILL_TREE      : OLIVER_SKILL_TREE
  const tiers   = treeMap[classId] ?? []

  const [toast, setToast] = useState(null)

  function handleUnlock(skillId, cost) {
    spendTalent(owner, skillId)
    const sk = SKILL_REGISTRY[skillId]
    setToast(`✨ ${sk?.name ?? skillId} desbloqueada`)
    setTimeout(() => setToast(null), 2200)
  }

  // ── No class selected ──
  if (!classId) {
    return (
      <div className="flex flex-col items-center gap-5 py-16 text-center">
        <span className="text-5xl">{isPlayer ? '⚔️' : '🐱'}</span>
        <p className="font-bold text-text">
          {isPlayer ? 'Sin clase de personaje' : 'Sin clase de Oliver'}
        </p>
        <p className="max-w-xs text-sm text-text-muted">
          {isPlayer
            ? 'Crea tu cuenta o visita "Mi Equipo" para elegir tu clase de personaje.'
            : 'Tu clase de Oliver se elige junto con la de tu personaje en el proceso de creación de cuenta.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/mascota')}
          className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white"
        >
          Ir a Mi Equipo
        </button>
      </div>
    )
  }

  const stats = isPlayer ? clsDef.stats : null
  const totalUnlocked = skills.unlocked.length
  const totalSkills   = tiers.reduce((n, t) => n + t.skillIds.length, 0)

  return (
    <div className="flex flex-col gap-6">

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-xl"
          style={{ background: clsDef.color }}>
          {toast}
        </div>
      )}

      {/* Class header card */}
      <div className="rounded-2xl border border-border bg-surface p-4"
        style={{ borderColor: `${clsDef.color}44` }}>
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
            style={{ background: `${clsDef.color}20` }}>
            {clsDef.icon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-black text-text">{clsDef.name}</p>
            <p className="text-xs text-text-muted">{clsDef.description}</p>

            {/* Stats */}
            {stats && (
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
                {Object.entries(stats).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wide text-text-muted capitalize">
                      {key}
                    </span>
                    <StatBar5 val={val} color={clsDef.color} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Talent points + progress summary */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
          <span className="text-xl">✨</span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-text-muted">Puntos de talento</p>
            <p className="text-lg font-black" style={{ color: clsDef.color }}>{talentPts}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
          <span className="text-xl">🌟</span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-text-muted">Nivel actual</p>
            <p className="text-lg font-black text-text">Nv. {level}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
          <span className="text-xl">⚔️</span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-text-muted">Habilidades</p>
            <p className="text-lg font-black text-text">{totalUnlocked}/{totalSkills}</p>
          </div>
        </div>

        {talentPts === 0 && totalUnlocked < totalSkills && (
          <p className="ml-auto text-xs text-text-muted">
            Sube de nivel para ganar más puntos de talento ✨
          </p>
        )}
      </div>

      {/* Tier connector + rows */}
      <div className="flex flex-col gap-2">
        {tiers.map((tierDef, i) => (
          <div key={tierDef.tier} className="flex flex-col gap-2">
            <TierRow
              tierDef={tierDef}
              unlockedSkills={skills.unlocked}
              level={level}
              talentPoints={talentPts}
              onUnlock={handleUnlock}
              classColor={clsDef.color}
            />
            {i < tiers.length - 1 && (
              <div className="flex items-center gap-2 px-4">
                <div className="h-px flex-1 border-t border-dashed border-border" />
                <span className="text-base text-text-muted/40">↓</span>
                <div className="h-px flex-1 border-t border-dashed border-border" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hint for earning more talent points */}
      <div className="rounded-xl bg-surface/60 px-4 py-3 text-xs text-text-muted">
        💡 Los puntos de talento se ganan al subir de nivel. Las habilidades del Tier 2 requieren
        nivel 5 y 1 punto; las del Tier 3 (ultimate) requieren nivel 10 y 2 puntos.
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'player', label: 'Personaje', icon: '⚔️' },
  { id: 'oliver', label: 'Oliver',    icon: '🐱' },
]

export default function SkillTreePage() {
  const [tab, setTab] = useState('player')

  return (
    <div className="min-h-screen bg-background text-text">
      <AppTopBar />

      <main className="mx-auto max-w-2xl px-4 pb-32 pt-6">
        {/* Page title */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-3xl">🌳</span>
          <div>
            <h1 className="text-xl font-black text-text">Mi Árbol de Habilidades</h1>
            <p className="text-xs text-text-muted">Desbloquea y gestiona tus habilidades de combate</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 flex rounded-2xl border border-border bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all"
              style={tab === t.id ? {
                background: 'var(--color-primary)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              } : { color: 'var(--color-text-muted)' }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Active tab content */}
        {tab === 'player' && <CharacterTree owner="player" />}
        {tab === 'oliver' && <CharacterTree owner="oliver" />}
      </main>

      <MascotCompanion />
    </div>
  )
}
