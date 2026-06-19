// CSS-animated emoji "scene" card for each verb action type.
// Add a new key to SCENE_BG + ANIM_CSS to support new anim values.

const SCENE_BG = {
  search: 'radial-gradient(ellipse at 50% 40%,#1e2a4a,#0d1520)',
  spin:   'radial-gradient(ellipse at 50% 40%,#2a1e10,#1a1200)',
  lift:   'radial-gradient(ellipse at 50% 40%,#2a1e10,#140e00)',
  swing:  'radial-gradient(ellipse at 50% 40%,#3d2200,#1a0f00)',
  blink:  'radial-gradient(ellipse at 50% 40%,#0f2828,#041414)',
  pulse:  'radial-gradient(ellipse at 50% 40%,#2a1800,#150d00)',
  think:  'radial-gradient(ellipse at 50% 40%,#1e0f3d,#0c071e)',
  flash:  'radial-gradient(ellipse at 50% 40%,#182440,#080f1a)',
  rise:   'radial-gradient(ellipse at 50% 40%,#0a2418,#04100a)',
  glow:   'radial-gradient(ellipse at 50% 40%,#2a1400,#140900)',
  wander: 'radial-gradient(ellipse at 50% 40%,#0d2210,#051008)',
  bounce: 'radial-gradient(ellipse at 50% 40%,#0a183a,#040a18)',
}

const ANIM_CSS = {
  search: 'verb-search 2.5s ease-in-out infinite',
  spin:   'verb-spin 1.8s ease-in-out infinite',
  lift:   'verb-lift 1.5s ease-in-out infinite',
  swing:  'verb-swing 2.5s ease-in-out infinite',
  blink:  'verb-blink 2.2s ease-in-out infinite',
  pulse:  'verb-pulse 1.3s ease-in-out infinite',
  think:  'verb-think 2.5s ease-in-out infinite',
  flash:  'verb-flash 1.8s ease-in-out infinite',
  rise:   'verb-rise 2s ease-in-out infinite',
  glow:   'verb-glow 2s ease-in-out infinite',
  wander: 'verb-wander 3s ease-in-out infinite',
  bounce: 'verb-bounce 1.2s ease-in-out infinite',
}

export default function VerbAnimation({ verb, size = 80 }) {
  const anim = verb.anim ?? 'pulse'
  return (
    <div
      className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl"
      style={{ background: SCENE_BG[anim] ?? SCENE_BG.pulse, minHeight: 160 }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 50%,rgba(255,255,255,.07) 0%,transparent 65%)' }}
      />
      <span
        style={{
          fontSize: size,
          lineHeight: 1,
          display: 'block',
          animation: ANIM_CSS[anim] ?? ANIM_CSS.pulse,
          filter: 'drop-shadow(0 8px 24px rgba(0,0,0,.7))',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {verb.emoji}
      </span>
    </div>
  )
}
