import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { WORLD_LIST, WORLDS, MIN_QUESTIONS } from './racingData'
import { useRacingContentStore, loadRemoteRacing, saveWorldContent, resetWorldContent, sanitizeLevels, levelReport } from './racingContent'
import { translateQuestion, translateMission, generateQuestions } from './racingAi'
import { useAuthStore } from '../../stores/useAuthStore'

// EDITOR de Oliver Racing (/carrera/editor, solo admin): mundos → niveles → misiones (con su historia) y preguntas (con explicación detallada y
// traducciones EN/FR). Guarda en Supabase (racing_content, migración 085) y el juego lo usa al instante; también importa/exporta JSON y puede
// traducir o generar preguntas con tu IA (Ajustes → Núcleo). Lo que edites NO toca el código: si quieres versionarlo, exporta el JSON.
const clone = (x) => JSON.parse(JSON.stringify(x))
const inp = 'w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-xs'
const btn = 'rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-bold hover:bg-white/15 disabled:opacity-40'
const DECOS = ['hospital', 'garden', 'city', 'servers', 'matrix', 'neon', 'agora', 'cave', 'sun']
const PAL_KEYS = ['sky', 'fog', 'ground', 'ground2', 'road', 'accent']
const LANGS = [['es', 'Español'], ['en', 'English'], ['fr', 'Français']]

function Field({ label, children }) { return <label className="block"><span className="mb-0.5 block text-[10px] uppercase opacity-60">{label}</span>{children}</label> }
const download = (name, text) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; a.click() }

