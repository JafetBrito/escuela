// Claves/lectura de localStorage del buzón (ver MailboxPage.jsx) —
// extraídas aquí para que el ícono del header (AppTopBar.jsx) pueda leer el
// conteo de no leídos sin duplicar la clave mágica en dos archivos.
export const MAILBOX_INBOX_KEY = 'oliver_mailbox_inbox'

export function getMailboxInbox() {
  try { return JSON.parse(localStorage.getItem(MAILBOX_INBOX_KEY) ?? '[]') } catch { return [] }
}

export function getUnreadMailCount() {
  return getMailboxInbox().filter((m) => !m.read).length
}
