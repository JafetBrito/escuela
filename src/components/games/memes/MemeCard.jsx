// Visual renderer for each meme template type.
// All layouts are CSS-only — no external images needed.

function DrakeTemplate({ rejects, approves }) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-zinc-700 text-sm font-bold text-white">
      <div className="flex min-h-[72px] items-stretch border-b border-zinc-700">
        <div className="flex w-16 shrink-0 items-center justify-center bg-zinc-800 text-3xl">😒</div>
        <div className="flex flex-1 items-center bg-zinc-700/60 px-3 py-2 line-through opacity-70">{rejects}</div>
        <div className="flex w-8 shrink-0 items-center justify-center bg-zinc-800 text-lg">✋</div>
      </div>
      <div className="flex min-h-[72px] items-stretch">
        <div className="flex w-16 shrink-0 items-center justify-center bg-zinc-800 text-3xl">😏</div>
        <div className="flex flex-1 items-center bg-zinc-700/60 px-3 py-2">{approves}</div>
        <div className="flex w-8 shrink-0 items-center justify-center bg-zinc-800 text-lg">👈</div>
      </div>
    </div>
  )
}

function BrainTemplate({ levels }) {
  const icons = ['🧠', '🧠✨', '🧠💡', '🤯🌌']
  const bgs   = ['bg-zinc-800', 'bg-violet-900/60', 'bg-violet-700/50', 'bg-violet-500/40']
  return (
    <div className="overflow-hidden rounded-xl border-2 border-zinc-700 text-sm font-bold text-white">
      {levels.map((level, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 border-b border-zinc-700/60 px-3 py-3 last:border-0 ${bgs[i]}`}
        >
          <span className="w-12 shrink-0 text-center text-2xl leading-none">{icons[i]}</span>
          <span className="flex-1">{level}</span>
        </div>
      ))}
    </div>
  )
}

function ThisIsFineTemplate({ caption }) {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-zinc-700 bg-orange-950">
      {/* fire background */}
      <div className="pointer-events-none absolute inset-0 flex flex-wrap content-end gap-0 opacity-25 select-none">
        {'🔥'.repeat(40).split('').map((f, i) => (
          <span key={i} className="text-2xl">{f}</span>
        ))}
      </div>
      <div className="relative flex flex-col items-center gap-3 px-4 py-8">
        <span className="text-6xl">🐕☕</span>
        <p className="text-center text-sm font-bold text-white">"{caption}"</p>
        <div className="absolute right-3 top-3 text-3xl">🔥</div>
        <div className="absolute left-3 top-3 text-3xl">🔥</div>
      </div>
    </div>
  )
}

function ChangeMyMindTemplate({ claim }) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-zinc-700 bg-zinc-800">
      <div className="flex flex-col items-center gap-4 p-6">
        <span className="text-5xl">🪑👨‍💼</span>
        <div className="w-full rounded-lg border-2 border-zinc-500 bg-zinc-700 p-3 text-center">
          <p className="text-sm font-bold italic text-white">"{claim}"</p>
        </div>
        <div className="rounded-full border border-zinc-500 px-3 py-1">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Change My Mind</p>
        </div>
      </div>
    </div>
  )
}

function SurprisedPikachuTemplate({ setup, reaction }) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-zinc-700 bg-zinc-800 text-white">
      <div className="border-b border-zinc-700 bg-zinc-700/50 p-4">
        <p className="text-center text-sm font-semibold">{setup}</p>
      </div>
      <div className="flex flex-col items-center gap-2 p-5">
        <span className="text-6xl">😱</span>
        <p className="text-center text-xs font-black uppercase tracking-wide text-yellow-400">{reaction}</p>
      </div>
    </div>
  )
}

function TwoButtonsTemplate({ button1, button2, context }) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-zinc-700 bg-zinc-800 text-white">
      <div className="flex flex-col items-center gap-4 p-5">
        <span className="text-5xl">😰</span>
        <div className="flex w-full gap-3">
          <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-red-500 bg-red-900/30 p-2 text-center text-xs font-bold">
            {button1}
          </div>
          <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-blue-500 bg-blue-900/30 p-2 text-center text-xs font-bold">
            {button2}
          </div>
        </div>
        {context && (
          <p className="text-center text-[11px] text-zinc-400">{context}</p>
        )}
      </div>
    </div>
  )
}

const TEMPLATES = {
  drake:             DrakeTemplate,
  brain:             BrainTemplate,
  'this-is-fine':    ThisIsFineTemplate,
  'change-my-mind':  ChangeMyMindTemplate,
  'surprised-pikachu': SurprisedPikachuTemplate,
  'two-buttons':     TwoButtonsTemplate,
}

export default function MemeCard({ meme }) {
  const Template = TEMPLATES[meme.template]
  if (!Template) return <div className="rounded-xl bg-zinc-800 p-6 text-center text-zinc-400">Template desconocido</div>
  return <Template {...meme} />
}
