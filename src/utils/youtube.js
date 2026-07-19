// Extrae el id de 11 caracteres de una URL de YouTube (watch?v=, youtu.be/,
// shorts/, embed/) — si ya recibe un id crudo (sin dominio), lo regresa tal cual.
export function extractYouTubeId(input) {
  const raw = (input || '').trim()
  if (!raw) return null
  const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)
  if (match) return match[1]
  return /^[\w-]{11}$/.test(raw) ? raw : null
}
