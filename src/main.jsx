import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { hydrateFromLocalStorage, startAutoSave, pushSnapshotToCloud } from './services/persistence/autoSave'
import { useAuthStore } from './stores/useAuthStore'
import { useSyncStatusStore } from './stores/useSyncStatusStore'
import { isSupabaseConfigured } from './services/supabase/client'

hydrateFromLocalStorage()
startAutoSave()
useAuthStore.getState().init()

// ponytail: temporary console hook to diagnose the cloud-save issue live in
// any environment (dev or prod build) without needing source maps — delete
// once Supabase persistence is confirmed working end to end.
window.__oliverDebug = {
  auth: () => useAuthStore.getState(),
  sync: () => useSyncStatusStore.getState(),
  supabaseConfigured: isSupabaseConfigured(),
  forceSave: () => pushSnapshotToCloud().then(() => useSyncStatusStore.getState()),
}

// Browsers only check for a new service worker on navigation, throttled to
// roughly once per day — without this, a tab left open (or just reopened
// the same day) keeps running whatever build was cached on its first visit,
// no matter how many times a new version gets deployed. Polling `update()`
// ourselves and reloading the moment a new one is ready is the documented
// fix for "site never updates" on PWAs like this one.
if (import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    const updateSW = registerSW({
      onRegisteredSW(_url, registration) {
        if (!registration) return
        setInterval(() => registration.update(), 60 * 1000)
      },
      onNeedRefresh() {
        updateSW(true)
      },
    })
  })
} else if ('serviceWorker' in navigator) {
  // ponytail: dev's PWA service worker used to cache the module graph and
  // mask code changes during local development — now disabled in
  // vite.config.js, this just cleans up any worker/cache left over from
  // before that fix so dev mode self-heals without a manual DevTools step.
  navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()))
  if (window.caches) caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)))
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