function EditorInner() {
  const isAdmin = useAuthStore((s) => s.profile?.role === 'admin') || import.meta.env.DEV
  const status = useRacingContentStore((s) => s.status), dbError = useRacingContentStore((s) => s.error)
  const [worldId, setWorldId] = useState('medicina')
  const [draft, setDraft] = useState(() => clone(WORLDS.medicina.levels))
  const [li, setLi] = useState(0), [tab, setTab] = useState('preguntas'), [sel, setSel] = useState(0), [lang, setLang] = useState('es')
  const [filter, setFilter] = useState({ text: '', lvl: '', topic: '' })
  const [gen, setGen] = useState({ topic: '', lvl: 1, count: 5 })
  const [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  const fileRef = useRef()

  const world = WORLDS[worldId], level = draft[Math.min(li, draft.length - 1)]
  const topics = useMemo(() => [...new Set([...level.missions.flatMap((m) => m.topics), ...level.questions.map((q) => q.t)])], [level])
  const rows = useMemo(() => level.questions.map((q, i) => ({ q, i })).filter(({ q }) => (!filter.lvl || String(q.lvl) === filter.lvl) && (!filter.topic || q.t === filter.topic) && (!filter.text || q.q.toLowerCase().includes(filter.text.toLowerCase()))), [level, filter])
  const cur = level.questions[Math.min(sel, level.questions.length - 1)]
  const curIdx = cur ? level.questions.indexOf(cur) : -1
  const rep = levelReport(level)

  const setLevel = (fn) => setDraft((d) => d.map((lv, i) => (i === Math.min(li, d.length - 1) ? fn(lv) : lv)))
  const updQ = (i, patch) => setLevel((lv) => ({ ...lv, questions: lv.questions.map((q, k) => (k === i ? { ...q, ...patch } : q)) }))
  const updQi = (i, l, patch) => setLevel((lv) => ({ ...lv, questions: lv.questions.map((q, k) => (k === i ? { ...q, i18n: { ...q.i18n, [l]: { ...q.i18n?.[l], ...patch } } } : q)) }))
  const updM = (mi, patch) => setLevel((lv) => ({ ...lv, missions: lv.missions.map((m, k) => (k === mi ? { ...m, ...patch } : m)) }))
  const updMi = (mi, l, patch) => setLevel((lv) => ({ ...lv, missions: lv.missions.map((m, k) => (k === mi ? { ...m, i18n: { ...m.i18n, [l]: { ...m.i18n?.[l], ...patch } } } : m)) }))
  const note = (t) => setMsg(t)
  const run = async (label, fn) => { setBusy(true); note(`⏳ ${label}…`); try { await fn(); } catch (e) { note(`❌ ${e.message}`) } setBusy(false) }

  const changeWorld = (id) => { setWorldId(id); setDraft(clone(WORLDS[id].levels)); setLi(0); setSel(0); note('') }
  const addQ = () => { setLevel((lv) => ({ ...lv, questions: [...lv.questions, { t: topics[0] || 'general', lvl: 1, q: 'Nueva pregunta', ok: 'Respuesta correcta', bad: ['Trampa 1', 'Trampa 2'], fact: '', img: '💡', deep: ['', ''] }] })); setSel(level.questions.length); setFilter({ text: '', lvl: '', topic: '' }) }
  const dupQ = () => cur && setLevel((lv) => ({ ...lv, questions: [...lv.questions, clone(cur)] }))
  const delQ = () => { if (cur && window.confirm('¿Borrar esta pregunta?')) { setLevel((lv) => ({ ...lv, questions: lv.questions.filter((q) => q !== cur) })); setSel(0) } }
  const addLevel = () => { setDraft((d) => [...d, { id: `${worldId}-${d.length + 1}`, name: `Nivel ${d.length + 1}`, blurb: '', missions: clone(d[0].missions).map((m) => ({ ...m, story: ['', '', '', ''], intro: '', i18n: undefined })), questions: [] }]); setLi(draft.length) }
  const delLevel = () => { if (draft.length > 1 && window.confirm('¿Borrar este nivel completo?')) { setDraft((d) => d.filter((_, i) => i !== li)); setLi(0) } }

  const save = () => run('Guardando en Supabase', async () => { await saveWorldContent(worldId, draft); note('✅ Guardado: el juego ya usa este contenido') })
  const reset = () => { if (window.confirm('¿Volver al contenido de serie del código? Se borra lo guardado en Supabase para este mundo.')) run('Restableciendo', async () => { await resetWorldContent(worldId); changeWorld(worldId); note('✅ Restablecido a la semilla') }) }
  const exportJson = () => download(`oliver-racing-${worldId}.json`, JSON.stringify({ levels: draft }, null, 1))
  const importFile = async (e, mode) => {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    try {
      const data = JSON.parse(await f.text())
      if (mode === 'questions') { // agrega preguntas al nivel actual
        const qs = sanitizeLevels([{ missions: [{ name: 'x' }], questions: Array.isArray(data) ? data : data.questions || data.levels?.[0]?.questions || [] }])[0]?.questions || []
        setLevel((lv) => ({ ...lv, questions: [...lv.questions, ...qs] })); note(`✅ Se agregaron ${qs.length} preguntas al nivel actual (revisa y guarda)`)
      } else { // reemplaza todos los niveles del mundo
        const lv = sanitizeLevels(Array.isArray(data) ? data : data.levels)
        if (!lv.length) throw new Error('El archivo no trae niveles válidos'); setDraft(lv); setLi(0); setSel(0); note(`✅ Se cargaron ${lv.length} nivel(es) (revisa y guarda)`)
      }
    } catch (err) { note(`❌ Archivo inválido: ${err.message}`) }
  }

  const tr1 = (l) => run(`Traduciendo a ${l.toUpperCase()}`, async () => { const t = await translateQuestion(cur, l); updQi(curIdx, l, t); note(`✅ Traducida a ${l.toUpperCase()} (revísala)`) })
  const trAll = () => run('Traduciendo pendientes', async () => {
    let n = 0
    for (const l of ['en', 'fr']) for (let i = 0; i < level.questions.length; i++) {
      const q = level.questions[i]; if (q.i18n?.[l]?.q) continue
      note(`⏳ Traduciendo ${l.toUpperCase()} ${i + 1}/${level.questions.length}…`)
      const t = await translateQuestion(q, l); updQi(i, l, t); n++
    }
    note(`✅ ${n} traducciones hechas (revísalas y guarda)`)
  })
  const trMission = (mi, l) => run(`Traduciendo misión a ${l.toUpperCase()}`, async () => { const t = await translateMission(level.missions[mi], l); updMi(mi, l, t); note('✅ Misión traducida (revísala)') })
  const generate = () => run('Generando preguntas con tu IA', async () => {
    const qs = await generateQuestions({ worldName: world.name, levelName: level.name, topic: gen.topic || topics[0] || 'general', lvl: Number(gen.lvl), count: Number(gen.count), existing: level.questions.map((q) => q.q) })
    const valid = qs.filter((q) => q.q && q.ok && q.bad.length)
    setLevel((lv) => ({ ...lv, questions: [...lv.questions, ...valid] })); note(`✅ ${valid.length} preguntas nuevas al final de la lista: REVÍSALAS antes de guardar`)
  })

  if (!isAdmin) return <div className="grid min-h-screen place-items-center bg-[#07070f] p-6 text-white">Solo los administradores pueden editar el contenido de Oliver Racing.</div>

  const f = (l) => (l === 'es' ? cur : cur?.i18n?.[l]) || {}
  const setF = (l, patch) => (l === 'es' ? updQ(curIdx, patch) : updQi(curIdx, l, patch))
  const badOf = (l, k) => (l === 'es' ? cur.bad[k] : cur.i18n?.[l]?.bad?.[k]) ?? ''
  const setBad = (l, k, v) => { const base = l === 'es' ? [...cur.bad] : [...(cur.i18n?.[l]?.bad || cur.bad.map(() => ''))]; base[k] = v; setF(l, { bad: base }) }
  const deepOf = (l, k) => (l === 'es' ? cur.deep?.[k] : (cur.i18n?.[l]?.deep || '').split('|')[k]) ?? ''
  const setDeep = (l, k, v) => { const arr = l === 'es' ? [...(cur.deep || ['', ''])] : (cur.i18n?.[l]?.deep || '|').split('|'); arr[k] = v; setF(l, { deep: l === 'es' ? arr : arr.join('|') }) }

  return (
    <div className="min-h-screen bg-[#07070f] p-3 text-white sm:p-5">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/carrera" className="rounded-full bg-white/10 px-3 py-1 text-xs">← Juego</Link>
          <h1 className="text-lg font-extrabold">🛠️ Editor de Oliver Racing</h1>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] opacity-70" title={dbError || ''}>{status === 'ready' ? '☁️ Supabase' : status === 'error' ? '⚠️ solo local (falta la migración 085)' : status === 'loading' ? '…' : '💾 local'}</span>
          <select className={`${inp} !w-auto`} value={worldId} onChange={(e) => changeWorld(e.target.value)}>{WORLD_LIST.map((w) => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}</select>
          <div className="ml-auto flex flex-wrap gap-1.5">
            <button className={btn} onClick={exportJson}>⬇ Exportar</button>
            <button className={btn} onClick={() => fileRef.current?.click()}>⬆ Importar</button>
            <button className={btn} disabled={busy} onClick={reset}>↺ Restablecer</button>
            <button className={`${btn} !bg-amber-500/30`} disabled={busy} onClick={save}>💾 Guardar</button>
          </div>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => importFile(e, 'levels')} />
        </div>
        {msg && <p className="mt-2 rounded-md bg-white/5 px-3 py-1.5 text-xs">{msg}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {draft.map((lv, i) => <button key={lv.id + i} className={`${btn} ${i === li ? '!bg-white/25' : ''}`} onClick={() => { setLi(i); setSel(0) }}>{lv.name} <span className={lv.questions.length >= MIN_QUESTIONS ? 'text-emerald-300' : 'text-amber-300'}>({lv.questions.length})</span></button>)}
          <button className={btn} onClick={addLevel}>＋ Nivel</button><button className={btn} onClick={delLevel}>🗑 Nivel</button>
          <div className="ml-auto flex items-center gap-1.5 text-xs"><span className="opacity-60">Idioma:</span>{LANGS.map(([l, n]) => <button key={l} className={`${btn} ${lang === l ? '!bg-sky-500/40' : ''}`} onClick={() => setLang(l)}>{n}</button>)}</div>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2"><Field label="Nombre del nivel"><input className={inp} value={level.name} onChange={(e) => setLevel((lv) => ({ ...lv, name: e.target.value }))} /></Field><Field label="Descripción"><input className={inp} value={level.blurb} onChange={(e) => setLevel((lv) => ({ ...lv, blurb: e.target.value }))} /></Field></div>

        <div className="mt-3 flex gap-1.5 border-b border-white/10 pb-2 text-xs">{[['preguntas', `📝 Preguntas (${level.questions.length})`], ['misiones', '🗺️ Misiones e historias'], ['herramientas', '🧰 Informe, IA e importar']].map(([k, n]) => <button key={k} className={`${btn} ${tab === k ? '!bg-white/25' : ''}`} onClick={() => setTab(k)}>{n}</button>)}</div>

        {tab === 'preguntas' && (
          <div className="mt-3 grid gap-3 lg:grid-cols-[320px_1fr]">
            <div>
              <div className="grid grid-cols-3 gap-1.5"><input className={`${inp} col-span-3`} placeholder="Buscar…" value={filter.text} onChange={(e) => setFilter({ ...filter, text: e.target.value })} />
                <select className={inp} value={filter.lvl} onChange={(e) => setFilter({ ...filter, lvl: e.target.value })}><option value="">Toda dif.</option>{[0, 1, 2, 3, 4].map((l) => <option key={l} value={l}>Dif. {l}</option>)}</select>
                <select className={`${inp} col-span-2`} value={filter.topic} onChange={(e) => setFilter({ ...filter, topic: e.target.value })}><option value="">Todo tema</option>{topics.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="mt-2 max-h-[62vh] overflow-auto rounded-lg border border-white/10">
                {rows.map(({ q, i }) => <button key={i} onClick={() => setSel(i)} className={`block w-full border-b border-white/5 px-2 py-1.5 text-left text-xs ${i === curIdx ? 'bg-white/15' : 'hover:bg-white/5'}`}><span className="mr-1">{q.img}</span><b className="mr-1 opacity-60">{q.lvl}</b>{q.q.slice(0, 70)}{!q.i18n?.en?.q && <span title="falta inglés" className="ml-1 text-amber-300">EN</span>}{!q.i18n?.fr?.q && <span title="falta francés" className="ml-1 text-amber-300">FR</span>}</button>)}
                {!rows.length && <div className="p-3 text-xs opacity-60">Sin resultados</div>}
              </div>
              <div className="mt-2 flex gap-1.5"><button className={btn} onClick={addQ}>＋ Nueva</button><button className={btn} onClick={dupQ}>⧉ Duplicar</button><button className={btn} onClick={delQ}>🗑 Borrar</button></div>
            </div>
            {cur && (
              <div className="space-y-2 rounded-xl border border-white/10 p-3">
                {lang === 'es' && <div className="grid grid-cols-4 gap-2"><Field label="Tema"><input className={inp} list="tmp" value={cur.t} onChange={(e) => updQ(curIdx, { t: e.target.value })} /><datalist id="tmp">{topics.map((t) => <option key={t} value={t} />)}</datalist></Field><Field label="Dificultad 0–4"><select className={inp} value={cur.lvl} onChange={(e) => updQ(curIdx, { lvl: Number(e.target.value) })}>{[0, 1, 2, 3, 4].map((l) => <option key={l} value={l}>{l}</option>)}</select></Field><Field label="Emoji / imagen"><input className={inp} value={cur.img} onChange={(e) => updQ(curIdx, { img: e.target.value })} /></Field><div className="flex items-end gap-1"><button className={btn} disabled={busy} onClick={() => tr1('en')}>🤖 EN</button><button className={btn} disabled={busy} onClick={() => tr1('fr')}>🤖 FR</button></div></div>}
                {lang !== 'es' && <p className="text-[11px] opacity-60">Editando {lang.toUpperCase()}: lo vacío se muestra en español. <button className="underline" disabled={busy} onClick={() => tr1(lang)}>🤖 Traducir con IA</button></p>}
                <Field label={`Pregunta${lang !== 'es' ? ` (${cur.q})` : ''}`}><textarea className={inp} rows={2} value={f(lang).q || ''} onChange={(e) => setF(lang, { q: e.target.value })} /></Field>
                <Field label="✔ Respuesta correcta"><input className={inp} value={f(lang).ok || ''} onChange={(e) => setF(lang, { ok: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-2">{[0, 1].map((k) => <Field key={k} label={`✘ Trampa ${k + 1}${k ? ' (opcional: con 2 trampas sirve en carriles de 3)' : ''}`}><input className={inp} value={badOf(lang, k)} onChange={(e) => setBad(lang, k, e.target.value)} /></Field>)}</div>
                <Field label="💡 Dato curioso (corto)"><textarea className={inp} rows={2} value={f(lang).fact || ''} onChange={(e) => setF(lang, { fact: e.target.value })} /></Field>
                <div className="grid gap-2 sm:grid-cols-2">{[0, 1].map((k) => <Field key={k} label={`📘 Explicación detallada · párrafo ${k + 1} (ruta de repaso)`}><textarea className={inp} rows={6} value={deepOf(lang, k)} onChange={(e) => setDeep(lang, k, e.target.value)} /></Field>)}</div>
              </div>
            )}
          </div>
        )}

        {tab === 'misiones' && (
          <div className="mt-3 space-y-3">
            {level.missions.map((m, mi) => {
              const g = (l) => (l === 'es' ? m : m.i18n?.[l]) || {}
              const set = (patch) => (lang === 'es' ? updM(mi, patch) : updMi(mi, lang, patch))
              const story = (k) => (lang === 'es' ? m.story[k] : g(lang).story?.[k]) ?? ''
              const setStory = (k, v) => { const arr = lang === 'es' ? [...m.story] : [...(g(lang).story || m.story.map(() => ''))]; arr[k] = v; set({ story: arr }) }
              return (
                <div key={mi} className="rounded-xl border border-white/10 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold">Misión {mi + 1}<button className={btn} disabled={busy} onClick={() => trMission(mi, 'en')}>🤖 EN</button><button className={btn} disabled={busy} onClick={() => trMission(mi, 'fr')}>🤖 FR</button></div>
                  <div className="grid gap-2 sm:grid-cols-4">
                    <Field label="Nombre"><input className={inp} value={g(lang).name || ''} onChange={(e) => set({ name: e.target.value })} /></Field>
                    {lang === 'es' && <><Field label="Emoji"><input className={inp} value={m.img} onChange={(e) => updM(mi, { img: e.target.value })} /></Field><Field label="Escenario"><select className={inp} value={m.deco} onChange={(e) => updM(mi, { deco: e.target.value })}>{DECOS.map((d) => <option key={d}>{d}</option>)}</select></Field><Field label="Temas de preguntas (coma)"><input className={inp} value={m.topics.join(', ')} onChange={(e) => updM(mi, { topics: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} /></Field></>}
                  </div>
                  {lang === 'es' && <div className="mt-2 flex flex-wrap gap-2">{PAL_KEYS.map((k) => <label key={k} className="flex items-center gap-1 text-[10px] opacity-80">{k}<input type="color" className="h-6 w-8 bg-transparent" value={m.pal[k]} onChange={(e) => updM(mi, { pal: { ...m.pal, [k]: e.target.value } })} /></label>)}</div>}
                  <div className="mt-2"><Field label="Introducción (la lee el locutor al empezar)"><textarea className={inp} rows={3} value={g(lang).intro || ''} onChange={(e) => set({ intro: e.target.value })} /></Field></div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">{[0, 1, 2, 3].map((k) => <Field key={k} label={`📖 Episodio ${k + 1} de la historia (tras la bifurcación ${k + 1})`}><textarea className={inp} rows={4} value={story(k)} onChange={(e) => setStory(k, e.target.value)} /></Field>)}</div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'herramientas' && (
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 p-3 text-xs">
              <div className="mb-2 text-sm font-bold">📊 Informe del nivel</div>
              <p className={rep.ok ? 'text-emerald-300' : 'text-amber-300'}>{rep.total} preguntas {rep.ok ? `(cumple el mínimo de ${MIN_QUESTIONS})` : `(faltan ${MIN_QUESTIONS - rep.total} para el mínimo de ${MIN_QUESTIONS})`}</p>
              <p className="mt-1">Por dificultad 0–4: {rep.byLvl.join(' · ')} {rep.byLvl.some((n) => n === 0) && <span className="text-amber-300">(hay dificultades sin preguntas)</span>}</p>
              <p className="mt-1">Con 2 trampas (sirven en carriles de 3): {rep.threeOpt} · Sin explicación detallada: <span className={rep.noDeep ? 'text-amber-300' : ''}>{rep.noDeep}</span></p>
              <p className="mt-1">Sin traducir → EN: <span className={rep.noEn ? 'text-amber-300' : ''}>{rep.noEn}</span> · FR: <span className={rep.noFr ? 'text-amber-300' : ''}>{rep.noFr}</span> · Misiones: {rep.missions}</p>
              <button className={`${btn} mt-3`} disabled={busy} onClick={trAll}>🤖 Traducir todas las pendientes (EN + FR)</button>
            </div>
            <div className="rounded-xl border border-white/10 p-3 text-xs">
              <div className="mb-2 text-sm font-bold">🤖 Generar preguntas con tu IA</div>
              <div className="grid grid-cols-3 gap-2"><Field label="Tema"><input className={inp} list="tmp2" value={gen.topic} onChange={(e) => setGen({ ...gen, topic: e.target.value })} placeholder={topics[0]} /><datalist id="tmp2">{topics.map((t) => <option key={t} value={t} />)}</datalist></Field><Field label="Dificultad 0–4"><select className={inp} value={gen.lvl} onChange={(e) => setGen({ ...gen, lvl: e.target.value })}>{[0, 1, 2, 3, 4].map((l) => <option key={l}>{l}</option>)}</select></Field><Field label="Cantidad (1–10)"><input className={inp} type="number" min="1" max="10" value={gen.count} onChange={(e) => setGen({ ...gen, count: e.target.value })} /></Field></div>
              <button className={`${btn} mt-3`} disabled={busy} onClick={generate}>✨ Generar y agregar al nivel</button>
              <p className="mt-2 opacity-60">Usa tu conexión de Ajustes → Núcleo. Revisa siempre lo generado antes de guardar: una IA puede equivocarse.</p>
            </div>
            <div className="rounded-xl border border-white/10 p-3 text-xs lg:col-span-2">
              <div className="mb-2 text-sm font-bold">⬆ Importar</div>
              <p className="opacity-70">Importar un archivo exportado reemplaza TODOS los niveles del mundo (usa el botón ⬆ de arriba). Para solo AGREGAR preguntas al nivel actual desde un JSON (lista de preguntas con los campos t, lvl, q, ok, bad, fact, img, deep):</p>
              <label className={`${btn} mt-2 inline-block cursor-pointer`}>Agregar preguntas desde JSON<input type="file" accept="application/json,.json" className="hidden" onChange={(e) => importFile(e, 'questions')} /></label>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RacingEditor() {
  const version = useRacingContentStore((s) => s.version)
  useEffect(() => { loadRemoteRacing() }, []) // una sola vez (cargar remoto sube `version` y remonta el editor)
  return <EditorInner key={version} /> // al llegar o guardarse contenido remoto se recarga el borrador
}
