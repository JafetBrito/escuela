// Loader hook usado solo por generate-course-seed.mjs: los archivos de curso
// se escriben con imports sin extensión (`./glossaryRegistry`), que Vite
// resuelve solo pero Node plano no. Este hook prueba con `.js` agregado
// antes de rendirse.
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && !path.extname(specifier) && context.parentURL) {
    const base = fileURLToPath(context.parentURL)
    const candidate = path.join(path.dirname(base), `${specifier}.js`)
    if (existsSync(candidate)) {
      return nextResolve(pathToFileURL(candidate).href, context)
    }
  }
  return nextResolve(specifier, context)
}
