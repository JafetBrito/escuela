import { useState, useEffect, useRef } from 'react'
import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES } from '../../stores/useGameStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { getSkillById } from '../../data/skillRegistry'
import { useVrSettingsStore } from '../../stores/useVrSettingsStore'
import { useVrCharacterStore } from '../../stores/useVrCharacterStore'
import { VR_NPCS, OLIVER_NPC, EINSTEIN_NPC, JAFET_NPC } from '../../data/vrNpcRegistry'
import { useLevelStore, levelProgress } from '../../stores/useLevelStore'

// ─── Minimap world bounds (campus VR coordinate space) ─────────────────────
const MM = { x0: -18, x1: 18, z0: -60, z1: 15 }
function w2m(wx, wz, size) {
  return [
    ((wx - MM.x0) / (MM.x1 - MM.x0)) * size,
    ((wz - MM.z0) / (MM.z1 - MM.z0)) * size,
  ]
}
const MINIMAP_NPCS = [
  { id: 'oliver',   pos: OLIVER_NPC.position,   color: '#22c55e' },
  { id: 'einstein', pos: EINSTEIN_NPC.position,  color: '#22c55e' },
  { id: 'jafet',   pos: JAFET_NPC.position,     color: '#22c55e' },
  ...VR_NPCS.map((n) => ({
    id: n.id,
    pos: n.position,
    color: (n.questId || n.missionId) ? '#facc15' : '#94a3b8',
  })),
]

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
const BTN = 54

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
      <span className="absolute font-bold text-white/40" style={{ fontSize: 9, bottom: 3, right: 5 }}>
        {hotkey}
      </span>
      {onCooldown && (
        <>
          <div className="absolute inset-0 flex items-center justify-center rounded-full" style={{ background: 'rgba(0,0,0,0.55)' }}>
            <span className="font-bold text-white" style={{ fontSize: 11 }}>{(remaining / 1000).toFixed(1)}s</span>
          </div>
          <svg className="absolute inset-0 -rotate-90" style={{ width: size, height: size }} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke={skill.vfxColor} strokeWidth="2.5"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
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
          style={{ width: `${pct * 100}%`, background: `linear-gradient(90deg, ${color}cc, ${color})`, boxShadow: `0 0 5px ${color}88` }}
        />
      </div>
      <span className="text-white/35 tabular-nums" style={{ fontSize: 9, minWidth: 28, textAlign: 'right' }}>
        {current}/{max}
      </span>
    </div>
  )
}

// ─── Circular minimap (WoC-inspired, top-right, desktop only) ─────────────
const MM_SIZE = 84

