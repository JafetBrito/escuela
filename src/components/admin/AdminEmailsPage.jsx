import { useEffect, useMemo, useState } from 'react'
import AdminShell from './AdminShell'
import { useAuthStore } from '../../stores/useAuthStore'
import { useAdminUsersStore } from '../../stores/useAdminUsersStore'
import { useEmailStore } from '../../stores/useEmailStore'
import { emailTemplates as starterTemplates } from '../../data/emailTemplates'

// Herramienta de correo masivo HTML del admin. Compone un correo (asunto +
// HTML crudo, sin editor WYSIWYG — ver embedHtml en AdminCoursesPage.jsx
// para el mismo criterio de "un <textarea> basta"), elige destinatarios de
// la base de alumnos/profesores, y lo manda por la Edge Function
// send-email/ (SMTP de Gmail del lado del servidor, esta página nunca ve ni
// maneja la contraseña).

function RoleBadge({ role }) {
  const styles = {
    admin: 'bg-purple-500/15 text-purple-400',
    teacher: 'bg-blue-500/15 text-blue-400',
    student: 'bg-emerald-500/15 text-emerald-400',
  }
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${styles[role] ?? 'bg-surface-hover text-text-muted'}`}>
      {role}
    </span>
  )
}

function RecipientPicker({ profiles, selectedIds, setSelectedIds, extraEmails, setExtraEmails }) {
  const [extraInput, setExtraInput] = useState('')
  const students = profiles.filter((p) => p.role === 'student')
  const teachers = profiles.filter((p) => p.role === 'teacher')

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = (list, on) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      list.forEach((p) => (on ? next.add(p.id) : next.delete(p.id)))
      return next
    })
  }

  const addExtraEmail = () => {
    const email = extraInput.trim()
    if (!email || !email.includes('@')) return
    if (!extraEmails.includes(email)) setExtraEmails((prev) => [...prev, email])
    setExtraInput('')
  }

  const removeExtraEmail = (email) => {
    setExtraEmails((prev) => prev.filter((e) => e !== email))
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Destinatarios</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => selectAll(students, students.some((p) => !selectedIds.has(p.id)))}
          className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/25"
        >
          Todos los alumnos ({students.length})
        </button>
        <button
          type="button"
          onClick={() => selectAll(teachers, teachers.some((p) => !selectedIds.has(p.id)))}
          className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/25"
        >
          Todos los profesores ({teachers.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedIds(new Set())}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text-muted hover:bg-surface-hover"
        >
          Limpiar selección
        </button>
      </div>

      <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-border/60 p-2">
        {profiles.length === 0 && <p className="p-2 text-sm text-text-muted">Cargando personas…</p>}
        {profiles.map((p) => (
          <label
            key={p.id}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-hover"
          >
            <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggle(p.id)} className="shrink-0" />
            <span className="min-w-0 flex-1 truncate text-sm text-text">{p.display_name || p.email}</span>
            <span className="shrink-0 truncate text-xs text-text-muted">{p.email}</span>
            <RoleBadge role={p.role} />
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Correo extra (no está en la lista)</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={extraInput}
            onChange={(e) => setExtraInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExtraEmail())}
            placeholder="correo@ejemplo.com"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <button type="button" onClick={addExtraEmail} className="shrink-0 rounded-lg bg-primary/20 px-3 py-2 text-xs font-bold text-primary">
            Añadir
          </button>
        </div>
        {extraEmails.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {extraEmails.map((email) => (
              <span key={email} className="flex items-center gap-1.5 rounded-full bg-surface-hover px-2.5 py-1 text-xs text-text">
                {email}
                <button type="button" onClick={() => removeExtraEmail(email)} className="font-bold text-danger">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TemplatePicker({ savedTemplates, onLoad, onSaveAsTemplate, onDelete }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Plantillas</p>
      <div className="flex flex-wrap gap-2">
        {starterTemplates.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onLoad(tpl)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text hover:bg-surface-hover"
          >
            {tpl.name}
          </button>
        ))}
        {savedTemplates.map((tpl) => (
          <span key={tpl.id} className="flex items-center gap-1 rounded-lg border border-border/60 pl-3 pr-1 py-1">
            <button type="button" onClick={() => onLoad(tpl)} className="text-xs font-bold text-text hover:text-primary">
              {tpl.name}
            </button>
            <button
              type="button"
              onClick={() => onDelete(tpl.id)}
              title="Eliminar plantilla"
              className="rounded px-1.5 py-0.5 text-xs font-bold text-danger hover:bg-danger/10"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={onSaveAsTemplate}
        className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/25"
      >
        Guardar como plantilla
      </button>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = status === 'sent' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-danger/15 text-danger'
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${styles}`}>{status === 'sent' ? 'Enviado' : 'Falló'}</span>
}

