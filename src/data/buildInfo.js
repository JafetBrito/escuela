// Build metadata injected by vite.config.js from git at build time. This is
// the single source of truth for "which version am I running" — the commit
// message here becomes the top entry on the tablón de anuncios automatically,
// so every commit self-documents with no manual patch-notes editing.
export const BUILD_INFO = {
  number: typeof __BUILD_NUMBER__ !== 'undefined' ? __BUILD_NUMBER__ : '0',
  message: typeof __COMMIT_MESSAGE__ !== 'undefined' ? __COMMIT_MESSAGE__ : '',
  date: typeof __COMMIT_DATE__ !== 'undefined' ? __COMMIT_DATE__ : '',
  hash: typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : '',
}

// Synthetic announcement built from the current commit. Shaped exactly like a
// row from `school_announcements` so it drops straight into the existing
// tablón UI (AnnouncementsPage + dashboard card) with no special-casing beyond
// the `synthetic` flag, which hides admin delete/pin controls (there's no DB
// row to act on). Returns null when there's no commit message (no git at build).
export function buildAnnouncement() {
  if (!BUILD_INFO.message) return null
  return {
    id: 'build-current',
    synthetic: true,
    pinned: true,
    icon: '🚀',
    category: 'general',
    title: `Versión #${BUILD_INFO.number} — ${BUILD_INFO.message}`,
    body: `Última actualización publicada.${BUILD_INFO.hash ? ` (${BUILD_INFO.hash})` : ''}`,
    created_at: BUILD_INFO.date || new Date().toISOString(),
  }
}
