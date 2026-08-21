import { Link } from 'react-router-dom'
import Logo from '../shared/Logo'

// Layout mínimo y público (sin AppTopBar, que asume sesión) para Aviso de
// Privacidad y Términos de Uso — deben poder leerse ANTES de crear cuenta,
// desde /privacidad y /terminos, enlazados desde el pie de la landing y el
// formulario de registro (CreateAccountPage.jsx).
export default function LegalLayout({ title, updated, children }) {
  return (
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-1.5">
            <Logo />
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link to="/privacidad" className="text-text-muted hover:text-text">Privacidad</Link>
            <Link to="/terminos" className="text-text-muted hover:text-text">Términos</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-black text-text">{title}</h1>
        <p className="mt-1 text-xs text-text-muted">Última actualización: {updated}</p>
        <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-text">
          {children}
        </div>
      </main>
    </div>
  )
}

// Bloque de sección reutilizado por PrivacyPage/TermsPage — encabezado +
// contenido, con el mismo espaciado en ambas páginas.
export function LegalSection({ title, children }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-extrabold text-text">{title}</h2>
      <div className="space-y-2 text-text-muted">{children}</div>
    </section>
  )
}
