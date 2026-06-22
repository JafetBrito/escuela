import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { hydrateFromLocalStorage, startAutoSave } from './services/persistence/autoSave'
import { useAuthStore } from './stores/useAuthStore'

hydrateFromLocalStorage()
startAutoSave()
useAuthStore.getState().init()

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
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
