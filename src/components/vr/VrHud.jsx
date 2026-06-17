import { useState, useEffect, useRef } from 'react'
import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES } from '../../stores/useGameStore'
import { getSkillById } from '../../data/skillRegistry'

// ─── Cooldown hook ─────────────────────────────────────────────────────────
function useCooldown(cooldownMs) {
  const [remaining, setRemaining] = useState(0)
  const endRef = useRef(0)
  const rafRef = useRef(null)

  function trigger() {
    endRef.current = Date.now() + cooldownMs
    const tick = () => {
      const left = Math.max(0, endRef.current - Date.now())
      setRemaining(left)
      if (left > 0) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])
  return { remaining, trigger, pct: remaining / Math.max(1, cooldownMs) }
}

// ─── Circular skill button (BDM-style) ─────────────────────────────────────
const BTN = 54  // button diameter px

function SkillBtn({ skillId, hotkey, dim = false, size = BTN }) {
  const skill = getSkillById(skillId)
  const { remaining, trigger, pct } = useCooldown(skill?.cooldownMs ?? 2000)
  const onCooldown = remaining > 0
  const r = (size / 2) - 3
  const circ = 2 * Math.PI * r

  if (!skill) {
    return (
      <div
        className="flex items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/20"
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
        title={`Slot vacío (${hotkey})`}
      >
        <span style={{ fontSize: 10 }}>{hotkey}</span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={trigger}
      disabled={onCooldown || dim}
      title={`${skill.name} — ${skill.description}`}
      className="relative flex items-center justify-center rounded-full transition-all active:scale-90"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        background: onCooldown
          ? 'rgba(0,0,0,0.7)'
          : `radial-gradient(circle at 38% 36%, ${skill.vfxColor}55, ${skill.vfxColor}22)`,
        border: `1.5px solid ${onCooldown ? 'rgba(255,255,255,0.08)' : skill.vfxColor + '88'}`,
        boxShadow: !onCooldown ? `0 0 10px ${skill.vfxColor}44, inset 0 0 6px ${skill.vfxColor}22` : 'none',
        opacity: dim ? 0.35 : 1,
      }}
    >
      <span style={{ fontSize: size * 0.42, lineHeight: 1 }}>{skill.icon}</span>

      {/* Hotkey corner label */}
      <span
        className="absolute font-bold text-white/40"
        style={{ fontSize: 9, bottom: 3, right: 5 }}
      >
        {hotkey}
      </span>

      {/* Cooldown arc sweep */}
      {onCooldown && (
        <>
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(0,0,0,0.55)' }}
          >
            <span className="font-bold text-white" style={{ fontSize: 11 }}>
              {(remaining / 1000).toFixed(1)}s
            </span>
          </div>
          <svg
            className="absolute inset-0 -rotate-90"
            style={{ width: size, height: size }}
            viewBox={`0 0 ${size} ${size}`}
          >
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke={skill.vfxColor}
              strokeWidth="2.5"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
          </svg>
        </>
      )}
    </button>
  )
}

