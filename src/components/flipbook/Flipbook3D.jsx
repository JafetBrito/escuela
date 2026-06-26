import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

// How many pages around the current one get rendered to canvas at once.
// Keeps a 500-page PDF from rendering 500 canvases on load — only the pages
// the reader could plausibly flip to next get drawn; the rest show a
// lightweight skeleton until they're within range.
const RENDER_WINDOW = 2

// One page surface inside the flipbook. Renders its PDF page to a canvas
// lazily — only once `active` (within RENDER_WINDOW of the current page) —
// and keeps the rendered canvas around afterwards instead of re-drawing it
// every time the reader flips back and forth.
const FlipPage = forwardRef(function FlipPage({ pdfDoc, pageNumber, active }, ref) {
  const canvasRef = useRef(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (!active || rendered) return
    let cancelled = false
    pdfDoc.getPage(pageNumber).then((page) => {
      if (cancelled) return
      const viewport = page.getViewport({ scale: 1.6 })
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = viewport.width
      canvas.height = viewport.height
      page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise.then(() => {
        if (!cancelled) setRendered(true)
      })
    })
    return () => { cancelled = true }
  }, [active, rendered, pdfDoc, pageNumber])

  return (
    <div ref={ref} className="relative h-full w-full bg-white">
      <canvas ref={canvasRef} className="h-full w-full object-contain" />
      {!rendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-xs font-semibold text-neutral-400">
          {pageNumber}
        </div>
      )}
    </div>
  )
})

// 3D page-flip viewer for PDFs (and PDF-exported presentations) — the
// in-house replacement for the "DearFlip" WordPress plugin. Reusable
// anywhere a class/lesson needs to show a book/handout with a real page-turn
// feel instead of a flat iframe.
export default function Flipbook3D({ src, className = '' }) {
  const flipRef = useRef(null)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [numPages, setNumPages] = useState(0)
  const [pageSize, setPageSize] = useState({ width: 600, height: 800 })
  const [currentPage, setCurrentPage] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setPdfDoc(null)
    setError(null)
    pdfjsLib.getDocument(src).promise.then(async (doc) => {
      if (cancelled) return
      const firstPage = await doc.getPage(1)
      const viewport = firstPage.getViewport({ scale: 1 })
      if (cancelled) return
      setPageSize({ width: viewport.width, height: viewport.height })
      setNumPages(doc.numPages)
      setPdfDoc(doc)
    }).catch((err) => !cancelled && setError(err.message))
    return () => { cancelled = true }
  }, [src])

  const pages = useMemo(() => Array.from({ length: numPages }, (_, i) => i + 1), [numPages])

  if (error) {
    return (
      <div className={`flex items-center justify-center rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-danger ${className}`}>
        No se pudo abrir el PDF: {error}
      </div>
    )
  }

  if (!pdfDoc) {
    return (
      <div className={`flex items-center justify-center rounded-xl bg-surface p-8 text-center text-sm text-text-muted ${className}`}>
        Abriendo libro…
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl p-6 ${className}`}
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #2a2440, #0d0b16)' }}
    >
      <div style={{ filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.55))' }}>
        <HTMLFlipBook
          ref={flipRef}
          width={pageSize.width}
          height={pageSize.height}
          size="stretch"
          minWidth={280}
          maxWidth={900}
          minHeight={380}
          maxHeight={1200}
          showCover={false}
          maxShadowOpacity={0.5}
          mobileScrollSupport
          className="overflow-hidden rounded-md"
          onFlip={(e) => setCurrentPage(e.data)}
        >
          {pages.map((n) => (
            <FlipPage key={n} pageNumber={n} pdfDoc={pdfDoc} active={Math.abs(n - 1 - currentPage) <= RENDER_WINDOW} />
          ))}
        </HTMLFlipBook>
      </div>

      <div className="flex items-center gap-4 text-white/80">
        <button
          onClick={() => flipRef.current?.pageFlip().flipPrev()}
          aria-label="Página anterior"
          className="rounded-full bg-white/10 px-3 py-1.5 text-lg hover:bg-white/20"
        >
          ‹
        </button>
        <span className="text-xs font-semibold tabular-nums">
          {Math.min(currentPage + 1, numPages)} / {numPages}
        </span>
        <button
          onClick={() => flipRef.current?.pageFlip().flipNext()}
          aria-label="Página siguiente"
          className="rounded-full bg-white/10 px-3 py-1.5 text-lg hover:bg-white/20"
        >
          ›
        </button>
      </div>
    </div>
  )
}
