import { useRef, useState } from 'react'
import { downloadProgress, readProgressFile } from '../../services/persistence/jsonFile'
import { buildProgressSnapshot, applyProgressSnapshot } from '../../services/persistence/progressSnapshot'

export default function ProgressSync() {
  const fileInputRef = useRef(null)
  const [status, setStatus] = useState('')

  const handleSave = () => {
    downloadProgress(buildProgressSnapshot(), 'mi-llave.key')
    setStatus('Llave descargada')
    setTimeout(() => setStatus(''), 2000)
  }

  const handleLoad = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const snapshot = await readProgressFile(file)
      applyProgressSnapshot(snapshot)
      setStatus('Cuenta cargada')
    } catch {
      setStatus('Archivo de cuenta inválido')
    } finally {
      event.target.value = ''
      setTimeout(() => setStatus(''), 2000)
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={handleSave}
        className="rounded-lg border border-primary px-3 py-1.5 font-semibold text-primary transition-colors hover:bg-primary/10"
      >
        💾 Descargar llave actualizada
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="rounded-lg border border-border px-3 py-1.5 text-text-muted hover:border-primary/50 hover:text-text"
      >
        📂 Cargar otra cuenta
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleLoad}
      />
      {status && <span className="text-primary">{status}</span>}
    </div>
  )
}
