import { levelProgress } from '../../stores/useLevelStore'

// Tarjeta de solo lectura: nivel/XP, oro, y clase de personaje/mascota — se
// lee directo de profiles.snapshot (mismo jsonb que ya edita
// gmCommands.mutateRemoteSnapshot para otras cuentas), sin columnas nuevas.
export default function StudentSummaryCard({ student }) {
  const snapshot = student?.snapshot ?? {}
  const { level, xpIntoLevel, xpForNextLevel } = levelProgress(snapshot.xp ?? 0)
  const playerClass = snapshot.gameState?.player?.class
  const oliverClass = snapshot.gameState?.oliver?.class

  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-4">
      <div>
        <p className="text-2xl font-black text-primary">{level}</p>
        <p className="text-xs text-text-muted">Nivel · {xpIntoLevel}/{xpForNextLevel} XP</p>
      </div>
      <div>
        <p className="text-2xl font-black text-text">🪙 {snapshot.coins ?? 0}</p>
        <p className="text-xs text-text-muted">Monedas</p>
      </div>
      <div>
        <p className="text-2xl font-black text-text">{playerClass ? '⚔️' : '—'}</p>
        <p className="text-xs text-text-muted">Clase: {playerClass ?? 'sin elegir'}</p>
      </div>
      <div>
        <p className="text-2xl font-black text-text">{oliverClass ? '🐾' : '—'}</p>
        <p className="text-xs text-text-muted">Mascota: {oliverClass ?? 'sin elegir'}</p>
      </div>
    </div>
  )
}
