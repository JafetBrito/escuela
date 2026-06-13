import AppTopBar from '../shared/AppTopBar'

const PROTOTYPE_GAMES = [
  {
    id: 'quiz-rapido',
    icon: '🧠',
    name: 'Quiz Rápido',
    description: 'Responde preguntas relámpago sobre tus cursos y gana monedas por cada acierto.',
  },
  {
    id: 'memoria',
    icon: '🃏',
    name: 'Memoria de Conceptos',
    description: 'Empareja conceptos clave con su definición antes de que se acabe el tiempo.',
  },
  {
    id: 'trivia-clases',
    icon: '🎯',
    name: 'Trivia por Clase',
    description: 'Pon a prueba lo que aprendiste en cada módulo con preguntas de opción múltiple.',
  },
]

export default function GamesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">🎮 Games</h1>
            <p className="mt-1 text-sm text-text-muted">
              Juegos de preguntas y quizzes para ganar monedas mientras repasas.
            </p>
          </div>

          <div className="tech-panel flex flex-col items-center gap-2 p-8 text-center">
            <p className="text-4xl">🚧</p>
            <p className="tech-label">Próximamente</p>
            <p className="max-w-md text-sm text-text-muted">
              Estamos construyendo esta sección. Muy pronto podrás jugar y ganar monedas
              para gastar en la Tienda.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROTOTYPE_GAMES.map((game) => (
              <div key={game.id} className="tech-card relative flex flex-col gap-2 p-5 opacity-70">
                <span className="absolute right-3 top-3 rounded-full border border-primary/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Próximamente
                </span>
                <div className="text-3xl">{game.icon}</div>
                <h2 className="text-base font-bold text-text">{game.name}</h2>
                <p className="text-sm text-text-muted">{game.description}</p>
                <button
                  disabled
                  className="mt-auto self-start rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-muted opacity-60"
                >
                  Jugar
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
