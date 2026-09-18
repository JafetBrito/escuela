import { getVrClassById, VR_CLASSES } from '../../data/vrClassRegistry'

// Instrucciones al entrar a CUALQUIER Salón de Clases — sistema reutilizable
// para toda clase futura, no algo hecho a mano para una sola. Se muestra
// una vez por entrada (VRPage controla el "ya la vi" con un simple
// useState, no se persiste — cada visita nueva la vuelve a mostrar a
// propósito, es corta e informativa, no un tutorial pesado).
export default function ClassroomIntroModal({ classId, onClose }) {
  const cls = getVrClassById(classId) ?? Object.values(VR_CLASSES)[0]

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-primary/30 bg-surface p-6 shadow-2xl">
        <p className="text-center text-4xl">🏫</p>
        <p className="mt-2 text-center text-xl font-extrabold text-text">{cls.title}</p>
        <p className="text-center text-sm text-text-muted">Con {cls.teacherName} · {cls.durationMinutes} min</p>

        <div className="mt-4 space-y-2.5 text-sm text-text">
          <p>1️⃣ Camina hacia {cls.teacherName} y háblale (clic) para empezar la clase.</p>
          <p>2️⃣ Escucha con calma, tómate tu tiempo en las pausas de reflexión, y pregunta lo que quieras cuando quieras con el botón "❓ Preguntar".</p>
          <p>3️⃣ Al terminar, según la clase, vas a poder resolver un ejercicio o pasar a la siguiente.</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-background hover:opacity-90"
        >
          Entendido, ¡vamos! →
        </button>
      </div>
    </div>
  )
}
