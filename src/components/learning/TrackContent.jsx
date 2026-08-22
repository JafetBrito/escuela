import { getCourseTrack } from '../../utils/courseTrack'
import TextLesson from './TextLesson'

// Contenido condicional según la elección hecha en ApiTrackSelector.jsx.
// `module.trackContent = { default: 'nasa', variants: { nasa: html, clima: html, pokemon: html } }`
const TRACK_LABELS = {
  nasa: '🚀 NASA',
  clima: '🌦️ Open-Meteo (Clima)',
  pokemon: '🎮 PokéAPI',
}

export default function TrackContent({ courseId, module, className = '' }) {
  const tc = module.trackContent
  if (!tc) return null

  const track = getCourseTrack(courseId, tc.default)
  const html = tc.variants[track] ?? tc.variants[tc.default]

  return (
    <div className={className}>
      <p className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted">
        {TRACK_LABELS[track] ?? track} — tu API elegida
      </p>
      <TextLesson content={html} />
    </div>
  )
}
