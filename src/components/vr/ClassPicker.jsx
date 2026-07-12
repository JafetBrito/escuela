import { useState } from 'react'
import { PLAYER_CLASSES } from '../../stores/useGameStore'

// Selector de clase canónico (estilo WoW: lista + panel de detalle). ÚNICO
// componente de selección de clase del juego — el Templo tutorial y (próximamente)
// el resto de flujos lo reutilizan, en vez de reimplementar la UI. Solo elige la
// clase del AVATAR; la mascota se elige en VrMascotOnboarding, y la selección se
// persiste vía useGameStore.selectPlayerClass (que fuerza guardado en la nube).
//
// props: isAdmin (habilita la clase Hacker), onSelect(classId), onClose (opcional).

const STAT_LABELS = { str: 'Fuerza', agi: 'Agilidad', sta: 'Resistencia', int: 'Intelecto', spi: 'Espíritu' }

// Comentario de Oliver por clase, mostrado al previsualizar cada una.
const OLIVER_CLASS_LINES = {
  warrior:  '¿Guerrero? Eso es lo mío — pelear con garras afiladas. Aunque yo uso las patas. ⚔️🐱',
  paladin:  'Paladín, fuerza y luz en uno. Yo también soy fuente de luz (la que bloquea tu sueño a las 3 AM). 🛡️',
  hunter:   'Cazador. Rastrear presas… igual que yo cuando acecho al cursor del mouse por horas. 🏹',
  rogue:    'Pícaro, ¿eh? Sigiloso y astuto, justo como cuando me acerco sin hacer ruido y te asusto. 🗡️',
  priest:   'Sacerdote, el que sostiene al equipo. Yo sostengo el sofá. Una gran responsabilidad. ✨',
  shaman:   'Chamán, ¡el que habla con los elementos! Yo le hablo a la croqueta y ella nunca responde. ⚡',
  mage:     'Mago, el pensador de largo alcance. Yo también predigo cosas… como cuándo me vas a dar atún. 🔮',
  warlock:  'Brujo… invocas sombras y demonios. Yo invoco atención a las 3 AM. Básicamente somos iguales. 🌑',
  druid:    'Druida, maestro de las formas. Yo también tengo muchas formas: dormido, hambriento y caótico. 🌿',
}

export default function ClassPicker({ isAdmin, onSelect, onClose }) {
  const classes = Object.values(PLAYER_CLASSES).filter((c) => c.id !== 'hacker' || isAdmin)
  const [selectedId, setSelectedId] = useState(classes[0]?.id ?? null)
  const cls = PLAYER_CLASSES[selectedId]

  return (
    <div className="fixed inset-0 z-[200] flex flex-col select-none" style={{ background: 'linear-gradient(160deg,#0a0407 0%,#140a12 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: '#c79c6e' }}>Oliver Academy</p>
          <p className="text-lg font-black text-white">Elige tu Clase</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden text-[10px] sm:block" style={{ color: 'rgba(255,255,255,0.25)' }}>Podrás cambiarla más adelante</p>
          {onClose && (
            <button type="button" onClick={onClose}
              className="rounded-xl px-3 py-1.5 text-xs font-bold transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: class list */}
        <div className="w-44 shrink-0 overflow-y-auto border-r p-2 sm:w-52" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {classes.map((c) => (
            <button key={c.id} type="button" onClick={() => setSelectedId(c.id)}
              className="mb-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all"
              style={{
                background: selectedId === c.id ? `${c.color}1a` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedId === c.id ? c.color : 'rgba(255,255,255,0.07)'}`,
              }}>
              <span className="text-xl shrink-0">{c.icon}</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-black" style={{ color: selectedId === c.id ? c.color : 'rgba(255,255,255,0.85)' }}>{c.name}</p>
                <p className="truncate text-[8px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{c.role}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Right: detail panel */}
        {cls && (
          <div className="flex-1 overflow-y-auto p-5">
            {/* Class header */}
            <div className="mb-4 flex items-center gap-4">
              <span className="text-5xl">{cls.icon}</span>
              <div>
                <p className="text-2xl font-black" style={{ color: cls.color }}>{cls.name}</p>
                <span className="mt-1 inline-block rounded-full px-3 py-0.5 text-[10px] font-black"
                  style={{ background: `${cls.color}22`, color: cls.color, border: `1px solid ${cls.color}44` }}>
                  {cls.role}
                </span>
              </div>
            </div>

            {/* Lore */}
            <p className="mb-5 max-w-lg text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{cls.lore}</p>

            {/* Stats + meta */}
            <div className="mb-5 flex gap-5">
              {/* Stat bars */}
              <div className="flex-1">
                <p className="mb-2 text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>Estadísticas</p>
                <div className="flex flex-col gap-2">
                  {Object.entries(cls.baseStats).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-20 text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{STAT_LABELS[key]}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.round((val / 25) * 100)}%`, background: cls.color }} />
                      </div>
                      <span className="w-5 text-right text-[10px] font-black" style={{ color: 'rgba(255,255,255,0.5)' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta: resource + armor */}
              <div className="w-36 shrink-0 flex flex-col gap-3">
                <div>
                  <p className="mb-1 text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>Recurso</p>
                  <p className="text-sm font-bold" style={{ color: cls.resourceType === 'rage' ? '#f97316' : cls.resourceType === 'energy' ? '#eab308' : '#69ccf0' }}>
                    {cls.resourceType === 'rage' ? '🔥 Rabia' : cls.resourceType === 'energy' ? '⚡ Energía' : '💧 Maná'}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>Armadura</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{cls.armor}</p>
                </div>
                <div>
                  <p className="mb-1 text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>Armas</p>
                  <p className="text-[10px] leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>{cls.weapons.join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Signature abilities */}
            <div className="mb-5">
              <p className="mb-2 text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>Habilidades características</p>
              <div className="flex gap-2">
                {cls.signatureAbilities.map((ab) => (
                  <div key={ab.id} className="flex-1 rounded-xl px-3 py-2.5"
                    style={{ border: `1px solid ${cls.color}33`, background: `${cls.color}08` }}>
                    <p className="mb-1 text-xs font-black" style={{ color: 'rgba(255,255,255,0.9)' }}>{ab.name}</p>
                    <p className="text-[9px] leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>{ab.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Oliver comment */}
            {OLIVER_CLASS_LINES[cls.id] && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl px-3.5 py-2.5"
                style={{ border: '1px solid rgba(251,146,60,0.25)', background: 'rgba(251,146,60,0.06)' }}>
                <span className="text-xl shrink-0">🐱</span>
                <p className="text-[11px] italic leading-snug" style={{ color: 'rgba(253,186,116,0.8)' }}>{OLIVER_CLASS_LINES[cls.id]}</p>
              </div>
            )}

            {/* Confirm */}
            <button type="button" onClick={() => onSelect(selectedId)}
              className="w-full rounded-2xl py-3.5 text-base font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${cls.color} 0%, ${cls.color}cc 100%)`, color: '#0a0407' }}>
              Elegir {cls.name} →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
