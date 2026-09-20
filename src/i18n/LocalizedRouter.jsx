import { useEffect, useMemo, useState } from 'react'
import { Router, parsePath, createPath } from 'react-router-dom'
import { useLocaleStore } from './index'
import { toCanonical, toLocalized } from './routes'

// Reemplazo de <BrowserRouter> que traduce SOLO la barra de direcciones.
// La app entera (rutas, <Link>, navigate, useLocation) ve rutas canónicas en
// español; al escribir en el historial del navegador se convierten al idioma
// actual (/mascota → /pet en inglés), y al leer la URL se vuelven a español.
// Un enlace en cualquier idioma (/pet o /mascota) abre la misma página, y al
// cambiar de idioma la URL visible se actualiza sin recargar.
const readLocation = () => ({
  pathname: toCanonical(window.location.pathname),
  search: window.location.search,
  hash: window.location.hash,
  state: window.history.state?.usr ?? null,
  key: window.history.state?.key ?? 'default',
})

const toPath = (to) => (typeof to === 'string' ? parsePath(to) : to)

export default function LocalizedRouter({ children }) {
  const lang = useLocaleStore((s) => s.lang)
  const [location, setLocation] = useState(readLocation)

  useEffect(() => {
    const onPop = () => setLocation(readLocation())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Cambio de idioma (o primera carga con una URL en otro idioma): la barra se
  // reescribe sin agregar entradas al historial.
  useEffect(() => {
    const wanted = toLocalized(location.pathname, lang) + location.search + location.hash
    if (wanted !== window.location.pathname + window.location.search + window.location.hash) {
      window.history.replaceState(window.history.state, '', wanted)
    }
  }, [lang, location])

  const navigator = useMemo(() => {
    const href = (to) => {
      const p = toPath(to)
      return createPath({ ...p, pathname: toLocalized(p.pathname ?? '/', lang) })
    }
    const go = (method) => (to, state) => {
      const p = toPath(to)
      const key = Math.random().toString(36).slice(2, 10)
      window.history[method]({ usr: state ?? null, key }, '', href(p))
      setLocation({ pathname: p.pathname ?? '/', search: p.search ?? '', hash: p.hash ?? '', state: state ?? null, key })
    }
    return {
      createHref: href,
      encodeLocation: (to) => { const p = toPath(to); return { pathname: p.pathname ?? '', search: p.search ?? '', hash: p.hash ?? '' } },
      push: go('pushState'),
      replace: go('replaceState'),
      go: (n) => window.history.go(n),
    }
  }, [lang])

  return <Router location={location} navigator={navigator}>{children}</Router>
}
