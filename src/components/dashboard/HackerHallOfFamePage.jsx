import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'

// Salón de la Fama Hacker (/salon-de-la-fama-hacker) — parte de la Academia de
// Ciberseguridad. Primera inducción especial: Ken Thompson. Para sumar a alguien
// más, agregar un objeto a INDUCTEES (los especiales llevan `special: true`).
const TRUSTING_TRUST_STEPS = [
  { title: '1 · Un compilador que se compila a sí mismo', text: 'El compilador de C está escrito en C. Para construir uno nuevo se usa el anterior. Esa cadena de “el compilador viejo hace al nuevo” es el punto que Thompson va a explotar.' },
  { title: '2 · Truco #1: la puerta trasera', text: 'Modifica el compilador para que, cuando detecte que está compilando el programa de inicio de sesión (login), le agregue en secreto una contraseña maestra. El código de login se ve limpio; el binario ya trae la puerta trasera.' },
  { title: '3 · Truco #2: que se reproduzca', text: 'Le enseña al compilador a reconocer cuándo se está compilando A SÍ MISMO y a volver a insertar los dos trucos en el compilador nuevo. Es un programa que se replica en su propia herramienta de construcción.' },
  { title: '4 · Borrar la evidencia', text: 'Ahora quita los dos trucos del código fuente del compilador. Ya no hacen falta: el binario los lleva y los pasa a cada generación. Cualquiera que revise el código fuente no encuentra nada raro.' },
  { title: 'La lección', text: '“No puedes confiar en código que no hayas creado totalmente tú mismo.” Revisar el código fuente no basta: hay que confiar (o verificar) toda la cadena — compiladores, herramientas y quienes las hicieron. Hoy se combate con compilaciones reproducibles y con compilar desde varias fuentes independientes.' },
]

const INDUCTEES = [
  {
    id: 'thompson', special: true, emoji: '🐧', name: 'Ken Thompson', years: '1943 –', role: 'Co-creador de Unix · Turing Award 1983',
    born: 'Nació el 4 de febrero de 1943 en Nueva Orleans. Estudió ingeniería eléctrica en la Universidad de California en Berkeley (licenciatura 1965, maestría 1966) y entró a los Laboratorios Bell en 1966.',
    legacy: [
      ['Unix (1969)', 'Junto con Dennis Ritchie, creó Unix en una computadora PDP-7 que había quedado sin uso tras retirarse Bell Labs del proyecto Multics. De ahí descienden Linux, macOS, Android y buena parte de Internet.'],
      ['Lenguaje B', 'Escribió B, el antecesor directo de C (el lenguaje que Ritchie desarrolló a partir de él).'],
      ['grep y las expresiones regulares', 'Llevó las expresiones regulares a los editores de texto (ed) y creó grep en 1973 para buscar patrones en archivos: hoy lo usa todo profesional de seguridad.'],
      ['Belle, la computadora de ajedrez', 'Con Joe Condon construyó Belle, campeona mundial de ajedrez por computadora en 1980. Sus bases de datos de finales de partida revolucionaron el ajedrez computacional.'],
      ['Plan 9 y UTF-8', 'Coautor de Plan 9 de Bell Labs. En 1992, con Rob Pike, diseñó UTF-8 — la codificación que permite escribir en cualquier idioma y que hoy usa casi toda la web.'],
      ['Go (2007)', 'En Google, con Robert Griesemer y Rob Pike, diseñó el lenguaje Go, presentado públicamente en 2009.'],
    ],
    awards: 'Premio Turing 1983 (con Ritchie) · Medalla Nacional de Tecnología de EE. UU., 1998.',
    fun: [
      'En 2019 se logró descifrar la contraseña de Unix de Thompson de los años 70, guardada en el código fuente de BSD: era “p/q2-q4!”, una jugada de ajedrez. Incluso su contraseña era un movimiento de peón.',
      'A él se le atribuye la frase: “When in doubt, use brute force” (“ante la duda, usa fuerza bruta”).',
    ],
  },
  { id: 'ritchie', emoji: '💻', name: 'Dennis Ritchie', years: '1941 – 2011', role: 'Creador del lenguaje C y co-creador de Unix', blurb: 'Su lenguaje C sigue siendo la base de sistemas operativos, navegadores y la mayoría del software de seguridad.' },
  { id: 'hopper', emoji: '⚓', name: 'Grace Hopper', years: '1906 – 1992', role: 'Pionera de los compiladores', blurb: 'Creó uno de los primeros compiladores y defendió programar en algo cercano al lenguaje humano. Popularizó el término “bug” tras hallar una polilla en una computadora Harvard en 1947.' },
  { id: 'stallman', emoji: '🗽', name: 'Richard Stallman', years: '1953 –', role: 'Fundador del proyecto GNU', blurb: 'Inició en 1983 el movimiento del software libre: poder leer, modificar y compartir el código es una condición para poder confiar en él.' },
  { id: 'torvalds', emoji: '🐧', name: 'Linus Torvalds', years: '1969 –', role: 'Creador de Linux', blurb: 'En 1991 publicó el núcleo de Linux, hoy presente en la mayoría de los servidores del mundo y en Android.' },
  { id: 'zimmermann', emoji: '🔑', name: 'Phil Zimmermann', years: '1954 –', role: 'Creador de PGP', blurb: 'En 1991 publicó PGP para que cualquier persona pudiera cifrar su correo: la privacidad como derecho.' },
  { id: 'mitnick', emoji: '🎭', name: 'Kevin Mitnick', years: '1963 – 2023', role: 'De hacker a consultor', blurb: 'Famoso por la ingeniería social: demostró que engañar a una persona suele ser más fácil que romper una máquina.' },
]