function VrMinimap({ playerPosRef }) {
  const cx = MM_SIZE / 2
  const r  = MM_SIZE / 2 - 2
  const [px, setPx] = useState(cx)
  const [pz, setPz] = useState(cx)

  useEffect(() => {
    const id = setInterval(() => {
      const pos = playerPosRef?.current
      if (!pos) return
      const [mx, mz] = w2m(pos.x, pos.z, MM_SIZE)
      setPx(Math.max(4, Math.min(MM_SIZE - 4, mx)))
      setPz(Math.max(4, Math.min(MM_SIZE - 4, mz)))
    }, 400)
    return () => clearInterval(id)
  }, [playerPosRef])

  return (
    <div className="hidden sm:flex flex-col items-center pointer-events-none" style={{ gap: 3 }}>
      <svg width={MM_SIZE} height={MM_SIZE} viewBox={`0 0 ${MM_SIZE} ${MM_SIZE}`}>
        <defs>
          <clipPath id="mm-clip">
            <circle cx={cx} cy={cx} r={r} />
          </clipPath>
        </defs>
        <circle cx={cx} cy={cx} r={r} fill="rgba(0,0,0,0.78)" />
        {/* crosshair */}
        <line x1={cx} y1={2} x2={cx} y2={MM_SIZE-2} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" clipPath="url(#mm-clip)" />
        <line x1={2} y1={cx} x2={MM_SIZE-2} y2={cx} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" clipPath="url(#mm-clip)" />
        {/* NPC dots */}
        {MINIMAP_NPCS.map(({ id, pos, color }) => {
          const [mx, mz] = w2m(pos[0], pos[2], MM_SIZE)
          if (mx < 0 || mx > MM_SIZE || mz < 0 || mz > MM_SIZE) return null
          return <circle key={id} cx={mx} cy={mz} r={2.5} fill={color} opacity={0.8} clipPath="url(#mm-clip)" />
        })}
        {/* player dot */}
        <circle cx={px} cy={pz} r={5}   fill="rgba(139,92,246,0.6)"  clipPath="url(#mm-clip)" />
        <circle cx={px} cy={pz} r={3}   fill="rgba(168,85,247,1)"    clipPath="url(#mm-clip)" />
        <circle cx={px} cy={pz} r={1.5} fill="white"                 clipPath="url(#mm-clip)" />
        {/* border ring */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(139,92,246,0.45)" strokeWidth="1.5" />
      </svg>
      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.12em', fontFamily: 'monospace' }}>
        CAMPUS
      </span>
    </div>
  )
}

// ─── XP bar (bottom strip, WoC-inspired) ───────────────────────────────────
function XpBar() {
  const xp = useLevelStore((s) => s.xp)
  const { level, xpIntoLevel, xpForNextLevel, isMaxLevel } = levelProgress(xp)
  const pct = isMaxLevel ? 1 : xpIntoLevel / xpForNextLevel

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center gap-2 px-3"
      style={{
        height: 22,
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 80%, transparent)',
      }}
    >
      <span
        className="shrink-0 rounded px-1.5 font-black tabular-nums"
        style={{
          fontSize: 9,
          lineHeight: '16px',
          background: isMaxLevel ? 'rgba(234,179,8,0.22)' : 'rgba(139,92,246,0.28)',
          border: `1px solid ${isMaxLevel ? 'rgba(234,179,8,0.5)' : 'rgba(139,92,246,0.5)'}`,
          color: isMaxLevel ? '#fbbf24' : '#c4b5fd',
        }}
      >
        Nv.{level}
      </span>
      <div className="relative flex-1 overflow-hidden rounded-full bg-white/10" style={{ height: 3 }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{
            width: `${pct * 100}%`,
            background: isMaxLevel
              ? 'linear-gradient(90deg, #ca8a04, #eab308)'
              : 'linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)',
            boxShadow: isMaxLevel ? '0 0 5px rgba(234,179,8,0.5)' : '0 0 5px rgba(168,85,247,0.55)',
          }}
        />
      </div>
      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', flexShrink: 0 }}>
        {isMaxLevel ? 'MAX' : `${xpIntoLevel}/${xpForNextLevel}`}
      </span>
    </div>
  )
}

// ─── Portrait card (top-left) — BDM compact style ─────────────────────────
// Click opens the Avatar's Personaje tab in the MascotCompanion menu.
function PortraitHud({ onOpenCharacterPanel }) {
  const playerClass = useGameStore((s) => s.player.class)
  const oliverClass = useGameStore((s) => s.oliver.class)
  const hp = useGameStore((s) => s.player.hp)
  const energy = useGameStore((s) => s.player.energy)
  const oliverHp = useGameStore((s) => s.oliver.hp)
  const mascotId = useMascotStore((s) => s.mascot)

  const cls = playerClass ? PLAYER_CLASSES[playerClass] : null
  const oCls = oliverClass ? OLIVER_CLASSES[oliverClass] : null

  const MASCOT_EMOJI = { orange_cat: '🐱', black_cat: '🐈‍⬛', robot: '🤖', dragon: '🐉', bunny: '🐰', fox: '🦊' }
  const mascotEmoji = MASCOT_EMOJI[mascotId] ?? '🐱'

  return (
    <button
      type="button"
      onClick={onOpenCharacterPanel}
      title="Ver personaje"
      className="relative flex flex-col gap-1 rounded-xl px-3 py-2 text-left transition-transform active:scale-95"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.72), rgba(0,0,0,0.45))',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${cls?.color ?? '#ffffff'}22`,
        boxShadow: cls ? `0 0 18px ${cls.color}18` : 'none',
      }}
    >
      {/* Mascot mini badge */}
      <div
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black/70 text-sm shadow-md"
        title="Tu mascota"
      >
        {mascotEmoji}
      </div>

      {/* Top row: portrait circle + class name */}
      <div className="flex items-center gap-2">
        <div
          className="flex shrink-0 items-center justify-center rounded-full text-xl"
          style={{
            width: 38, height: 38,
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
            <span className="rounded px-1 font-bold" style={{ fontSize: 9, background: `${oCls.color}28`, color: oCls.color, marginTop: 1 }}>
              {oCls.icon} {oCls.name}
            </span>
          )}
        </div>
      </div>

      <ThinBar current={hp.current} max={hp.max} color="#ef4444" label="HP" />
      <ThinBar current={energy.current} max={energy.max} color="#22c55e" label="EN" />
      {oCls && <ThinBar current={oliverHp.current} max={oliverHp.max} color="#f97316" label={mascotEmoji} />}
    </button>
  )
}

