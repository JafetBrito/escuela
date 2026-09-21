import { useLocaleStore } from './i18n'
import { loadDataDictionary } from './i18n/data-runtime'

// El contenido traducido (lecciones, preguntas, tienda…) se resuelve cuando se
// EVALÚAN los módulos de datos, así que el diccionario del idioma tiene que
// estar cargado antes de importar el resto de la app (ver data-runtime.js).
loadDataDictionary(useLocaleStore.getState().lang)
  .catch((e) => console.error('[i18n] no se pudo cargar el contenido traducido', e))
  .then(() => import('./bootstrap.jsx'))
