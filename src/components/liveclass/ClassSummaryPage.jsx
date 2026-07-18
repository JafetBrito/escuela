import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { supabase } from '../../services/supabase/client'

// Resumen imprimible de una clase en vivo — el chat (live_class_chat) se
// borra al finalizar la clase (ver endClass en useLiveClassStore.js), así
// que esta es la única forma de "llevarse" la sesión: se pide todo una sola
// vez (sin realtime, sin efectos secundarios) y se imprime con
// window.print() + CSS @media print, sin agregar ninguna librería de PDF.
export default function ClassSummaryPage() {
  const { classId } = useParams()
  const [cls, setCls] = useState(null)
  const [questions, setQuestions] = useState([])
  const [chat, setChat] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      supabase.from('live_classes').select('*').eq('id', classId).single(),
      supabase.from('live_class_questions').select('*').eq('live_class_id', classId).order('created_at', { ascending: true }),
      supabase.from('live_class_chat').select('*').eq('live_class_id', classId).order('created_at', { ascending: true }),
    ]).then(([{ data: c }, { data: qs }, { data: msgs }]) => {
      if (cancelled) return
      setCls(c ?? null)
      setQuestions(qs ?? [])
      setChat(msgs ?? [])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [classId])

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          #summary-print { box-shadow: none !important; border: none !important; }
          body { background: white !important; }
        }
      `}</style>
      <div className="no-print"><AppTopBar /></div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="no-print mb-4 flex items-center justify-between">
          <Link to={`/mis-clases/${classId}`} className="text-sm font-bold text-primary hover:underline">← Volver a la clase</Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90"
          >
            🖨️ Guardar como PDF
          </button>
        </div>

        {loading && <p className="text-sm text-text-muted">Cargando resumen…</p>}

        {!loading && !cls && (
          <p className="text-sm text-text-muted">No se encontró esta clase.</p>
        )}

        {!loading && cls && (
          <div id="summary-print" className="space-y-5 rounded-2xl border border-border bg-surface p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Resumen de clase</p>
              <h1 className="text-2xl font-bold text-text">{cls.title}</h1>
              {cls.student_name && <p className="text-sm text-text-muted">Alumno: {cls.student_name}</p>}
              {cls.scheduled_at && <p className="text-sm text-text-muted">{new Date(cls.scheduled_at).toLocaleString()}</p>}
            </div>

            {cls.current_topic && (
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-text-muted">📍 Tema visto</p>
                <p className="text-sm text-text">{cls.current_topic}</p>
              </div>
            )}

            {cls.agenda?.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-text-muted">🗒️ Agenda</p>
                <ul className="list-disc space-y-0.5 pl-5 text-sm text-text">
                  {cls.agenda.map((item, i) => <li key={i}>{item.label}</li>)}
                </ul>
              </div>
            )}

            {cls.resources?.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-text-muted">📎 Recursos</p>
                <ul className="space-y-0.5 text-sm">
                  {cls.resources.map((r, i) => (
                    <li key={i}><a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{r.label}</a></li>
                  ))}
                </ul>
              </div>
            )}

            {cls.missions?.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-text-muted">🎯 Misiones</p>
                <ul className="list-disc space-y-0.5 pl-5 text-sm text-text">
                  {cls.missions.map((m, i) => <li key={i}>{m.title}</li>)}
                </ul>
              </div>
            )}

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-text-muted">❓ Preguntas</p>
              {questions.length === 0 && <p className="text-sm text-text-muted">Sin preguntas.</p>}
              <div className="space-y-2">
                {questions.map((q) => (
                  <div key={q.id} className="text-sm text-text">
                    <p>❓ {q.question}</p>
                    {q.answered && <p className="text-emerald-500">💬 {q.answer}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-text-muted">💬 Chat de la clase</p>
              {chat.length === 0 && <p className="text-sm text-text-muted">Sin mensajes.</p>}
              <div className="space-y-1">
                {chat.map((m) => (
                  <p key={m.id} className="text-sm text-text"><span className="font-bold">{m.display_name || 'Alumno'}:</span> {m.message}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
