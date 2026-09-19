import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import courses from '../../data/courses.json'
import { ACADEMIES } from '../../data/academies'

// Academia de Filosofía (/academia-filosofia) — versión mínima: portada,
// catálogo (categorías Filosofía + Ética) y la entrada a su mapa VR.
// ponytail: solo español y sin filtros; copiar AcademiaMedicinaPage si se necesitan.
const academy = ACADEMIES.filosofia

export default function AcademiaFilosofiaPage() {
  const navigate = useNavigate()
  const list = courses.filter((c) => c.category === 'Filosofía' || c.category === 'Ética')

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-amber-600 to-stone-700 px-6 py-14 text-center sm:py-20">
          <p className="text-5xl drop-shadow-sm">{academy.emoji}</p>
          <h1 className="mt-3 text-3xl font-black text-white drop-shadow-sm sm:text-4xl">{academy.name}</h1>
          <p className="mt-3 text-sm font-medium text-white/85 sm:text-base">Pensar mejor: lógica, ética y las grandes preguntas.</p>
          <p className="mt-2 text-xs font-bold text-white/80">Director: Jafet Brito</p>
          <a href="/vr/academia/filosofia" className="mt-5 inline-block rounded-full bg-background px-5 py-2 text-sm font-black text-text shadow transition hover:scale-105">🕶️ Entrar al campus VR de la academia</a>
        </div>
        <div className="mx-auto grid max-w-5xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => !c.locked && navigate(`/learn/${c.id}`)}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 text-left transition hover:-translate-y-1 hover:border-primary/50"
            >
              <p className="text-sm font-bold text-text">{c.icon} {c.title}</p>
              <p className="line-clamp-3 text-xs text-text-muted">{c.description}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