function TrustingTrust() {
  const [step, setStep] = useState(0)
  const cur = TRUSTING_TRUST_STEPS[step]
  return (
    <div className="rounded-2xl border border-[#2dd4bf]/30 bg-black/40 p-5">
      <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#2dd4bf]">&gt; Reflections on Trusting Trust (1984)</p>
      <p className="mt-1 text-sm text-white/70">La conferencia del Premio Turing de Thompson: el ataque que no se ve leyendo el código. Recórrelo paso a paso.</p>
      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="font-bold text-white">{cur.title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-white/80">{cur.text}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1.5">
          {TRUSTING_TRUST_STEPS.map((s, i) => (
            <button key={s.title} type="button" onClick={() => setStep(i)} aria-label={`Paso ${i + 1}`} className={`h-2.5 w-2.5 rounded-full transition ${i === step ? 'bg-[#2dd4bf]' : 'bg-white/20 hover:bg-white/40'}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold text-white/80 disabled:opacity-30">← Anterior</button>
          <button type="button" disabled={step === TRUSTING_TRUST_STEPS.length - 1} onClick={() => setStep((s) => s + 1)} className="rounded-lg bg-[#2dd4bf] px-3 py-1.5 text-xs font-black text-black disabled:opacity-30">Siguiente →</button>
        </div>
      </div>
    </div>
  )
}

export default function HackerHallOfFamePage() {
  const special = INDUCTEES.filter((i) => i.special)
  const others = INDUCTEES.filter((i) => !i.special)

  return (
    <div className="flex min-h-screen flex-col bg-[#050b0a] text-white">
      <AppTopBar />
      <main className="flex-1">
        <div className="relative overflow-hidden px-6 py-14 text-center sm:py-20">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#2dd4bf 1px, transparent 1px), linear-gradient(90deg, #2dd4bf 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 0%, #050b0a 75%)' }} />
          <div className="relative mx-auto max-w-2xl">
            <Link to="/escuela/ciberseguridad" className="font-mono text-xs font-bold text-[#2dd4bf]/80 hover:underline">← Academia de Ciberseguridad</Link>
            <p className="mt-5 text-6xl drop-shadow-[0_0_20px_rgba(45,212,191,0.5)]">🏆</p>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Salón de la Fama <span className="text-[#2dd4bf]">Hacker</span></h1>
            <p className="mx-auto mt-3 max-w-lg text-sm font-medium text-white/60">Las personas que construyeron y rompieron el mundo digital — y de las que todavía aprendemos. Cada inducción trae su historia, su legado y su lección de seguridad.</p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-10 px-4 pb-16">
          {special.map((p) => (
            <section key={p.id} className="overflow-hidden rounded-3xl border border-[#2dd4bf]/40 bg-gradient-to-br from-[#0b1f1c] to-[#050b0a] shadow-[0_0_40px_rgba(45,212,191,0.12)]">
              <div className="flex flex-wrap items-center gap-5 border-b border-[#2dd4bf]/20 px-6 py-6">
                <span className="text-6xl">{p.emoji}</span>
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-amber-300">★ Inducción especial</p>
                  <h2 className="text-3xl font-black">{p.name}</h2>
                  <p className="text-sm font-semibold text-[#2dd4bf]">{p.role} · {p.years}</p>
                </div>
              </div>

              <div className="space-y-6 px-6 py-6">
                <p className="text-sm leading-relaxed text-white/80">{p.born}</p>

                <div>
                  <h3 className="mb-3 font-mono text-xs font-black uppercase tracking-widest text-[#2dd4bf]">&gt; Su legado</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {p.legacy.map(([title, text]) => (
                      <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="font-bold text-white">{title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-white/70">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <TrustingTrust />

                <p className="rounded-xl border border-amber-300/30 bg-amber-300/5 px-4 py-3 text-sm font-semibold text-amber-200">🏅 {p.awards}</p>

                <div>
                  <h3 className="mb-2 font-mono text-xs font-black uppercase tracking-widest text-[#2dd4bf]">&gt; Curiosidades</h3>
                  <ul className="space-y-2">
                    {p.fun.map((f) => <li key={f} className="text-sm leading-relaxed text-white/75">🔸 {f}</li>)}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#2dd4bf]/30 bg-[#2dd4bf]/5 p-4">
                  <p className="font-mono text-[11px] font-black uppercase tracking-widest text-[#2dd4bf]">&gt; Reto para pensar</p>
                  <p className="mt-1 text-sm text-white/85">Si un compilador puede esconder una puerta trasera que no aparece en ningún código fuente, ¿en quién confías cuando instalas un programa? ¿Qué harías para verificarlo?</p>
                </div>
              </div>
            </section>
          ))}

          <section>
            <h2 className="mb-4 font-mono text-xs font-black uppercase tracking-widest text-[#2dd4bf]">&gt; Más miembros del Salón</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{p.emoji}</span>
                    <div>
                      <p className="font-bold text-white">{p.name}</p>
                      <p className="text-[11px] text-white/50">{p.years}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-bold text-[#2dd4bf]">{p.role}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">{p.blurb}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
