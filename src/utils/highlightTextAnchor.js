// Subrayado de texto persistente sobre HTML que se re-renderiza desde cero
// en cada montaje (dangerouslySetInnerHTML en TextLesson.jsx) — un DOM
// Range no sobrevive a eso, así que un subrayado se guarda como algo que se
// pueda volver a ENCONTRAR en el HTML recién inyectado, no como una
// referencia al DOM. Mismo patrón que el TextQuoteSelector del W3C Web
// Annotation Data Model: el texto exacto (`quote`) más contexto antes/
// después (`prefix`/`suffix`), para ubicarlo aunque la misma frase aparezca
// más de una vez en la clase.

export const HIGHLIGHT_COLORS = [
  { id: 'yellow', hex: '#facc15' },
  { id: 'green', hex: '#4ade80' },
  { id: 'blue', hex: '#60a5fa' },
  { id: 'pink', hex: '#f472b6' },
  { id: 'orange', hex: '#fb923c' },
]

const CONTEXT_CHARS = 40

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function highlightBackground(colorId) {
  const color = HIGHLIGHT_COLORS.find((c) => c.id === colorId) ?? HIGHLIGHT_COLORS[0]
  return hexToRgba(color.hex, 0.35)
}

// Offset (en el texto plano de `container`) del punto límite (node, offset)
// de un Range — se apoya en Range.toString(), que ya resuelve correctamente
// si `node` es un nodo de texto (offset = caracteres) o un elemento (offset
// = índice de hijo), en vez de reimplementar esa lógica a mano.
function textOffsetOfBoundary(container, node, offset) {
  const preRange = document.createRange()
  preRange.selectNodeContents(container)
  preRange.setEnd(node, offset)
  return preRange.toString().length
}

// Se llama con el Range todavía vivo (justo al elegir un color en el menú de
// selección) — devuelve lo que hay que guardar en Supabase para poder
// volver a encontrar este mismo texto después.
export function describeRange(container, range) {
  try {
    const startOffset = textOffsetOfBoundary(container, range.startContainer, range.startOffset)
    const endOffset = textOffsetOfBoundary(container, range.endContainer, range.endOffset)
    const text = container.textContent ?? ''
    const quote = text.slice(startOffset, endOffset)
    if (!quote.trim()) return null
    return {
      quote,
      prefix: text.slice(Math.max(0, startOffset - CONTEXT_CHARS), startOffset),
      suffix: text.slice(endOffset, endOffset + CONTEXT_CHARS),
    }
  } catch {
    return null
  }
}

// Mapa texto-plano → nodo de texto real, para poder traducir un offset de
// vuelta a un punto concreto del DOM (la dirección opuesta a
// textOffsetOfBoundary, que no tiene un truco nativo equivalente).
function buildTextMap(container) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null)
  const segments = []
  let text = ''
  let node
  while ((node = walker.nextNode())) {
    const value = node.nodeValue ?? ''
    segments.push({ node, start: text.length, end: text.length + value.length })
    text += value
  }
  return { text, segments }
}

function findQuoteOffset(text, quote, prefix, suffix) {
  const withContext = (prefix ?? '') + quote + (suffix ?? '')
  const idx = text.indexOf(withContext)
  if (idx !== -1) return idx + (prefix?.length ?? 0)
  // El contexto ya no calza (la clase se editó) — mejor esfuerzo: primera
  // aparición de la frase sola.
  return text.indexOf(quote)
}

function segmentAt(segments, offset) {
  return segments.find((s) => offset >= s.start && offset <= s.end)
}

// Todos los nodos de texto intersectados por `range`, en orden — un Range
// que cruza varios nodos (ej. texto que atraviesa un <strong>) no se puede
// envolver de una sola vez con range.surroundContents().
function collectTextNodesInRange(range) {
  const root = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
    ? range.commonAncestorContainer.parentNode
    : range.commonAncestorContainer
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
  const result = []
  let collecting = false
  let node
  while ((node = walker.nextNode())) {
    if (node === range.startContainer) collecting = true
    if (collecting) result.push(node)
    if (node === range.endContainer) break
  }
  return result
}

// Busca `quote` (con `prefix`/`suffix` de contexto) dentro del HTML recién
// renderizado de `container` y lo envuelve en uno o más <mark
// data-highlight-id data-color>. Nunca lanza — cualquier fallo de búsqueda o
// de DOM se traduce en "este subrayado no se pudo volver a dibujar", nunca
// rompe la página.
export function applyHighlight(container, { quote, prefix, suffix }, { id, color }) {
  try {
    if (!container || !quote || !id) return false
    const { text, segments } = buildTextMap(container)
    const startOffset = findQuoteOffset(text, quote, prefix, suffix)
    if (startOffset === -1) return false
    const endOffset = startOffset + quote.length

    const startSeg = segmentAt(segments, startOffset)
    const endSeg = segmentAt(segments, endOffset)
    if (!startSeg || !endSeg) return false

    // Parte el nodo de inicio exactamente en el borde del subrayado.
    const startLocal = startOffset - startSeg.start
    let startNode = startSeg.node
    if (startLocal > 0) startNode = startNode.splitText(startLocal)

    // Si el borde final cae en el MISMO nodo original que el de inicio, el
    // split de arriba ya movió ese contenido a `startNode` — el offset local
    // del final hay que recalcularlo contra `startNode`, no contra el nodo
    // original.
    let endNode
    let endLocal
    if (endSeg.node === startSeg.node && startLocal > 0) {
      endNode = startNode
      endLocal = endOffset - (startSeg.start + startLocal)
    } else {
      endNode = endSeg.node
      endLocal = endOffset - endSeg.start
    }
    if (endLocal < (endNode.nodeValue?.length ?? 0)) endNode.splitText(endLocal)

    const range = document.createRange()
    range.setStart(startNode, 0)
    range.setEnd(endNode, endNode.nodeValue.length)

    const textNodes = collectTextNodesInRange(range)
    if (textNodes.length === 0) return false

    const background = highlightBackground(color)
    textNodes.forEach((textNode) => {
      const mark = document.createElement('mark')
      mark.dataset.highlightId = id
      mark.dataset.color = color ?? 'yellow'
      mark.style.backgroundColor = background
      mark.style.borderRadius = '2px'
      mark.style.cursor = 'pointer'
      textNode.parentNode.insertBefore(mark, textNode)
      mark.appendChild(textNode)
    })
    return true
  } catch {
    return false
  }
}

// Deshace un subrayado en el DOM en vivo (varios <mark> pueden compartir el
// mismo data-highlight-id si el texto cruzaba varios nodos) — reemplaza cada
// <mark> por su propio texto y normaliza los nodos vecinos.
export function removeHighlightMarks(container, id) {
  if (!container || !id) return
  const marks = container.querySelectorAll(`mark[data-highlight-id="${id}"]`)
  marks.forEach((mark) => {
    const parent = mark.parentNode
    if (!parent) return
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
    parent.removeChild(mark)
    parent.normalize()
  })
}
