// Modelos .glb propios del campus: todo lo que pongas en src/assets/campus/ aparece en la paleta del editor.
// El layout guarda solo el NOMBRE del archivo (la URL real cambia en cada build).
const FILES = import.meta.glob('../../../assets/campus/*.glb', { query: '?url', import: 'default', eager: true })
const byName = Object.fromEntries(Object.entries(FILES).map(([path, url]) => [path.split('/').pop(), url]))
export const GLB_FILES = Object.keys(byName)
export const glbUrl = (file) => byName[file] || ''
