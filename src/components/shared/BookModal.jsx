import { useItemEffectsStore } from '../../stores/useItemEffectsStore'

const SECTIONS = [
  {
    title: '¿Qué es OLIVER SCHOOL?',
    text: 'Una plataforma de cursos interactivos acompañada por una mascota virtual que te ayuda a aprender, te da misiones y te recompensa con monedas.',
  },
  {
    title: 'Monedas',
    text: 'Ganas oro, plata y cobre completando misiones (quizzes, chats y desbloqueando objetos). 100 cobre = 1 plata, 100 plata = 1 oro. Gástalas en la Tienda.',
  },
  {
    title: 'Objetos',
    text: 'Algunos objetos son funcionales: actívalos desde "Objetos" en Mi mascota para desbloquear efectos como temas, cámara o este mismo libro.',
  },
  {
    title: 'Aspecto',
    text: 'Desde la pestaña Aspecto puedes cambiar la ropa y los accesorios de tu mascota sin cambiar su modelo.',
  },
  {
    title: 'Ajustes',
    text: 'En Ajustes puedes configurar tu clave de Minimax, el modelo de IA y cómo se comporta tu mascota (tono y nivel de detalle).',
  },
]

export default function BookModal() {
  const toggleItem = useItemEffectsStore((s) => s.toggleItem)
  const close = () => toggleItem('libro')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <p className="text-base font-bold text-text">📖 Libro de Conocimiento</p>
          <button onClick={close} className="text-text-muted hover:text-text" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto p-6">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-primary">{section.title}</h3>
              <p className="mt-1 text-sm text-text-muted">{section.text}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end border-t border-border px-5 py-3">
          <button
            onClick={close}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-background hover:bg-primary-hover"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
