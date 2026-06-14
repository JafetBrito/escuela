import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { hydrateFromLocalStorage, startAutoSave } from './services/persistence/autoSave'
import { useAuthStore } from './stores/useAuthStore'

hydrateFromLocalStorage()
startAutoSave()
useAuthStore.getState().init()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