// ─── Skill bar (bottom-center, draggable) ─────────────────────────────────
function SkillBar() {
  const activeChar = useVrCharacterStore((s) => s.activeChar)
  const playerClass = useGameStore((s) => s.player.class)
  const oliverClass = useGameStore((s) => s.oliver.class)
  const playerSkills = useGameStore((s) => s.player.skills.equipped)
  const oliverSkills = useGameStore((s) => s.oliver.skills.equipped)

  const isMascot = activeChar === 'mascot'
  const equippedSkills = isMascot ? oliverSkills : playerSkills
  const cls = isMascot
    ? (oliverClass ? OLIVER_CLASSES[oliverClass] : null)
    : (playerClass ? PLAYER_CLASSES[playerClass] : null)

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  function onDragStart(e) {
    e.preventDefault()
    const sx = e.clientX - dragOffset.x
    const sy = e.clientY - dragOffset.y
    const onMove = (me) => setDragOffset({ x: me.clientX - sx, y: me.clientY - sy })
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div
      className="pointer-events-auto flex flex-col items-center gap-1.5 rounded-2xl p-2 select-none"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.72), rgba(0,0,0,0.48))',
        backdropFilter: 'blur(12px)',
        border: cls ? `1px solid ${cls.color}33` : '1px solid rgba(255,255,255,0.07)',
        boxShadow: cls ? `0 0 18px ${cls.color}18` : 'none',
        cursor: 'grab',
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
      }}
      onPointerDown={onDragStart}
    >
      {cls && (
        <span className="font-bold text-white/50" style={{ fontSize: 8 }}>
          {cls.icon} {cls.name}
        </span>
      )}
      <div className="flex items-center gap-1.5">
        {equippedSkills.map((id, i) => (
          <SkillBtn key={i} skillId={id} hotkey={String(i + 1)} size={50} />
        ))}
      </div>
    </div>
  )
}

