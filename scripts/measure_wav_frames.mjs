// Lee la duración real de cada .wav (parseando el header RIFF/WAVE a mano —
// no hay ffprobe en este entorno) y la convierte a frames a 30fps + ~15 de
// colchón, mismo criterio que ya usan LeccionAnatomiaPrompt.jsx y
// LeccionComoPiensaIA.jsx. Uso: node scripts/measure_wav_frames.mjs id1 id2 ...
import { readFileSync } from 'node:fs'
import path from 'node:path'

const ids = process.argv.slice(2)
const dir = path.join(process.cwd(), 'remotion', 'public', 'audio')

function wavDurationSeconds(filePath) {
  const buf = readFileSync(filePath)
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`No es un WAV válido: ${filePath}`)
  }
  let offset = 12
  let byteRate = null
  let dataSize = null
  while (offset < buf.length - 8) {
    const chunkId = buf.toString('ascii', offset, offset + 4)
    const chunkSize = buf.readUInt32LE(offset + 4)
    if (chunkId === 'fmt ') {
      byteRate = buf.readUInt32LE(offset + 16)
    } else if (chunkId === 'data') {
      dataSize = chunkSize
    }
    offset += 8 + chunkSize + (chunkSize % 2)
  }
  if (!byteRate || !dataSize) throw new Error(`No se encontraron chunks fmt/data en: ${filePath}`)
  return dataSize / byteRate
}

const FPS = 30
const PADDING_FRAMES = 15

for (const id of ids) {
  const filePath = path.join(dir, `${id}.wav`)
  const seconds = wavDurationSeconds(filePath)
  const frames = Math.ceil(seconds * FPS) + PADDING_FRAMES
  console.log(`${id}: ${seconds.toFixed(2)}s -> ${frames} frames`)
}
