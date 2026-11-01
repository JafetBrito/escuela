import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import HubScene from './HubScene'
import ChatTab from '../mascot/ChatTab'
import { useI18n, tr } from '../../i18n'
import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES, PLAYER_AVATARS } from '../../stores/useGameStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useLevelStore, levelProgress } from '../../stores/useLevelStore'
import { useDailyRewardsStore } from '../../stores/useDailyRewardsStore'
import { useEquipmentStore } from '../../stores/useEquipmentStore'
import { useMascotCompanionStore } from '../../stores/useMascotCompanionStore'
import { usePetStore, PET_FOODS, bondLevel, moodKey } from '../../stores/usePetStore'
import { getMascotById } from '../../data/mascotRegistry'
import { getSkinById } from '../../data/skinsRegistry'
import { getSkillById } from '../../data/skillRegistry'
import { EQUIPMENT_SLOTS, SLOT_META, getEquipmentById } from '../../data/equipmentRegistry'
import { BATTLE_QUESTIONS } from '../../data/battleQuestions'

// ─────────────────────────────────────────────────────────────────────────────
// HUB móvil (/hub): en el celular no se juega el mundo VR; aquí vive tu mascota (Tamagotchi con necesidades
// reales), tu perfil (avatar 3D con ranuras de equipo, como WoW Mobile), las habilidades de tu clase y de tu
// mascota con demostración, y el chat con ella. Pensado para ratos libres: abre, cuida, aprende un poco, cierra.
// ─────────────────────────────────────────────────────────────────────────────

const stamp = () => performance.now() // fuera del componente: el lint no admite funciones impuras en el render
const NEEDS = [['hunger', '🍖', ['Hambre', 'Hunger']], ['energy', '⚡', ['Energía', 'Energy']], ['mood', '💛', ['Ánimo', 'Mood']], ['curiosity', '📚', ['Curiosidad', 'Curiosity']]]
const barColor = (v) => (v > 60 ? '#22c55e' : v > 30 ? '#eab308' : '#ef4444')
const money = (c) => `${Math.floor(c / 10000)}🟡 ${Math.floor((c % 10000) / 100)}⚪`

function Say({ pet, cls, name }) {
  const k = moodKey(pet.needs), tips = {
    programmer: tr('¿Depuramos un bug juntos?', 'Shall we debug something together?'),
    default: tr('¿Aprendemos algo cortito?', 'Shall we learn something quick?'),
  }
  const lines = {
    hungry: tr('¡Tengo hambre! Una galletita, porfa 🍪', "I'm hungry! A little cookie please 🍪"),
    tired: tr('Zzz… necesito descansar un ratito.', 'Zzz… I need a short rest.'),
    sad: tr('Me siento solito… ¿me acaricias?', 'I feel lonely… will you pet me?'),
    bored: tr('Estoy aburrido, ¡entrénanos con una pregunta!', "I'm bored, train me with a question!"),
    happy: (cls && tips[cls.id]) || tips.default,
  }
  return <div className="pointer-events-none absolute left-1/2 top-3 max-w-[85%] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/65 px-3 py-1.5 text-center text-xs font-medium text-white shadow-lg backdrop-blur">💬 {name}: {lines[k]}</div>
}

function Quiz({ onDone }) {
  const [q] = useState(() => BATTLE_QUESTIONS[Math.floor(Math.random() * BATTLE_QUESTIONS.length)])
  const [pick, setPick] = useState(null)
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-sm font-semibold">{q.text}</p>
      <div className="mt-2 grid gap-1.5">
        {q.options.map((o, i) => (
          <button key={i} disabled={pick !== null} onClick={() => { setPick(i); setTimeout(() => onDone(i === q.correct), 900) }}
            className={`rounded-lg px-3 py-2 text-left text-xs ${pick === null ? 'bg-white/10 active:bg-white/20' : i === q.correct ? 'bg-emerald-500/70' : i === pick ? 'bg-red-500/60' : 'bg-white/5 opacity-60'}`}>{o}</button>
        ))}
      </div>
    </div>
  )
}

