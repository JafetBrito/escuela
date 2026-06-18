import { useEffect, useState } from 'react'
import { useCombatStore } from '../../stores/useCombatStore'
import { useGameStore } from '../../stores/useGameStore'
import { SKILL_REGISTRY } from '../../data/skillRegistry'

// ── HP / Energy bar ──────────────────────────────────────────────────────────
function Bar({ value, max, color, label }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="flex flex-col gap-0.5">
      {label && <span className="text-[9px] font-bold uppercase tracking-wide text-text-muted">{label}</span>}
      <div className="flex items-center gap-2">
        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-black/30">
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}88` }} />
        </div>
        <span className="w-16 text-right text-[10px] font-bold text-text-muted">
          {Math.ceil(value)}/{max}
        </span>
      </div>
    </div>
  )
}

// ── Countdown ring ────────────────────────────────────────────────────────────
function CountdownRing({ timeLeft, max = 10 }) {
  const r = 20, circ = 2 * Math.PI * r
  const pct = timeLeft / max
  const danger = timeLeft <= 3
  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <circle cx="24" cy="24" r={r} fill="none"
          stroke={danger ? '#ef4444' : '#98ca3f'} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          className="transition-all duration-1000" />
      </svg>
      <span className={`text-lg font-black ${danger ? 'text-red-400' : 'text-text'}`}>{timeLeft}</span>
    </div>
  )
}

// ── Option button ─────────────────────────────────────────────────────────────
const OPTION_LABELS = ['A', 'B', 'C', 'D']
function OptionBtn({ label, text, eliminated, selected, correct, revealed, onSelect }) {
  let bg = 'bg-surface border-border hover:border-primary hover:bg-surface/80'
  if (eliminated) bg = 'bg-black/20 border-border/30 opacity-40 cursor-not-allowed line-through'
  else if (revealed && correct)  bg = 'bg-green-500/20 border-green-500 text-green-300'
  else if (revealed && selected) bg = 'bg-red-500/20 border-red-500 text-red-300'

  return (
    <button type="button" onClick={onSelect} disabled={eliminated || revealed}
      className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold text-text transition-all ${bg}`}>
      <span className="shrink-0 font-black text-primary">{label})</span>
      <span className="flex-1 leading-snug">{text}</span>
      {revealed && correct  && <span className="shrink-0 text-green-400">✓</span>}
      {revealed && selected && !correct && <span className="shrink-0 text-red-400">✗</span>}
    </button>
  )
}

