// Notificación a nivel de sistema (aparece en la bandeja del teléfono/SO, no
// solo dentro de la pestaña) usando la Notification API del navegador — sin
// service worker propio: basta con que la pestaña/PWA siga abierta (en
// primer o segundo plano). Un push que llegue con la app totalmente cerrada
// necesitaría Web Push + VAPID + un servidor que dispare el envío — eso es
// infraestructura aparte, no está cubierto aquí.
export async function requestPushPermission() {
  try {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  } catch {
    return false
  }
}

export function showSystemNotification({ title, body, url }) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    // Si el usuario ya tiene la pestaña activa y enfocada, el ping+voz que ya
    // suenan (ver useNotificationsStore.js) son suficiente — el aviso de
    // sistema es sobre todo para cuando el teléfono está bloqueado o en otra app.
    if (document.visibilityState === 'visible' && document.hasFocus()) return
    const n = new Notification(title, { body, icon: '/pwa-192.png', tag: url || title })
    n.onclick = () => {
      window.focus()
      if (url) window.location.href = url
      n.close()
    }
  } catch {
    // Best-effort — degrada en silencio si el navegador lo bloquea/no lo soporta.
  }
}