export default function HubPage() {
  useI18n()
  const [tab, setTab] = useState('pet')
  const [panel, setPanel] = useState(null) // 'food' | 'quiz' | null
  const [toast, setToast] = useState('')
  const [reaction, setReaction] = useState(null)
  const pet = usePetStore()
  const { player, oliver } = useGameStore()
  const mascotId = useMascotStore((s) => s.selectedMascotId)
  const skinId = useMascotStore((s) => s.selectedSkinId)
  const mascotName = useSettingsStore((s) => s.mascotName)
  const coins = useCurrencyStore((s) => s.coins)
  const xp = useLevelStore((s) => s.xp)
  const streak = useDailyRewardsStore((s) => s.streak)
  const equipped = useEquipmentStore((s) => s.equipped)
  const mascot = getMascotById(mascotId)
  const avatar = PLAYER_AVATARS.find((a) => a.id === player.avatarId) || PLAYER_AVATARS[0]
  const cls = PLAYER_CLASSES[player.class], ocls = OLIVER_CLASSES[oliver.class]
  const accent = cls?.color || ocls?.color || '#a855f7'
  const lv = levelProgress(xp)
  const name = mascotName || mascot.name

  useEffect(() => { usePetStore.getState().tick(); const id = setInterval(() => usePetStore.getState().tick(), 30000); return () => clearInterval(id) }, [])
  useEffect(() => { if (!toast) return undefined; const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t) }, [toast])
  const say = (m) => setToast(m)
  const react = (type, color) => setReaction({ type, t0: stamp(), color })
  const fail = { coins: tr('No te alcanza el oro 🪙', 'Not enough gold 🪙'), full: tr('Está llenito 😋', "It's full 😋"), rested: tr('No tiene sueño 😸', "It isn't sleepy 😸"), tired: tr('Está muy cansado para entrenar', 'Too tired to train') }

  const feed = (f) => { const r = pet.feed(f.id); if (r.ok) { react('feed'); say(`${f.emoji} ${tr('¡Ñam!', 'Yum!')}`); setPanel(null) } else say(fail[r.reason] || '…') }
  const caress = () => { pet.caress(); react('caress'); say('💞') }
  const rest = () => { const r = pet.rest(); if (r.ok) { react('rest'); say('💤 Zzz…') } else say(fail[r.reason]) }
  const trainDone = (ok) => { const r = pet.train(ok); setPanel(null); if (r.ok) { react('caress'); say(ok ? `✨ ${tr('¡Correcto!', 'Correct!')} +${r.xp} XP` : `+${r.xp} XP · ${tr('¡a la próxima!', 'next time!')}`) } else say(fail[r.reason]) }
  const startTrain = () => (pet.needs.energy < 10 ? say(fail.tired) : setPanel('quiz'))

  const skills = useMemo(() => {
    const mine = (oliver.skills?.unlocked || []).map(getSkillById).filter(Boolean).map((s) => ({ id: s.id, icon: s.icon, name: s.name, desc: s.description, color: s.vfxColor || accent, who: 'pet' }))
    const own = (cls?.signatureAbilities || []).map((a) => ({ id: a.id, icon: cls.icon, name: a.name, desc: a.description, color: cls.color, who: 'you' }))
    return [...own, ...mine]
  }, [oliver.skills, cls, accent])
  const demo = (s) => { react('skill', s.color); say(`${s.icon} ${s.who === 'pet' ? name : tr('Tú', 'You')}: ${s.name}`) }
  const ask = (s) => { useMascotCompanionStore.getState().setChatPrefill(tr(`Explícame con un ejemplo corto cómo me ayuda la habilidad "${s.name}" (${s.desc}) en mi día a día de estudio.`, `Explain with a short example how the skill "${s.name}" (${s.desc}) helps me while studying.`), true); setTab('chat') }

  const tabs = [['pet', '🐾', tr('Mascota', 'Pet')], ['profile', '🧑', tr('Perfil', 'Profile')], ['skills', '⚡', tr('Poderes', 'Powers')], ['chat', '💬', 'Chat']]
  const slot = (owner, key) => { const id = equipped[owner]?.[key], it = id && getEquipmentById(id); return (
    <Link key={owner + key} to="/mascota" title={SLOT_META[key].label} className={`flex h-11 w-11 items-center justify-center rounded-lg border text-xl ${it ? 'border-white/40 bg-white/15' : 'border-dashed border-white/20 bg-black/30 opacity-60'}`}>{it ? it.icon : SLOT_META[key].icon}</Link>
  ) }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#07070f] text-white" style={{ background: `radial-gradient(ellipse at 50% 30%, ${accent}33 0%, #07070f 70%)` }}>
      <header className="flex items-center gap-2 px-3 pb-1 pt-[max(0.5rem,env(safe-area-inset-top))] text-xs">
        <Link to="/dashboard" className="rounded-full bg-white/10 px-2.5 py-1">←</Link>
        <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{name} <span className="font-normal opacity-60">· {tr('Vínculo', 'Bond')} {bondLevel(pet.affection)}</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full" style={{ width: `${(lv.xpIntoLevel / lv.xpForNextLevel) * 100}%`, background: accent }} /></div></div>
        <div className="text-right"><div className="font-bold">Nv {lv.level}</div><div className="opacity-70">{money(coins)}</div></div>
      </header>

      <div className="relative min-h-0 flex-[0_0_44%]">
        <HubScene accent={accent} mascot={mascot} avatar={avatar} skin={getSkinById(skinId)} avatarSkin={getSkinById('default')} focus={tab === 'profile' ? 'profile' : 'pet'} reaction={reaction} needs={pet.needs} />
        {tab === 'pet' && <Say pet={pet} cls={cls} name={name} />}
        {toast && <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/75 px-4 py-1.5 text-sm font-bold shadow-lg">{toast}</div>}
        {tab === 'profile' && (
          <>
            <div className="absolute left-2 top-4 flex flex-col gap-1.5">{EQUIPMENT_SLOTS.player.map((k) => slot('player', k))}</div>
            <div className="absolute right-2 top-4 flex flex-col gap-1.5">{EQUIPMENT_SLOTS.oliver.map((k) => slot('oliver', k))}</div>
          </>
        )}
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto rounded-t-3xl border-t border-white/10 bg-black/45 p-3 backdrop-blur">
        {tab === 'pet' && (
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {NEEDS.map(([k, ic, l]) => (<div key={k}><div className="flex justify-between text-[11px]"><span>{ic} {tr(...l)}</span><span className="opacity-60">{Math.round(pet.needs[k])}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full transition-all" style={{ width: `${pet.needs[k]}%`, background: barColor(pet.needs[k]) }} /></div></div>))}
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
              {[['🍖', tr('Alimentar', 'Feed'), () => setPanel(panel === 'food' ? null : 'food')], ['💞', tr('Acariciar', 'Pet'), caress], ['🎓', tr('Entrenar', 'Train'), startTrain], ['💤', tr('Descansar', 'Rest'), rest]].map(([ic, l, fn]) => (
                <button key={l} onClick={fn} className="rounded-xl bg-white/10 py-2.5 active:scale-95 active:bg-white/20"><div className="text-2xl">{ic}</div>{l}</button>))}
            </div>
            {panel === 'food' && (
              <div className="grid grid-cols-2 gap-2">{PET_FOODS.map((f) => (
                <button key={f.id} onClick={() => feed(f)} className="rounded-xl bg-white/10 p-2 text-left text-xs active:bg-white/20"><span className="text-xl">{f.emoji}</span> {tr(...f.name)}<div className="opacity-60">{f.cost ? money(f.cost) : tr('Gratis', 'Free')}</div></button>))}</div>
            )}
            {panel === 'quiz' && <Quiz onDone={trainDone} />}
            <p className="text-center text-[11px] opacity-50">{tr('Cuídala: baja con el tiempo, incluso con la app cerrada.', 'Look after it: it gets needier over time, even while the app is closed.')}</p>
          </div>
        )}
        {tab === 'profile' && (
          <div className="grid gap-3">
            <div className="flex items-center gap-3"><div className="text-3xl">{cls?.icon || '🎓'}</div>
              <div><div className="font-bold">{player.nickname || tr('Aprendiz', 'Learner')}</div><div className="text-xs opacity-70">{cls ? cls.name : tr('Sin clase todavía', 'No class yet')} · Nv {lv.level} · 🔥 {streak}</div></div>
              {!cls && <Link to="/arbol" className="ml-auto rounded-full bg-white/15 px-3 py-1 text-xs">{tr('Elegir clase', 'Choose class')}</Link>}</div>
            {cls && <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">{Object.entries(cls.stats).map(([k, v]) => (<div key={k} className="rounded-lg bg-white/10 py-1.5"><div className="text-sm font-bold">{v}</div>{k}</div>))}</div>}
            <div className="flex justify-center gap-2">{[0, 1, 2, 3].map((i) => { const sk = getSkillById(player.skills?.equipped?.[i] || oliver.skills?.equipped?.[i]); return <div key={i} className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-black/30 text-2xl">{sk?.icon || '＋'}</div> })}</div>
            <label className="text-xs">🎯 {tr('Quiero aprender…', 'I want to learn…')}
              <input value={pet.goal} onChange={(e) => pet.setGoal(e.target.value)} placeholder={tr('Ej.: programar mi primera app', 'e.g. build my first app')} className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm" /></label>
            <Link to="/mascota" className="rounded-xl bg-white/10 py-2 text-center text-xs">⚔️ {tr('Equipar y personalizar', 'Equip & customise')}</Link>
          </div>
        )}
        {tab === 'skills' && (
          <div className="grid gap-2">
            {!skills.length && <p className="text-sm opacity-70">{tr('Aún no tienes poderes: elige una clase en el Árbol.', 'No powers yet: pick a class in the Tree.')}</p>}
            {skills.map((s) => (
              <div key={s.who + s.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: `${s.color}33` }}>{s.icon}</div>
                <div className="min-w-0 flex-1"><div className="text-sm font-bold">{s.name} <span className="text-[10px] font-normal opacity-50">{s.who === 'pet' ? name : tr('tuyo', 'yours')}</span></div><div className="text-[11px] leading-snug opacity-70">{s.desc}</div></div>
                <div className="flex flex-col gap-1"><button onClick={() => demo(s)} className="rounded-lg bg-white/15 px-2.5 py-1 text-xs">▶</button><button onClick={() => ask(s)} className="rounded-lg bg-white/10 px-2.5 py-1 text-xs">💬</button></div>
              </div>))}
          </div>
        )}
        {tab === 'chat' && <ChatTab className="h-full min-h-[18rem]" />}
      </main>

      <nav className="grid grid-cols-4 border-t border-white/10 bg-black/70 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(([id, ic, l]) => (<button key={id} onClick={() => { setTab(id); setPanel(null) }} className={`py-2 text-[11px] ${tab === id ? 'font-bold text-white' : 'opacity-55'}`} style={tab === id ? { boxShadow: `inset 0 2px 0 ${accent}` } : undefined}><div className="text-xl">{ic}</div>{l}</button>))}
      </nav>
    </div>
  )
}
