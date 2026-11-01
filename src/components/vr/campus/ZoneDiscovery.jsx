import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { tr } from '../../../i18n'
import { useDiscoveryStore } from '../../../stores/useDiscoveryStore'

// Vigila las zonas descubribles del mapa (items `zone`): la primera vez que el jugador entra a una, ¡descubierta + XP!
export function ZoneWatcher({ map, zones, playerPositionRef }) {
  const tick = useRef(0)
  useFrame(() => {
    if (++tick.current % 12) return
    const p = playerPositionRef.current
    if (!p) return
    for (const z of zones) if (Math.hypot(p.x - z.x, p.z - z.z) < z.r) useDiscoveryStore.getState().discover(map, z.name, z.xp)
  })
  return null
}

// Cartel "Descubriste: ..." (DOM, arriba al centro).
export function ZoneToast() {
  const toast = useDiscoveryStore((s) => s.toast)
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => useDiscoveryStore.getState().clearToast(), 4200)
    return () => clearTimeout(t)
  }, [toast])
  if (!toast) return null
  return (
    <div className="pointer-events-none absolute left-1/2 top-[72px] z-30 -translate-x-1/2 text-center">
      <div className="rounded-xl border border-amber-300/60 bg-black/70 px-5 py-2 shadow-xl backdrop-blur">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">{tr('Zona descubierta', 'Zone discovered')}</div>
        <div className="text-lg font-extrabold text-white">{toast.name}</div>
        {toast.xp > 0 && <div className="text-xs font-semibold text-emerald-300">+{toast.xp} XP</div>}
      </div>
    </div>
  )
}