function CampaignHistory({ campaigns }) {
  return (
    <div className="space-y-2 rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Correos enviados</p>
      {campaigns.length === 0 ? (
        <p className="text-sm text-text-muted">Todavía no se ha enviado ningún correo.</p>
      ) : (
        <div className="space-y-2">
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-xl border border-border/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="min-w-0 truncate font-bold text-text">{c.subject}</p>
                <StatusBadge status={c.status} />
              </div>
              <p className="mt-0.5 text-xs text-text-muted">
                {new Date(c.created_at).toLocaleString()} · {c.recipient_count} destinatario{c.recipient_count === 1 ? '' : 's'}
              </p>
              {c.status === 'failed' && c.error_message && <p className="mt-1 text-xs text-danger">{c.error_message}</p>}
              <p className="mt-1 truncate text-xs text-text-muted/80">{c.html_content.replace(/<[^>]+>/g, ' ').slice(0, 140)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminEmailsPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const allProfilesForEmail = useAdminUsersStore((s) => s.allProfilesForEmail)
  const fetchAllProfilesForEmail = useAdminUsersStore((s) => s.fetchAllProfilesForEmail)

  const templates = useEmailStore((s) => s.templates)
  const campaigns = useEmailStore((s) => s.campaigns)
  const signature = useEmailStore((s) => s.signature)
  const sending = useEmailStore((s) => s.sending)
  const fetchTemplates = useEmailStore((s) => s.fetchTemplates)
  const saveTemplate = useEmailStore((s) => s.saveTemplate)
  const deleteTemplate = useEmailStore((s) => s.deleteTemplate)
  const fetchCampaigns = useEmailStore((s) => s.fetchCampaigns)
  const fetchSignature = useEmailStore((s) => s.fetchSignature)
  const saveSignature = useEmailStore((s) => s.saveSignature)
  const sendEmail = useEmailStore((s) => s.sendEmail)

  const [selectedIds, setSelectedIds] = useState(new Set())
  const [extraEmails, setExtraEmails] = useState([])
  const [subject, setSubject] = useState('')
  const [html, setHtml] = useState('')
  const [signatureDraft, setSignatureDraft] = useState('')
  const [loadedSignature, setLoadedSignature] = useState('')
  const [sendResult, setSendResult] = useState(null) // { ok: boolean, message: string }
  const [signatureMsg, setSignatureMsg] = useState('')

  useEffect(() => {
    if (!isAdmin?.()) return
    fetchAllProfilesForEmail()
    fetchTemplates()
    fetchCampaigns()
    fetchSignature()
  }, [isAdmin, fetchAllProfilesForEmail, fetchTemplates, fetchCampaigns, fetchSignature])

  // Sincroniza el borrador de la firma con lo que llega de la base de datos
  // sin un useEffect dedicado (evita el cascading-render que marca
  // react-hooks/set-state-in-effect) — ajuste de estado durante el render,
  // el patrón que recomienda la documentación de React para "adjusting state
  // when a prop changes".
  if (signature !== loadedSignature) {
    setLoadedSignature(signature)
    setSignatureDraft(signature)
  }

  const recipientEmails = useMemoRecipients(allProfilesForEmail, selectedIds, extraEmails)

  if (!isAdmin?.()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
        Acceso restringido a administradores.
      </div>
    )
  }

  const loadTemplate = (tpl) => {
    const hasContent = subject.trim() || html.trim()
    if (hasContent && !window.confirm('Esto reemplazará el asunto y el HTML actuales. ¿Continuar?')) return
    setSubject(tpl.subject)
    setHtml(tpl.html ?? tpl.html_content ?? '')
  }

  const handleSaveAsTemplate = async () => {
    if (!subject.trim() || !html.trim()) {
      window.alert('Escribe un asunto y contenido antes de guardar la plantilla.')
      return
    }
    const name = window.prompt('Nombre de la plantilla:')
    if (!name?.trim()) return
    const { error } = await saveTemplate({ name: name.trim(), subject, html_content: html })
    if (error) window.alert(`No se pudo guardar la plantilla: ${error.message}`)
  }

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('¿Eliminar esta plantilla guardada?')) return
    await deleteTemplate(id)
  }

  const handleSaveSignature = async () => {
    setSignatureMsg('')
    const { error } = await saveSignature(signatureDraft)
    setSignatureMsg(error ? `❌ ${error.message}` : '✅ Firma guardada.')
  }

  const handleSend = async () => {
    if (!subject.trim() || !html.trim()) {
      window.alert('Escribe un asunto y el contenido del correo antes de enviar.')
      return
    }
    if (recipientEmails.length === 0) {
      window.alert('Selecciona al menos un destinatario.')
      return
    }
    const confirmed = window.confirm(
      `Vas a enviar este correo a ${recipientEmails.length} destinatario${recipientEmails.length === 1 ? '' : 's'} real${recipientEmails.length === 1 ? '' : 'es'}. Esta acción no se puede deshacer. ¿Confirmas el envío?`
    )
    if (!confirmed) return

    setSendResult(null)
    const { data, error } = await sendEmail({ subject, html, recipientEmails })
    if (error) {
      setSendResult({ ok: false, message: error.message || 'No se pudo enviar el correo.' })
    } else {
      setSendResult({ ok: true, message: `Correo enviado a ${data?.sent ?? recipientEmails.length} destinatarios.` })
    }
  }

  const previewSrcDoc = signature ? `${html}\n${signature}` : html

  return (
    <AdminShell>
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 shadow-lg">
          <h1 className="text-3xl font-extrabold text-white">📧 Correos</h1>
          <p className="mt-1 text-sm font-medium text-white/85">
            Redacta un correo HTML, elige destinatarios de la base de datos y envíalo desde la cuenta de Gmail configurada.
          </p>
        </div>

        <RecipientPicker
          profiles={allProfilesForEmail}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          extraEmails={extraEmails}
          setExtraEmails={setExtraEmails}
        />

        <TemplatePicker
          savedTemplates={templates}
          onLoad={loadTemplate}
          onSaveAsTemplate={handleSaveAsTemplate}
          onDelete={handleDeleteTemplate}
        />

        <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Redactar correo</p>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Asunto del correo"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold text-text outline-none focus:border-primary"
          />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="HTML del correo…"
              rows={16}
              className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-text outline-none focus:border-primary"
            />
            <div className="overflow-hidden rounded-lg border border-border bg-white">
              <iframe title="Vista previa del correo" srcDoc={previewSrcDoc} className="h-[26rem] w-full" sandbox="" />
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Firma (se agrega al final de cada correo)</p>
          <textarea
            value={signatureDraft}
            onChange={(e) => setSignatureDraft(e.target.value)}
            rows={4}
            placeholder="HTML de la firma…"
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-text outline-none focus:border-primary"
          />
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleSaveSignature} className="rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary">
              Guardar firma
            </button>
            {signatureMsg && <p className="text-xs text-text-muted">{signatureMsg}</p>}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-bold text-text">
            Enviando a <span className="text-primary">{recipientEmails.length}</span> destinatario{recipientEmails.length === 1 ? '' : 's'}.
          </p>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-background disabled:opacity-50"
          >
            {sending ? 'Enviando…' : 'Enviar correo'}
          </button>
          {sendResult && (
            <p className={`text-sm font-semibold ${sendResult.ok ? 'text-emerald-400' : 'text-danger'}`}>
              {sendResult.ok ? '✅ ' : '❌ '}
              {sendResult.message}
            </p>
          )}
        </div>

        <CampaignHistory campaigns={campaigns} />
      </div>
    </AdminShell>
  )
}

// Junta los emails de los perfiles seleccionados + los correos extra
// manuales, sin duplicados. Se separa en un hook chico para no repetir la
// lógica de dedup inline en el render.
function useMemoRecipients(profiles, selectedIds, extraEmails) {
  return useMemo(() => {
    const fromProfiles = profiles.filter((p) => selectedIds.has(p.id)).map((p) => p.email)
    return Array.from(new Set([...fromProfiles, ...extraEmails]))
  }, [profiles, selectedIds, extraEmails])
}
