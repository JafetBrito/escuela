import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import BattleScreen from '../battle/BattleScreen'
import { VR_NPCS } from '../../data/vrNpcRegistry'
import { getMascotById } from '../../data/mascotRegistry'
import { useCombatStore } from '../../stores/useCombatStore'
import { useGameStore, PLAYER_CLASSES } from '../../stores/useGameStore'
import { SKILL_REGISTRY } from '../../data/skillRegistry'
import { formatCurrency } from '../../utils/currency'

const BATTLE_NPCS = VR_NPCS.filter((n) => n.battle)

const CATEGORY_LABEL = {
  programming: '💻 Programación',
  cyber:       '🔒 Ciberseguridad',
  ai:          '🤖 Inteligencia Artificial',
  design:      '🎨 Diseño',
  philosophy:  '🦉 Filosofía',
  general:     '📚 General',
}

function difficultyLabel(level) {
  if (level <= 3) return { text: 'Fácil',   color: '#22c55e' }
  if (level <= 6) return { text: 'Medio',   color: '#f59e0b' }
  return              { text: 'Difícil', color: '#ef4444' }
}

function EnemyCard({ npc, onChallenge }) {
  const mascot = getMascotById(npc.mascotId)
  const diff   = difficultyLabel(npc.battleStats.level)

  return (
    <div className="flex flex-col gap-4 rounded-3xl border-2 bg-surface p-5 transition-all hover:scale-[1.01]"
      style={{ borderColor: `${npc.color}44`, background: `${npc.color}06` }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-4xl"
            style={{ background: `${npc.color}22` }}>
            {npc.emoji}
          </span>
          <div>
            <p className="font-black text-text">{npc.name}</p>
            <p className="text-xs text-text-muted">{CATEGORY_LABEL[npc.battleStats.questionCategory] ?? '📚 General'}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-full border px-2 py-0.5 text-[10px] font-black"
            style={{ borderColor: `${npc.color}55`, color: npc.color }}>
            Nv.{npc.battleStats.level}
          </span>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-black"
            style={{ background: `${diff.color}22`, color: diff.color }}>
            {diff.text}
          </span>
        </div>
      </div>

      {/* Dialogue */}
      <p className="rounded-xl border border-border bg-background/60 px-3 py-2 text-xs italic text-text-muted">
        "{npc.dialogue}"
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'HP',        value: npc.battleStats.hp },
          { label: 'Min daño',  value: npc.battleStats.minDamage },
          { label: 'Max daño',  value: npc.battleStats.maxDamage },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-background/40 py-2">
            <p className="text-base font-black text-text">{value}</p>
            <p className="text-[9px] uppercase tracking-wide text-text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Rewards */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-4 py-2 text-xs">
        <span className="text-text-muted">Recompensas</span>
        <div className="flex gap-3 font-bold">
          <span className="text-yellow-400">✨ +{npc.battleStats.xpReward} XP</span>
          <span className="text-yellow-500">🪙 +{formatCurrency(npc.battleStats.coinReward)}</span>
        </div>
      </div>

      {/* Challenge button */}
      <button
        type="button"
        onClick={() => onChallenge(npc)}
        className="w-full rounded-2xl py-3 font-black text-white transition-all hover:scale-[1.02] active:scale-95"
        style={{ background: `linear-gradient(135deg, ${npc.color}, ${npc.color}bb)` }}>
        ⚔️ Desafiar
      </button>
    </div>
  )
}

function PlayerStatsCard() {
  const player     = useGameStore((s) => s.player)
  const classDef   = player.class ? PLAYER_CLASSES[player.class] : null
  const hpPct      = Math.round((player.hp.current / player.hp.max) * 100)
  const energyPct  = Math.round((player.energy.current / player.energy.max) * 100)

  return (
    <div className="rounded-3xl border border-border bg-surface p-5">
      <p className="mb-3 text-xs font-black uppercase tracking-wider text-text-muted">Tu estado</p>

      <div className="flex items-center gap-3 mb-4">
        {classDef && (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
            style={{ background: `${classDef.color}22` }}>
            {classDef.icon}
          </span>
        )}
        <div>
          <p className="font-black text-text">{classDef?.name ?? 'Sin clase'}</p>
          <p className="text-xs text-text-muted">{player.skills.unlocked.length} habilidades desbloqueadas</p>
        </div>
      </div>

      {/* HP bar */}
      <div className="mb-2">
        <div className="mb-1 flex justify-between text-[10px] text-text-muted">
          <span>HP</span><span>{player.hp.current}/{player.hp.max}</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/20">
          <div className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${hpPct}%` }} />
        </div>
      </div>

      {/* Energy bar */}
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-[10px] text-text-muted">
          <span>Energía</span><span>{player.energy.current}/{player.energy.max}</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/20">
          <div className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${energyPct}%` }} />
        </div>
      </div>

      {/* Skills */}
      {player.skills.unlocked.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {player.skills.unlocked.map((id) => {
            const sk = SKILL_REGISTRY[id]
            if (!sk) return null
            return (
              <div key={id} className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-1.5">
                <span className="text-sm">{sk.icon}</span>
                <span className="text-[10px] font-bold text-text">{sk.name}</span>
                <span className="text-[9px] text-text-muted">⚡{sk.energyCost}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ArenaPage() {
  const startBattle  = useCombatStore((s) => s.startBattle)
  const combatActive = useCombatStore((s) => s.active)

  return (
    <div className="min-h-screen bg-background text-text">
      <AppTopBar />

      <main className="mx-auto max-w-5xl px-4 py-8">

        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-6xl">⚔️</div>
          <h1 className="text-4xl font-black">Arena de Combate</h1>
          <p className="mt-2 text-text-muted">
            Desafía a los guardianes del campus. Responde preguntas correctamente para atacar.
          </p>
        </div>

        {/* How it works */}
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: '🎯', title: 'Elige un rival',    desc: 'Cada guardián tiene su propio tema y dificultad' },
            { icon: '❓', title: 'Responde preguntas', desc: '10 segundos por pregunta — ¡correcto = daño completo!' },
            { icon: '🏆', title: 'Gana recompensas',  desc: 'XP y monedas al vencer. Error = 50% de probabilidad de fallar' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface/60 p-4 text-center">
              <span className="text-3xl">{icon}</span>
              <p className="text-sm font-black text-text">{title}</p>
              <p className="text-[11px] text-text-muted">{desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Enemy cards */}
          <div className="flex flex-col gap-5 lg:col-span-3">
            <h2 className="text-lg font-black text-text">Guardianes disponibles</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {BATTLE_NPCS.map((npc) => (
                <EnemyCard key={npc.id} npc={npc} onChallenge={startBattle} />
              ))}
            </div>
          </div>

          {/* Player stats sidebar */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-black text-text">Tu estado</h2>
            <PlayerStatsCard />
            <div className="rounded-2xl border border-border/60 bg-surface/40 px-4 py-3 text-xs text-text-muted">
              💡 Mejora tus habilidades en <strong className="text-text">Mi Árbol</strong> antes de entrar a la arena.
            </div>
          </div>
        </div>
      </main>

      {/* Battle overlay — mounts on top of everything */}
      {combatActive && <BattleScreen />}

      <MascotCompanion />
    </div>
  )
}
