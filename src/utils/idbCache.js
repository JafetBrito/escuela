// Caché clave-valor mínima sobre IndexedDB (sin dependencias). Sirve para guardar
// respuestas grandes (como la tabla de cursos con todas sus lecciones) que no caben
// cómodamente en localStorage. Todo falla en silencio: sin IndexedDB (modo privado,
// permisos) simplemente no hay caché y la app se comporta como antes.
const DB = 'oliver-cache'
const STORE = 'kv'

function open() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('sin IndexedDB'))
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function cacheGet(key) {
  try {
    const db = await open()
    return await new Promise((resolve) => {
      const req = db.transaction(STORE).objectStore(STORE).get(key)
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror = () => resolve(null)
    })
  } catch { return null }
}

export async function cacheSet(key, value) {
  try {
    const db = await open()
    await new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(value, key)
      tx.oncomplete = resolve
      tx.onerror = resolve
    })
  } catch { /* sin caché */ }
}
