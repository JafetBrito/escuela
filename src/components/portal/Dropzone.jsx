import { useCallback, useRef, useState } from 'react'

export default function Dropzone({ onFile }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFiles = useCallback(
    (files) => {
      const file = files?.[0]
      if (file) onFile(file)
    },
    [onFile],
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
        isDragging
          ? 'border-primary bg-primary/10'
          : 'border-border bg-background hover:border-primary/50'
      }`}
    >
      <span className="text-4xl">🔑</span>
      <p className="font-semibold">
        Arrastra tu archivo <code className="font-mono">license.key</code>
      </p>
      <p className="text-sm text-text-muted">o haz clic para seleccionarlo</p>
      <input
        ref={inputRef}
        type="file"
        accept=".key,.json,application/json"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
