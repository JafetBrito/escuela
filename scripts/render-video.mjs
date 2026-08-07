// Renderiza una composición de Remotion a mp4, forzando publicDir a
// remotion/public explícitamente (evita que tome public/ del sitio, que
// pesa cientos de MB por los modelos 3D/videos de los cursos).
// Uso: node scripts/render-video.mjs <CompositionId> <archivo-salida.mp4>
import path from 'node:path'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'

const [, , compositionId, outputFile] = process.argv
if (!compositionId || !outputFile) {
  console.error('Uso: node scripts/render-video.mjs <CompositionId> <salida.mp4>')
  process.exit(1)
}

const bundleLocation = await bundle({
  entryPoint: path.resolve('remotion/index.js'),
  publicDir: path.resolve('remotion/public'),
})

const composition = await selectComposition({ serveUrl: bundleLocation, id: compositionId })

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: 'h264',
  outputLocation: path.resolve(outputFile),
  onProgress: ({ progress }) => {
    process.stdout.write(`\rRenderizando: ${Math.round(progress * 100)}%   `)
  },
})

console.log('\nListo:', outputFile)
