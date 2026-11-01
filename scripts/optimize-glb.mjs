// Comprime .glb para la web: quita duplicados, suelda vértices, texturas a WebP (máx. 1024 px) y geometría con meshopt.
// Uso: node scripts/optimize-glb.mjs <entrada.glb> <salida.glb>      (three/drei decodifican meshopt y WebP solos)
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, prune, weld, textureCompress, meshopt, resample } from '@gltf-transform/functions'
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer'
import sharp from 'sharp'

const [inp, out] = process.argv.slice(2)
if (!inp || !out) { console.error('uso: node scripts/optimize-glb.mjs entrada.glb salida.glb'); process.exit(1) }
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready])
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder })
const doc = await io.read(inp)
await doc.transform(dedup(), prune(), weld(), resample(), textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 82 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }))
await io.write(out, doc)
console.log('listo:', out)
