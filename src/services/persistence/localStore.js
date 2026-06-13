const STORAGE_KEY = 'oliver-school-account'

// Saves the full account snapshot to the browser's localStorage so progress,
// license and settings survive page reloads without any manual export.
export function saveLocalSnapshot(snapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Storage unavailable/full — silently skip, manual export still works.
  }
}

export function loadLocalSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