// ─── Utility strip (right side) — Settings / Hide / Rewards / Bags / Map / Chat / Audio / Friends / Arena ──
function VrUtilBar({
  onOpenSettings,
  onOpenChat,
  onOpenMap,
  onOpenDailyRewards,
  onOpenBags,
  onOpenFriends,
  onOpenArenaConfirm,
  hudVisible,
  setHudVisible,
  isPrivateWorld,
}) {
  const [muted, setMuted] = useState(() => localStorage.getItem('vr-muted') === '1')

  // Sync initial mute state to npcVoice store on first render
  useEffect(() => {
    if (localStorage.getItem('vr-muted') === '1') {
      useVrSettingsStore.getState().setNpcVoice(false)
    }
  }, [])

  const toggleMute = () => {
    const m = !muted
    setMuted(m)
    localStorage.setItem('vr-muted', m ? '1' : '0')
    // Silence NPC TTS when muted
    useVrSettingsStore.getState().setNpcVoice(!m)
    if (m) window.speechSynthesis?.cancel()
  }

  // Ajustes is always the first/top button (never hides — it's how you'd
  // turn the HUD back on/configure it), then the eye toggle right under it,
  // not the other way around.
  const BTNS = [
    { icon: '⚙️', title: 'Ajustes', onClick: onOpenSettings },
    { icon: hudVisible ? '👁️' : '🙈', title: hudVisible ? 'Ocultar interfaz' : 'Mostrar interfaz', onClick: () => setHudVisible(v => !v) },
    { icon: '🎁', title: 'Recompensa diaria', onClick: onOpenDailyRewards, hidden: !hudVisible },
    { icon: '🎒', title: 'Bolsas', onClick: onOpenBags, hidden: !hudVisible },
    { icon: '🗺️', title: 'Mapa', onClick: onOpenMap, hidden: !hudVisible || isPrivateWorld },
    { icon: '💬', title: 'Chat', onClick: onOpenChat, hidden: !hudVisible },
    { icon: muted ? '🔇' : '🔊', title: muted ? 'Activar audio' : 'Silenciar', onClick: toggleMute, hidden: !hudVisible },
    { icon: '👥', title: 'Amigos', onClick: onOpenFriends, hidden: !hudVisible },
    { icon: '⚔️', title: 'Arena', onClick: onOpenArenaConfirm, hidden: !hudVisible },
  ]

  return (
    <div className="pointer-events-none absolute right-2 top-16 z-20 flex flex-col items-end gap-1.5 sm:top-[112px] md:right-3 md:top-[112px]">
      {BTNS.filter(b => !b.hidden).map(({ icon, title, onClick }) => (
        <button
          key={title}
          type="button"
          onClick={onClick}
          title={title}
          aria-label={title}
          className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/55 shadow-lg backdrop-blur-sm transition-all active:scale-90 hover:bg-black/80 md:h-9 md:w-9"
          style={{ fontSize: 15 }}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}

// ─── Real-time clock ──────────────────────────────────────────────────────
function DayNightClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const h = now.getHours()
  const label = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const icon = h >= 20 || h < 5 ? '🌙' : h < 7 ? '🌅' : h < 17 ? '☀️' : '🌇'
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2 flex items-center gap-1.5 rounded-full px-3 py-1 text-white/90 tabular-nums"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', fontSize: 13, fontWeight: 700 }}
    >
      {icon} {label}
    </div>
  )
}

// ─── Main HUD export ───────────────────────────────────────────────────────
export default function VrHud({
  hidden = false,
  hudVisible = true,
  setHudVisible,
  onOpenSettings,
  onOpenChat,
  onOpenMap,
  onOpenDailyRewards,
  onOpenBags,
  onOpenFriends,
  onOpenArenaConfirm,
  onOpenCharacterPanel,
  isPrivateWorld = false,
  playerPosRef = null,
}) {
  return (
    <>
      {hudVisible && <DayNightClock />}

      {/* Utility strip — always rendered so eye/Ajustes are accessible */}
      <VrUtilBar
        onOpenSettings={onOpenSettings}
        onOpenChat={onOpenChat}
        onOpenMap={onOpenMap}
        onOpenDailyRewards={onOpenDailyRewards}
        onOpenBags={onOpenBags}
        onOpenFriends={onOpenFriends}
        onOpenArenaConfirm={onOpenArenaConfirm}
        hudVisible={hudVisible}
        setHudVisible={setHudVisible}
        isPrivateWorld={isPrivateWorld}
      />

      {!hidden && hudVisible && (
        <>
          {/* Top-left: compact portrait + mascot avatar */}
          <div className="pointer-events-none absolute left-3 top-3 z-20 sm:left-4 sm:top-4">
            <div className="pointer-events-auto">
              <PortraitHud onOpenCharacterPanel={onOpenCharacterPanel} />
            </div>
          </div>

          {/* Top-right: circular minimap (hidden on mobile, shown on sm+) */}
          <div className="pointer-events-none absolute right-2 top-2 z-20 md:right-3">
            <VrMinimap playerPosRef={playerPosRef} />
          </div>

          {/* Bottom-center: skill bar (draggable) — sits above the XpBar (22px) */}
          <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
            <SkillBar />
          </div>

          {/* Bottom: XP bar strip */}
          <XpBar />
        </>
      )}
    </>
  )
}
