// Datos del responsable que aparecen en /privacidad y /terminos. Se llenan UNA vez
// aquí; las páginas legales los leen de este archivo. Mientras un valor sea null
// la página muestra un aviso visible en vez de inventar un dato.
export const LEGAL = {
  name: null,          // Nombre completo de la persona (o razón social) responsable
  taxId: null,         // RFC (México) / NIF (España) / número de negocio (Canadá) — opcional pero recomendable
  address: null,       // Domicilio para recibir notificaciones (obligatorio en México y España)
  email: null,         // Correo de contacto para derechos ARCO / RGPD / PIPEDA
  updated: '26 de septiembre de 2026',
}

export const legalMissing = () => Object.entries(LEGAL).filter(([k, v]) => k !== 'updated' && k !== 'taxId' && !v).map(([k]) => k)
