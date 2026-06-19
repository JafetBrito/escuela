import { useState } from 'react'
import { useGameStore } from '../../stores/useGameStore'
import { useVrCharacterStore } from '../../stores/useVrCharacterStore'
import { SKILL_REGISTRY } from '../../data/skillRegistry'

export default function SkillTreePanel() {
  const activeChar = useVrCharacterStore((s) => s.activeChar)
  const owner = activeChar === 'mascot' ? 'oliver' : 'player'
  const skills = useGameStore((s) => s[owner].skills)
  const equipSkill = useGameStore((s) => s.equipSkill)
  const [selected, setSelected] = useState(null)

  const charLabel = activeChar === 'mascot' ? '🐾 Mascota' : '🧑 Avatar'

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
        🌳 Árbol de habilidades — {charLabel}
      </p>

      {/* Equipped slots */}
      <div>
        <p className="mb-2 text-xs text-text-muted">
          Slots equipados {selected ? '— haz clic en un slot para equipar' : ''}
        </p>
        <div className="flex gap-2">
          {skills.equipped.map((id, slot) => {
            const sk = id ? SKILL_REGISTRY[id] : null
            return (
              <button
                key={slot}
                type="button"
                onClick={() => selected && equipSkill(owner, selected, slot)}
                className={`flex flex-col items-center justify-center rounded-xl border p-2 transition-colors ${
                  selected
                    ? 'cursor-pointer border-primary hover:bg-primary/10'
                    : 'cursor-default border-border'
                }`}
                style={{ width: 56, height: 60 }}
                title={selected ? `Equipar aquí (slot ${slot + 1})` : `Slot ${slot + 1}: ${sk?.name ?? 'vacío'}`}
              >
                <span style={{ fontSize: 20 }}>{sk?.icon ?? '—'}</span>
                <span className="mt-0.5 text-text-muted" style={{ fontSize: 9 }}>{slot + 1}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Unlocked skills list */}
      <div>
        <p className="mb-2 text-xs text-text-muted">Habilidades disponibles — selecciona una</p>
        {skills.unlocked.length === 0 ? (
          <p className="text-sm text-text-muted">
            Sin habilidades. Selecciona una clase en el Árbol del Mundo para comenzar.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {skills.unlocked.map((id) => {
              const sk = SKILL_REGISTRY[id]
              if (!sk) return null
              const isSelected = selected === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelected(isSelected ? null : id)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    isSelected ? 'border-primary bg-primary/10' : 'border-border hover:bg-surface'
                  }`}
                >
                  <span style={{ fontSize: 26 }}>{sk.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text">{sk.name}</p>
                    <p className="text-xs text-text-muted">{sk.description}</p>
                  </div>
                  {isSelected && (
                    <span className="text-xs font-bold text-primary">✓ Selec.</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