// ─── Thin HP / Energy bar ──────────────────────────────────────────────────
function ThinBar({ current, max, color, label }) {
  const pct = Math.max(0, Math.min(1, current / max))
  return (
    <div className="flex items-center gap-1.5" style={{ width: 110 }}>
      <span className="w-5 text-right font-bold text-white/50" style={{ fontSize: 9 }}>{label}</span>
      <div className="relative flex-1 overflow-hidden rounded-full bg-black/40" style={{ height: 6 }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
          style={{
            width: `${pct * 100}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 5px ${color}88`,
          }}
        />
      </div>
      <span className="text-white/35 tabular-nums" style={{ fontSize: 9, minWidth: 28, textAlign: 'right' }}>
        {current}/{max}
      </span>
    </div>
  )
}

// ─── Portrait card (top-left) — BDM compact style ─────────────────────────
function PortraitHud() {
  const playerClass = useGameStore((s) => s.player.class)
  const oliverClass = useGameStore((s) => s.oliver.class)
  const hp = useGameStore((s) => s.player.hp)
  const energy = useGameStore((s) => s.player.energy)
  const oliverHp = useGameStore((s) => s.oliver.hp)

  const cls = playerClass ? PLAYER_CLASSES[playerClass] : null
  const oCls = oliverClass ? OLIVER_CLASSES[oliverClass] : null

  return (
    <div
      className="flex flex-col gap-1 rounded-xl px-3 py-2"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.72), rgba(0,0,0,0.45))',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${cls?.color ?? '#ffffff'}22`,
        boxShadow: cls ? `0 0 18px ${cls.color}18` : 'none',
      }}
    >
      {/* Top row: portrait circle + class name */}
      <div className="flex items-center gap-2">
        <div
          className="flex shrink-0 items-center justify-center rounded-full text-xl"
          style={{
            width: 38,
            height: 38,
            background: cls ? `${cls.color}22` : 'rgba(255,255,255,0.06)',
            border: `2px solid ${cls?.color ?? 'rgba(255,255,255,0.15)'}`,
            boxShadow: cls ? `0 0 10px ${cls.color}44` : 'none',
          }}
        >
          {cls ? cls.icon : '👤'}
        </div>
        <div className="flex flex-col">
          <span className="font-black text-white" style={{ fontSize: 11, letterSpacing: 0.5 }}>
            {cls ? cls.name : 'Sin clase'}
          </span>
          {oCls && (
            <span
              className="rounded px-1 font-bold"
              style={{
                fontSize: 9,
                background: `${oCls.color}28`,
                color: oCls.color,
                marginTop: 1,
              }}
            >
              {oCls.icon} {oCls.name}
            </span>
          )}
        </div>
      </div>

      {/* HP bar (player) */}
      <ThinBar current={hp.current} max={hp.max} color="#ef4444" label="HP" />
      {/* Energy bar (player) */}
      <ThinBar current={energy.current} max={energy.max} color="#22c55e" label="EN" />

      {/* Oliver HP — only shown when Oliver has a class */}
      {oCls && (
        <ThinBar current={oliverHp.current} max={oliverHp.max} color="#f97316" label="🐱" />
      )}
    </div>
  )
}

// ─── Skill bar (bottom-right) — BDM row style ─────────────────────────────
function SkillBar() {
  const playerClass = useGameStore((s) => s.player.class)
  const oliverClass = useGameStore((s) => s.oliver.class)
  const playerSkills = useGameStore((s) => s.player.skills.equipped)
  const oliverSkills = useGameStore((s) => s.oliver.skills.equipped)
  const cls = playerClass ? PLAYER_CLASSES[playerClass] : null
  const oCls = oliverClass ? OLIVER_CLASSES[oliverClass] : null

  return (
    <div
      className="flex flex-col items-end gap-2 rounded-2xl p-2"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.68), rgba(0,0,0,0.42))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Oliver row */}
      <div className="flex items-center gap-1.5">
        <span
          className="rounded-full px-1.5 font-bold text-white/50"
          style={{ fontSize: 8, background: oCls ? `${oCls.color}22` : 'transparent' }}
        >
          {oCls ? `${oCls.icon}` : '🐱'}
        </span>
        {oliverSkills.map((id, i) => (
          <SkillBtn key={`o${i}`} skillId={id} hotkey={String(i + 1)} size={50} />
        ))}
      </div>

      {/* Divider */}
      <div className="w-full" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* Player row */}
      <div className="flex items-center gap-1.5">
        <span
          className="rounded-full px-1.5 font-bold text-white/50"
          style={{ fontSize: 8, background: cls ? `${cls.color}22` : 'transparent' }}
        >
          {cls ? `${cls.icon}` : '⚔️'}
        </span>
        {playerSkills.map((id, i) => (
          <SkillBtn key={`p${i}`} skillId={id} hotkey={String(i + 5)} dim={!playerClass} size={50} />
        ))}
      </div>

      {/* Hints */}
      <p className="text-white/20" style={{ fontSize: 8 }}>1–4 Oliver · 5–8 Jugador</p>
    </div>
  )
}

// ─── Main HUD export ───────────────────────────────────────────────────────
export default function VrHud({ hidden = false }) {
  if (hidden) return null

  return (
    <>
      {/* Top-left: compact portrait */}
      <div className="pointer-events-none absolute left-3 top-3 z-20 sm:left-4 sm:top-4">
        <div className="pointer-events-auto">
          <PortraitHud />
        </div>
      </div>

      {/* Bottom-right: circular skill bar */}
      <div className="pointer-events-none absolute bottom-20 right-3 z-20 sm:bottom-16 sm:right-4">
        <div className="pointer-events-auto">
          <SkillBar />
        </div>
      </div>
    </>
  )
}
