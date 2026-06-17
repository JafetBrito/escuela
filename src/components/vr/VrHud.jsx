import { useState, useEffect, useRef } from 'react'
import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES } from '../../stores/useGameStore'
import { getSkillById } from '../../data/skillRegistry'

// ─── Cooldown hook ─────────────────────────────────────────────────────────
function useCooldown(skillId, cooldownMs) {
  const [remaining, setRemaining] = useState(0)
  const endRef = useRef(0)

  function trigger() {
    endRef.current = Date.now() + cooldownMs
    const tick = () => {
      const left = Math.max(0, endRef.current - Date.now())
      setRemaining(left)
      if (left > 0) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  return { remaining, trigger, pct: remaining / cooldownMs }
}

// ─── Single skill button ───────────────────────────────────────────────────
function SkillButton({ skillId, hotkey, dim = false }) {
  const skill = getSkillById(skillId)
  const { remaining, trigger, pct } = useCooldown(skillId, skill?.cooldownMs ?? 2000)
  const onCooldown = remaining > 0

  if (!skill) {
    return (
      <div
        className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white/20 sm:h-14 sm:w-14"
        title={`Slot vacío (${hotkey})`}
      >
        <span className="text-xs">{hotkey}</span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={trigger}
      disabled={onCooldown || dim}
      title={`${skill.name} — ${skill.description}`}
      className="relative flex h-12 w-12 flex-col items-center justify-center overflow-hidden rounded-lg border sm:h-14 sm:w-14"
      style={{
        borderColor: onCooldown ? 'rgba(255,255,255,0.1)' : `${skill.vfxColor}80`,
        background: onCooldown
          ? 'rgba(0,0,0,0.6)'
          : `linear-gradient(135deg, ${skill.vfxColor}22, ${skill.vfxColor}44)`,
        boxShadow: !onCooldown ? `0 0 8px ${skill.vfxColor}44` : 'none',
        opacity: dim ? 0.4 : 1,
      }}
    >
      <span className="text-xl leading-none sm:text-2xl">{skill.icon}</span>

      {/* Hotkey label */}
      <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-white/50">{hotkey}</span>

      {/* Cooldown sweep overlay */}
      {onCooldown && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg"
          style={{ background: 'rgba(0,0,0,0.65)' }}
        >
          <span className="text-[10px] font-bold text-white">
            {(remaining / 1000).toFixed(1)}s
          </span>
        </div>
      )}

      {/* Cooldown border progress */}
      {onCooldown && (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 56 56">
          <rect
            x="1" y="1" width="54" height="54" rx="7"
            fill="none" stroke={skill.vfxColor} strokeWidth="2"
            strokeDasharray="208"
            strokeDashoffset={208 * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
      )}
    </button>
  )
}

// ─── HP / Energy bar ───────────────────────────────────────────────────────
function StatBar({ current, max, color, label }) {
  const pct = Math.max(0, Math.min(1, current / max))
  return (
    <div className="flex flex-col gap-0.5" style={{ width: 90 }}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">{label}</span>
        <span className="text-[9px] text-white/40">{current}/{max}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/50">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct * 100}%`, background: color, boxShadow: `0 0 6px ${color}88` }}
        />
      </div>
    </div>
  )
}

// ─── Player portrait card (top-left) ──────────────────────────────────────
function PlayerPortrait({ playerClass, oliverClass }) {
  const hp = useGameStore((s) => s.player.hp)
  const energy = useGameStore((s) => s.player.energy)
  const cls = playerClass ? PLAYER_CLASSES[playerClass] : null
  const oCls = oliverClass ? OLIVER_CLASSES[oliverClass] : null

  return (
    <div
      className="flex items-start gap-2 rounded-xl p-2"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,0,0.55))',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${cls?.color ?? '#ffffff'}30`,
        boxShadow: `0 0 16px ${cls?.color ?? '#ffffff'}22`,
      }}
    >
      {/* Avatar circle */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-2xl"
        style={{
          background: cls ? `${cls.color}22` : 'rgba(255,255,255,0.05)',
          border: `2px solid ${cls?.color ?? 'rgba(255,255,255,0.2)'}`,
          boxShadow: cls ? `0 0 12px ${cls.color}44` : 'none',
        }}
      >
        {cls ? cls.icon : '👤'}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white">{cls ? cls.name : 'Sin clase'}</span>
          {oCls && (
            <span
              className="rounded px-1 py-0.5 text-[9px] font-bold"
              style={{ background: `${oCls.color}33`, color: oCls.color }}
            >
              {oCls.icon} {oCls.name}
            </span>
          )}
        </div>
        <StatBar current={hp.current} max={hp.max} color="#ef4444" label="HP" />
        <StatBar current={energy.current} max={energy.max} color="#22c55e" label="ENE" />
      </div>
    </div>
  )
}

// ─── Action bar (bottom-center) ────────────────────────────────────────────
function ActionBar({ playerClass }) {
  const playerSkills = useGameStore((s) => s.player.skills.equipped)
  const oliverSkills = useGameStore((s) => s.oliver.skills.equipped)

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Oliver row */}
      <div className="flex items-center gap-1">
        <span className="mr-1 text-[9px] font-bold uppercase tracking-widest text-white/40">Oliver</span>
        {oliverSkills.map((id, i) => (
          <SkillButton key={`o${i}`} skillId={id} hotkey={String(i + 1)} />
        ))}
      </div>

      {/* Player row */}
      <div className="flex items-center gap-1">
        <span className="mr-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
          {playerClass ? PLAYER_CLASSES[playerClass]?.name?.slice(0, 6) : 'Tú'}
        </span>
        {playerSkills.map((id, i) => (
          <SkillButton key={`p${i}`} skillId={id} hotkey={String(i + 5)} dim={!playerClass} />
        ))}
      </div>

      <p className="text-[9px] text-white/25">1–4 Oliver · 5–8 Jugador</p>
    </div>
  )
}

// ─── Main HUD export ───────────────────────────────────────────────────────
export default function VrHud({ hidden = false }) {
  const playerClass = useGameStore((s) => s.player.class)
  const oliverClass = useGameStore((s) => s.oliver.class)

  if (hidden) return null

  return (
    <>
      {/* Top-left: player portrait + bars */}
      <div className="pointer-events-none absolute left-3 top-3 z-20 sm:left-4 sm:top-4">
        <div className="pointer-events-auto">
          <PlayerPortrait playerClass={playerClass} oliverClass={oliverClass} />
        </div>
      </div>

      {/* Bottom-center: action bar */}
      <div className="pointer-events-none absolute bottom-16 left-1/2 z-20 -translate-x-1/2 sm:bottom-14">
        <div className="pointer-events-auto">
          <ActionBar playerClass={playerClass} />
        </div>
      </div>
    </>
  )
}