// ── Skill button ──────────────────────────────────────────────────────────────
function SkillBtn({ skillId, energy, disabled, onSelect }) {
  const sk = SKILL_REGISTRY[skillId]
  if (!sk) return null
  const noEnergy = sk.energyCost > energy
  return (
    <button type="button" onClick={() => onSelect(skillId)}
      disabled={disabled || noEnergy}
      title={`${sk.name}: ${sk.description} (⚡${sk.energyCost})`}
      className="flex flex-col items-center gap-1 rounded-2xl border-2 border-border bg-surface p-3 text-center transition-all hover:border-primary hover:bg-surface/80 disabled:cursor-not-allowed disabled:opacity-40">
      <span className="text-2xl">{sk.icon}</span>
      <span className="text-[10px] font-bold leading-tight text-text">{sk.name}</span>
      <span className="text-[9px] text-text-muted">⚡{sk.energyCost}</span>
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function BattleScreen() {
  const {
    active, phase, enemy,
    enemyHp, enemyMaxHp,
    playerHp, playerMaxHp, playerEnergy, playerMaxEnergy,
    question, timeLeft, eliminated, log, rewards,
    selectSkill, submitAnswer, endBattle,
  } = useCombatStore()

  const playerClass   = useGameStore(s => s.player.class)
  const unlockedSkills = useGameStore(s => s.player.skills.unlocked)

  // Show up to 4 skills for the battle UI
  const battleSkills = unlockedSkills.slice(0, 4)

  const [picked, setPicked] = useState(null)
  useEffect(() => { if (phase === 'player_turn') setPicked(null) }, [phase])

  if (!active) return null

  const isAsking    = phase === 'asking'
  const isResolving = phase === 'resolving'
  const isVictory   = phase === 'victory'
  const isDefeat    = phase === 'defeat'
  const isEnemyTurn = phase === 'enemy_turn'
  const canAct      = phase === 'player_turn'

  function handleAnswer(idx) {
    setPicked(idx)
    submitAnswer(idx)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">

      {/* ── Top: Enemy ──────────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${enemy?.color ?? '#1a1a2e'}22 0%, transparent 60%)` }}>

        {/* Enemy name + HP */}
        <div className="absolute left-4 right-4 top-4 rounded-2xl border border-border bg-surface/80 p-3 backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-black text-text">{enemy?.emoji} {enemy?.name}</span>
            <span className="rounded-full border px-2 py-0.5 text-[10px] font-bold text-text-muted"
              style={{ borderColor: `${enemy?.color}55`, color: enemy?.color }}>
              Nv.{enemy?.battleStats?.level ?? 1}
            </span>
          </div>
          <Bar value={enemyHp} max={enemyMaxHp} color="#ef4444" />
        </div>

        {/* Enemy big icon */}
        <div className="absolute inset-0 flex items-center justify-center pt-20">
          <div className="flex flex-col items-center gap-2">
            <span className="text-8xl" style={{ filter: `drop-shadow(0 0 24px ${enemy?.color ?? '#fff'}66)` }}>
              {enemy?.emoji}
            </span>
            {(isResolving || isEnemyTurn) && (
              <span className="animate-bounce rounded-full bg-red-500/20 px-3 py-1 text-xs font-black text-red-400">
                {isEnemyTurn ? '¡Atacando!' : '💥'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Question overlay (center) ────────────────────────────────────── */}
      {(isAsking || isResolving) && question && (
        <div className="absolute inset-x-4 top-1/2 z-10 -translate-y-1/2 rounded-3xl border border-border bg-background shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
            <p className="flex-1 text-sm font-black leading-snug text-text">{question.text}</p>
            {isAsking && <CountdownRing timeLeft={timeLeft} />}
            {isResolving && <span className="text-2xl">{picked === question.correct ? '✅' : '❌'}</span>}
          </div>
          <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
            {question.options.map((opt, i) => (
              <OptionBtn key={i}
                label={OPTION_LABELS[i]} text={opt}
                eliminated={eliminated.includes(i)}
                selected={picked === i}
                correct={i === question.correct}
                revealed={isResolving}
                onSelect={() => isAsking && handleAnswer(i)} />
            ))}
          </div>
        </div>
      )}

      {/* ── Victory / Defeat overlay ─────────────────────────────────────── */}
      {(isVictory || isDefeat) && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-black/70 backdrop-blur-sm">
          <span className="text-8xl">{isVictory ? '🏆' : '💔'}</span>
          <p className="text-3xl font-black text-text">{isVictory ? '¡Victoria!' : 'Derrotado…'}</p>
          {isVictory && rewards && (
            <div className="flex gap-4 rounded-2xl border border-border bg-surface px-6 py-3 text-sm font-bold">
              <span>✨ +{rewards.xp} XP</span>
              <span>🪙 +{rewards.coins.toLocaleString('es')}</span>
            </div>
          )}
          {isDefeat && (
            <p className="text-sm text-text-muted">Tu HP se restauró al 50%. ¡Inténtalo de nuevo!</p>
          )}
          <button type="button" onClick={endBattle}
            className="rounded-2xl bg-primary px-8 py-3 font-black text-background transition hover:bg-primary/80">
            Continuar
          </button>
        </div>
      )}

      {/* ── Bottom: Player panel ─────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-border bg-surface/90 px-4 py-4 backdrop-blur">

        {/* Player stats */}
        <div className="mb-3 rounded-xl border border-border bg-background/60 px-4 py-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <Bar value={playerHp} max={playerMaxHp} color="#22c55e" label="HP" />
            <Bar value={playerEnergy} max={playerMaxEnergy} color="#3b82f6" label="Energía" />
          </div>
        </div>

        {/* Skill buttons */}
        <div className="mb-3 grid grid-cols-4 gap-2">
          {battleSkills.length === 0 && (
            <p className="col-span-4 text-center text-xs text-text-muted">
              Sin habilidades. Desbloquea habilidades en Mi Árbol.
            </p>
          )}
          {battleSkills.map(skillId => (
            <SkillBtn key={skillId} skillId={skillId}
              energy={playerEnergy}
              disabled={!canAct}
              onSelect={selectSkill} />
          ))}
          {/* Fill empty slots */}
          {Array.from({ length: Math.max(0, 4 - battleSkills.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="flex h-16 items-center justify-center rounded-2xl border-2 border-dashed border-border text-text-muted opacity-30">
              –
            </div>
          ))}
        </div>

        {/* Battle log (last 3 entries) */}
        <div className="flex flex-col gap-0.5">
          {log.slice(0, 3).map((entry, i) => (
            <p key={i} className={`text-[11px] ${i === 0 ? 'font-bold text-text' : 'text-text-muted'}`}>
              {entry}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

