import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import Flipbook3D from '../flipbook/Flipbook3D'

// Admin-only sandbox to try the in-house 3D flipbook (Flipbook3D) against
// any PDF before wiring it into a real lesson/library book — same
// "isAdmin?.() or 403 card" gate used by AdminSetupPage.
export default function FlipbookTestPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const [fileUrl, setFileUrl] = useState(null)

  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl) }, [fileUrl])

  if (!isAdmin?.()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text">
        <div className="rounded-3xl border border-danger/30 bg-danger/10 p-8 text-center">
          <p className="text-4xl mb-3">🚫</p>
          <p className="font-black text-text">Solo para administradores</p>
          <p className="text-sm text-text-muted mt-1">Tu cuenta no tiene permisos de admin.</p>
        </div>
      </div>
    )
  }

  const handlePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    setFileUrl(URL.createObjectURL(file))
  }

  return (
    <div className="min-h-screen bg-background p-6 text-text">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-black">📖 Flipbook 3D — laboratorio</h1>
        <p className="mt-1 text-sm text-text-muted">
          Prueba aquí el visor de libro 3D antes de usarlo en una clase o en la biblioteca.
          Solo tú (admin) puedes ver esta página.
        </p>

        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface/70">
          📂 Elegir un PDF
          <input type="file" accept="application/pdf" onChange={handlePick} className="hidden" />
        </label>

        <div className="mt-5">
          {fileUrl ? (
            <Flipbook3D src={fileUrl} className="w-full" />
          ) : (
            <p className="text-sm text-text-muted">Elige un PDF para verlo como libro 3D.</p>
          )}
        </div>
      </div>
    </div>
  )
}
